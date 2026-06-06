<?php
require_once __DIR__ . '/../models/User.php';

class AuthService {
    private $userModel;
    
    public function __construct() {
        $this->userModel = new User();
    }
    
    public function register($username, $email, $name, $age, $password) {
        if (empty($username) || empty($email) || empty($name) || empty($password)) {
            return ['error' => 'All fields except age are required'];
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['error' => 'Invalid email format'];
        }
        
        if (strlen($password) < 6) {
            return ['error' => 'Password must be at least 6 characters'];
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
        
        return ['success' => true, 'user_id' => $result['id']];
    }
    
    public function login($username, $password) {
        if (empty($username) || empty($password)) {
            return ['error' => 'Username and password are required'];
        }
        
        $userData = $this->userModel->findByUsername($username);
        
        if (!$userData || !password_verify($password, $userData['user']['password_hash'])) {
            return ['error' => 'Invalid username or password'];
        }
        
        $token = base64_encode($userData['id'] . ':' . $userData['user']['username'] . ':' . $userData['user']['role']);
        
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
    
    public static function getCurrentUser() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $token = str_replace('Bearer ', '', $authHeader);
        
        if (!$token) {
            return null;
        }
        
        $decoded = base64_decode($token);
        $parts = explode(':', $decoded);
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