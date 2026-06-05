<?php
require_once __DIR__ . '/../models/Cart.php';

class CartController {
    private $cartModel;
    
    public function __construct() {
        $this->cartModel = new Cart();
    }
    
    private function sendResponse($data, $code = 200) {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    public function get() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $token = str_replace('Bearer ', '', $authHeader);
        
        if (!$token) {
            $this->sendResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }
        
        $decoded = base64_decode($token);
        $parts = explode(':', $decoded);
        if (count($parts) !== 3) {
            $this->sendResponse(['status' => 'error', 'message' => 'Invalid token'], 401);
        }
        
        $userId = $parts[0];
        $items = $this->cartModel->getByUserId($userId);
        $this->sendResponse(['status' => 'success', 'data' => $items]);
    }
    
    public function save() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $token = str_replace('Bearer ', '', $authHeader);
        
        if (!$token) {
            $this->sendResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }
        
        $decoded = base64_decode($token);
        $parts = explode(':', $decoded);
        if (count($parts) !== 3) {
            $this->sendResponse(['status' => 'error', 'message' => 'Invalid token'], 401);
        }
        
        $userId = $parts[0];
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $items = $input['items'] ?? [];
        
        $this->cartModel->save($userId, $items);
        $this->sendResponse(['status' => 'success', 'message' => 'Cart saved']);
    }
}
?>