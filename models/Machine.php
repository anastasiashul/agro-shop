<?php
require_once __DIR__ . '/../core/MySQLDatabase.php';

class Machine {
    private $db;
    
    public function __construct() {
        $this->db = MySQLDatabase::getInstance()->getConnection();
    }
    
    public function getAll() {
        $stmt = $this->db->query("SELECT * FROM machines ORDER BY id");
        return $stmt->fetchAll();
    }
    
    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM machines WHERE id = ?");
        $stmt->execute([$id]);
        $machine = $stmt->fetch();
        if ($machine) {
            return ['id' => $machine['id'], 'machine' => $machine];
        }
        return null;
    }
    
    public function create($name, $category, $price, $description, $image, $stock) {
        $stmt = $this->db->prepare("INSERT INTO machines (name, category, price, description, image, stock) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $category, $price, $description, $image, $stock]);
        return ['success' => true, 'id' => $this->db->lastInsertId()];
    }
    
    public function update($id, $name, $category, $price, $description, $image, $stock) {
        $stmt = $this->db->prepare("UPDATE machines SET name = ?, category = ?, price = ?, description = ?, image = ?, stock = ? WHERE id = ?");
        $stmt->execute([$name, $category, $price, $description, $image, $stock, $id]);
        return ['success' => true];
    }
    
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM machines WHERE id = ?");
        $stmt->execute([$id]);
        return ['success' => true];
    }
}
?>