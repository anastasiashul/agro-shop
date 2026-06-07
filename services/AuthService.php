<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../core/Logger.php';

use Respect\Validation\Validator as v;

class AuthService {
    private $userModel;
    
    public function __construct() {
        $this->userModel = new User();
    }
    
    public function register($username, $email, $name, $age, $password) {
        if (empty($username) || empty($email) || empty($name) || empty($password)) {
            return ['error' => 'All fields except age are required'];
        }
        
        if (!v::email()->validate($email)) {
            return ['error' => 'Неверный формат email'];
        }
        
        if (!v::stringType()->length(6, 100)->validate($password)) {
            return ['error' => 'Пароль должен быть не менее 6 символов'];
        }

        if (!v::stringType()->length(1, 32)->validate($username)) {
            return ['error' => 'Логин должен содержать 1-32 символа'];
        }

        if (!v::stringType()->length(1, 128)->validate($name)) {
            return ['error' => 'Имя должно содержать хотя бы 1 символ'];
        }

        if ($age !== null && $age !== '') {
            if (!is_numeric($age) || $age < 0 || $age > 150) {
                return ['error' => 'Age must be between 0 and 150'];
            }
            $age = (int)$age;
        } else {
            $age = null;
        }
        
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $result = $this->userModel->create($username, $email, $name, $age, $passwordHash);
        
        if (isset($result['error'])) {
            return $result;
        }
        
        Logger::log("New user registered: $username ($email)", 'REGISTER');
        return ['success' => true, 'user_id' => $result['id']];
    }
    
    public function login($username, $password) {
        if (empty($username) || empty($password)) {
            return ['error' => 'Username and password are required'];
        }
        
        $userData = $this->userModel->findByUsername($username);
        
        if (!$userData || !password_verify($password, $userData['user']['password_hash'])) {
            Logger::log("Failed login attempt for: $username", 'AUTH_FAIL');
            return ['error' => 'Invalid username or password'];
        }
        Logger::log("User logged in: $username (role: {$userData['user']['role']})", 'AUTH_SUCCESS');
        $expires = time() + 86400;
        $tokenData = $userData['id'] . ':' . $userData['user']['username'] . ':' . $userData['user']['role'] . ':' . $expires;
        $token = base64_encode($tokenData);
        
        return [
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $userData['id'],
                'username' => $userData['user']['username'],
                'role' => $userData['user']['role']
            ]
        ];
    }

    public function logout($user) {
        if ($user) {
            Logger::log("User logged out: {$user['username']}", 'LOGOUT');
        }
        return ['success' => true];
    }
    
    public static function getCurrentUser() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $token = str_replace('Bearer ', '', $authHeader);
        
        if (!$token) {
            return null;
        }
        
        $decoded = base64_decode($token);
        $parts = explode(':', $decoded);
        if (count($parts) === 4) {
            $expires = (int)$parts[3];
            if ($expires < time()) {
                return null;
            }
            return [
                'user_id' => $parts[0],
                'username' => $parts[1],
                'role' => $parts[2]
            ];
        }
        
        if (count($parts) === 3) {
            return [
                'user_id' => $parts[0],
                'username' => $parts[1],
                'role' => $parts[2]
            ];
        }
        
        return null;
    }
    
    public static function requireAuth() {
        $user = self::getCurrentUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
            exit;
        }
        return $user;
    }
    
    public static function requireAdmin() {
        $user = self::getCurrentUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
            exit;
        }
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Forbidden: Admin access required']);
            exit;
        }
        return $user;
    }
}
?>