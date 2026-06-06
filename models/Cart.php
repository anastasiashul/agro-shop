<?php
require_once __DIR__ . '/../core/MySQLDatabase.php';

class Cart {
    private $db;
    
    public function __construct() {
        $this->db = MySQLDatabase::getInstance()->getConnection();
    }
    
    public function getByUserId($userId) {
        $stmt = $this->db->prepare("SELECT items FROM carts WHERE user_id = ?");
        $stmt->execute([$userId]);
        $result = $stmt->fetch();
        if ($result) {
            return json_decode($result['items'], true) ?? [];
        }
        return [];
    }
    
    public function save($userId, $items) {
        $itemsJson = json_encode($items);
        $stmt = $this->db->prepare("
            INSERT INTO carts (user_id, items, updated_at) 
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                items = VALUES(items),
                updated_at = NOW()
        ");
        return $stmt->execute([$userId, $itemsJson]);
    }
    
    public function clear($userId) {
        $stmt = $this->db->prepare("DELETE FROM carts WHERE user_id = ?");
        return $stmt->execute([$userId]);
    }
}
?>