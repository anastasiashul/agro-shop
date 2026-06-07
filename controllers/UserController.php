<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../core/Logger.php';

use Respect\Validation\Validator as v;

class UserController {
    private $userModel;
    
    public function __construct() {
        $this->userModel = new User();
    }
    
    private function sendResponse($data, $code = 200) {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    public function getAll() {
        AuthService::requireAdmin();
        $users = $this->userModel->getAll();
        $this->sendResponse(['status' => 'success', 'message' => 'Users list', 'data' => $users]);
    }
    
    public function getOne($params) {
        AuthService::requireAdmin();
        $id = $params[0] ?? null;
        
        if (!$id) {
            $this->sendResponse(['status' => 'error', 'message' => 'ID не указан'], 400);
        }
        
        $userData = $this->userModel->findById($id);
        if (!$userData) {
            $this->sendResponse(['status' => 'error', 'message' => 'Пользователь не найден'], 404);
        }
        
        unset($userData['user']['password_hash']);
        $this->sendResponse(['status' => 'success', 'data' => $userData['user']]);
    }
    
    public function create() {
        AuthService::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        
        $username = trim($input['username'] ?? '');
        $email = trim($input['email'] ?? '');
        $name = trim($input['name'] ?? '');
        $age = isset($input['age']) && $input['age'] !== '' ? (int)$input['age'] : null;
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'user';
        
        if (empty($username) || empty($email) || empty($name) || empty($password)) {
            $this->sendResponse([
                'status' => 'error', 
                'message' => 'Все поля обязательны для заполнения'
            ], 400);
        }
        
        if (!v::email()->validate($email)) {
            $this->sendResponse([
                'status' => 'error', 
                'message' => 'Неверный формат email'
            ], 400);
        }
        
        if (!v::stringType()->length(6, 100)->validate($password)) {
            $this->sendResponse([
                'status' => 'error', 
                'message' => 'Пароль должен быть не менее 6 символов'
            ], 400);
        }

        if (!v::stringType()->regex('/^[a-zA-Z0-9_]{1,32}$/')->validate($username)) {
            $this->sendResponse([
                'status' => 'error', 
                'message' => 'Логин должен содержать 1-32 символа (латиница, цифры, _)'
            ], 400);
        }

        if (!v::stringType()->regex('/^[a-zA-Zа-яА-ЯёЁ\s\-]{1,128}$/u')->validate($name)) {
            $this->sendResponse([
                'status' => 'error', 
                'message' => 'Имя может содержать только буквы, пробелы и дефисы (1-128 символов)'
            ], 400);
        }
        
        if ($age !== null && ($age < 0 || $age > 150)) {
            $this->sendResponse([
                'status' => 'error', 
                'message' => 'Возраст должен быть от 0 до 150 лет'
            ], 400);
        }
        
        if (!in_array($role, ['user', 'admin'])) {
            $role = 'user';
        }
        
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        $result = $this->userModel->create($username, $email, $name, $age, $passwordHash, $role);
        
        if (isset($result['error'])) {
            $this->sendResponse([
                'status' => 'error', 
                'message' => $result['error']
            ], 400);
        }
        
        $adminUser = AuthService::getCurrentUser();
        Logger::log("Admin created user: $username ($email) as $role, Admin: {$adminUser['username']}", 'ADMIN_CREATE_USER');

        $this->sendResponse([
            'status' => 'success', 
            'message' => 'Пользователь успешно создан', 
            'data' => ['id' => $result['id']]
        ]);
    }
}
?>