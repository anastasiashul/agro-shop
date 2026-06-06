<?php
require_once __DIR__ . '/MySQLDatabase.php';

class MySQLProcedures {
    private $db;
    
    public function __construct() {
        $this->db = MySQLDatabase::getInstance()->getConnection();
    }
    
    public function createOrder($userId, $total, &$orderId) {
        try {
            $stmt = $this->db->prepare("CALL sp_create_order(?, ?, @order_id)");
            $stmt->execute([$userId, $total]);
            
            $result = $this->db->query("SELECT @order_id as order_id")->fetch();
            $orderId = $result['order_id'];
            return ['success' => true, 'order_id' => $orderId];
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    public function payOrder($orderId, $userId) {
        try {
            $stmt = $this->db->prepare("CALL sp_pay_order(?, ?, @success)");
            $stmt->execute([$orderId, $userId]);
            
            $result = $this->db->query("SELECT @success as success")->fetch();
            return ['success' => true];
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    public function cancelOrder($orderId, $userId) {
        try {
            $stmt = $this->db->prepare("CALL sp_cancel_order(?, ?, @success)");
            $stmt->execute([$orderId, $userId]);
            
            return ['success' => true];
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    public function getUserOrderCount($userId) {
        $stmt = $this->db->prepare("SELECT fn_user_orders_count(?) as count");
        $stmt->execute([$userId]);
        return $stmt->fetch()['count'];
    }
    
    public function getUserTotalSpent($userId) {
        $stmt = $this->db->prepare("SELECT fn_user_total_spent(?) as total");
        $stmt->execute([$userId]);
        return $stmt->fetch()['total'];
    }
    
    public function getMachineStock($machineId) {
        $stmt = $this->db->prepare("SELECT fn_machine_stock(?) as stock");
        $stmt->execute([$machineId]);
        return $stmt->fetch()['stock'];
    }
    
    public function getMachinesStats() {
        $stmt = $this->db->query("SELECT * FROM v_machines_stats");
        return $stmt->fetchAll();
    }
    
    public function getUserOrdersStats() {
        $stmt = $this->db->query("SELECT * FROM v_user_orders_stats");
        return $stmt->fetchAll();
    }
    
    public function getOrdersDetails() {
        $stmt = $this->db->query("SELECT * FROM v_orders_details");
        return $stmt->fetchAll();
    }
    
}
?>