<?php
class Order {
    private $orders = [];
    private $orderItems = [];
    private $nextOrderId = 1;
    private $nextItemId = 1;
    
    public function __construct() {
        $this->orders = [];
        $this->orderItems = [];
    }
    
    public function findByUserId($userId) {
        $result = [];
        foreach ($this->orders as $order) {
            if ($order['user_id'] == $userId) {
                $order['items'] = $this->getItemsByOrderId($order['id']);
                $result[] = $order;
            }
        }
        usort($result, function($a, $b) {
            return $b['id'] - $a['id'];
        });
        return $result;
    }
    
    public function findById($id) {
        foreach ($this->orders as $order) {
            if ($order['id'] == $id) {
                $order['items'] = $this->getItemsByOrderId($order['id']);
                return $order;
            }
        }
        return null;
    }
    
    private function getItemsByOrderId($orderId) {
        $result = [];
        foreach ($this->orderItems as $item) {
            if ($item['order_id'] == $orderId) {
                $result[] = $item;
            }
        }
        return $result;
    }
    
    public function create($userId, $items, $total) {
        $orderId = $this->nextOrderId++;
        
        $order = [
            'id' => $orderId,
            'user_id' => $userId,
            'total' => $total,
            'status' => 'pending',
            'created_at' => date('Y-m-d H:i:s'),
            'paid_at' => null
        ];
        $this->orders[] = $order;
        
        foreach ($items as $item) {
            $this->orderItems[] = [
                'id' => $this->nextItemId++,
                'order_id' => $orderId,
                'machine_id' => $item['machine_id'],
                'name' => $item['name'],
                'price' => $item['price'],
                'quantity' => $item['quantity']
            ];
        }
        
        return ['success' => true, 'id' => $orderId];
    }
    
    public function pay($id) {
        foreach ($this->orders as &$order) {
            if ($order['id'] == $id && $order['status'] == 'pending') {
                $order['status'] = 'paid';
                $order['paid_at'] = date('Y-m-d H:i:s');
                return ['success' => true];
            }
        }
        return ['error' => 'Order not found or cannot be paid'];
    }
    
    public function cancel($id) {
        foreach ($this->orders as &$order) {
            if ($order['id'] == $id && $order['status'] == 'pending') {
                $order['status'] = 'cancelled';
                return ['success' => true];
            }
        }
        return ['error' => 'Order not found or cannot be cancelled'];
    }
}
?>