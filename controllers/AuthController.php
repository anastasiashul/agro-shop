<?php
require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../core/Logger.php';

class AuthController {
    private $authService;
    
    public function __construct() {
        $this->authService = new AuthService();
    }
    
    private function sendResponse($data, $code = 200) {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    public function register() {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        
        $username = trim($input['username'] ?? '');
        $email = trim($input['email'] ?? '');
        $name = trim($input['name'] ?? '');
        $age = isset($input['age']) && $input['age'] !== '' ? (int)$input['age'] : null;
        $password = $input['password'] ?? '';
        
        $result = $this->authService->register($username, $email, $name, $age, $password);
        
        if (isset($result['error'])) {
            $this->sendResponse(['status' => 'error', 'message' => $result['error']], 400);
        }
        
        $this->sendResponse(['status' => 'success', 'message' => 'Registration successful', 'data' => ['user_id' => $result['user_id']]]);
    }
    
    public function login() {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';
        
        $result = $this->authService->login($username, $password);
        
        if (isset($result['error'])) {
            $this->sendResponse(['status' => 'error', 'message' => $result['error']], 401);
        }
        
        $this->sendResponse(['status' => 'success', 'message' => 'Login successful', 'data' => [
            'token' => $result['token'],
            'user' => $result['user']
        ]]);
    }
    public function logout() {
        $user = AuthService::getCurrentUser();
        $this->authService->logout($user);
        $this->sendResponse(['status' => 'success', 'message' => 'Logged out']);
    }
}
?>