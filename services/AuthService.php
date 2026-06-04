<?php
require_once __DIR__ . '/../models/User.php';

class AuthService {
    private $userModel;
    
    public function __construct() {
        $this->userModel = new User();
    }
    
    public function register($username, $email, $name, $password) {
        if (empty($username) || empty($email) || empty($name) || empty($password)) {
            return ['error' => 'All fields are required'];
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['error' => 'Invalid email format'];
        }
        
        if (strlen($password) < 6) {
            return ['error' => 'Password must be at least 6 characters'];
        }
        
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $result = $this->userModel->create($username, $email, $name, $passwordHash);
        
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
}
?>