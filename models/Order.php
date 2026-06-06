<?php
require_once __DIR__ . '/../core/MySQLDatabase.php';
require_once __DIR__ . '/../core/MySQLProcedures.php';

class Order {
    private $db;
    private $procedures;
    
    public function __construct() {
        $this->db = MySQLDatabase::getInstance()->getConnection();
        $this->procedures = new MySQLProcedures();
    }
    
    public function findByUserId($userId) {
        $stmt = $this->db->prepare("
            SELECT o.*, (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count 
            FROM orders o 
            WHERE o.user_id = ? 
            ORDER BY o.id DESC
        ");
        $stmt->execute([$userId]);
        $orders = $stmt->fetchAll();
        
        foreach ($orders as &$order) {
            $stmt2 = $this->db->prepare("SELECT * FROM order_items WHERE order_id = ?");
            $stmt2->execute([$order['id']]);
            $order['items'] = $stmt2->fetchAll();
        }
        
        return $orders;
    }
    
    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$id]);
        $order = $stmt->fetch();
        if ($order) {
            $stmt2 = $this->db->prepare("SELECT * FROM order_items WHERE order_id = ?");
            $stmt2->execute([$order['id']]);
            $order['items'] = $stmt2->fetchAll();
            return $order;
        }
        return null;
    }
    
    public function create($userId, $items, $total) {
        $result = $this->procedures->createOrder($userId, $total, $orderId);
        
        if (isset($result['error'])) {
            return ['error' => $result['error']];
        }
        
        try {
            $stmt = $this->db->prepare("INSERT INTO order_items (order_id, machine_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)");
            foreach ($items as $item) {
                $stmt->execute([$orderId, $item['machine_id'], $item['name'], $item['price'], $item['quantity']]);
            }
            return ['success' => true, 'id' => $orderId];
        } catch (Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    public function pay($id) {
        $order = $this->findById($id);
        if (!$order) {
            return ['error' => 'Order not found'];
        }
        
        return $this->procedures->payOrder($id, $order['user_id']);
    }
    
    public function cancel($id) {
        $order = $this->findById($id);
        if (!$order) {
            return ['error' => 'Order not found'];
        }
        
        return $this->procedures->cancelOrder($id, $order['user_id']);
    }
    
    public function getAllOrders() {
        $stmt = $this->db->prepare("
            SELECT o.*, u.username 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.id DESC
        ");
        $stmt->execute();
        $orders = $stmt->fetchAll();
        
        foreach ($orders as &$order) {
            $stmt2 = $this->db->prepare("SELECT * FROM order_items WHERE order_id = ?");
            $stmt2->execute([$order['id']]);
            $order['items'] = $stmt2->fetchAll();
        }
        
        return $orders;
    }
}
?>