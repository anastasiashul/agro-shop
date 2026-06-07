<?php
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../models/Machine.php';
require_once __DIR__ . '/AuthService.php';
require_once __DIR__ . '/../core/Logger.php';

class OrderService {
    private $orderModel;
    private $machineModel;
    
    public function __construct() {
        $this->orderModel = new Order();
        $this->machineModel = new Machine();
    }
    
    public function getMyOrders($userId) {
        return $this->orderModel->findByUserId($userId);
    }
    
    public function getAllOrders() {
        return $this->orderModel->getAllOrders();
    }
    
    public function createOrder($userId, $items, $total) {
        if (empty($items)) {
            return ['error' => 'Cart is empty'];
        }
        
        foreach ($items as $item) {
            $machine = $this->machineModel->findById($item['machine_id']);
            if (!$machine) {
                return ['error' => 'Machine ' . $item['machine_id'] . ' not found'];
            }
        }
        
        $result = $this->orderModel->create($userId, $items, $total);
        
        if (isset($result['error'])) {
            return $result;
        }

        Logger::log("Order created: ID={$result['id']}, User ID={$userId}, Total={$total}", 'ORDER_CREATED');
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
        $result = $this->orderModel->pay($orderId);
        
        if (isset($result['error'])) {
            return $result;
        }
        
        Logger::log("Order paid: ID={$orderId}, User ID={$userId}", 'ORDER_PAID');
        return ['success' => true];
    }
    
    public function cancelOrder($orderId, $userId) {
        $order = $this->orderModel->findById($orderId);
        
        if (!$order) {
            return ['error' => 'Order not found'];
        }
        
        if ($order['user_id'] != $userId) {
            return ['error' => 'You can only cancel your own orders'];
        }
        
        $result = $this->orderModel->cancel($orderId);
        
        if (isset($result['error'])) {
            return $result;
        }
        
        Logger::log("Order cancelled: ID={$orderId}, User ID={$userId}", 'ORDER_CANCELLED');
        return ['success' => true];
    }
}
?>