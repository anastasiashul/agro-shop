<?php
require_once __DIR__ . '/../models/Cart.php';
require_once __DIR__ . '/../services/AuthService.php';

class CartController {
    private $cartModel;
    
    public function __construct() {
        $this->cartModel = new Cart();
    }
    
    public function get() {
        $user = AuthService::requireAuth();
        $items = $this->cartModel->getByUserId($user['user_id']);
        echo json_encode(['status' => 'success', 'data' => $items]);
    }
    
    public function save() {
        $user = AuthService::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $items = $input['items'] ?? [];
        
        $this->cartModel->save($user['user_id'], $items);
        echo json_encode(['status' => 'success', 'message' => 'Cart saved']);
    }
}
?>