<?php
require_once __DIR__ . '/../models/Order.php';

class OrderService {
    private $orderModel;
    
    public function __construct() {
        $this->orderModel = new Order();
    }
    
    public function getMyOrders($userId) {
        return $this->orderModel->findByUserId($userId);
    }
    
    public function createOrder($userId, $items, $total) {
        if (empty($items)) {
            return ['error' => 'Cart is empty'];
        }
        
        $result = $this->orderModel->create($userId, $items, $total);
        
        if (isset($result['error'])) {
            return $result;
        }
        
        return ['success' => true, 'order_id' => $result['id']];
    }
    
    public function payOrder($orderId, $userId) {
        $order = $this->orderModel->findById($orderId);
        
        if (!$order) {
            return ['error' => 'Order not found'];
        }
        
        if ($order['user_id'] != $userId) {
            return ['error' => 'You can only pay your own orders'];
        }
        
        return $this->orderModel->pay($orderId);
    }
    
    public function cancelOrder($orderId, $userId) {
        $order = $this->orderModel->findById($orderId);
        
        if (!$order) {
            return ['error' => 'Order not found'];
        }
        
        if ($order['user_id'] != $userId) {
            return ['error' => 'You can only cancel your own orders'];
        }
        
        return $this->orderModel->cancel($orderId);
    }
}
?>