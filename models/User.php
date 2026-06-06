<?php
require_once __DIR__ . '/../core/MySQLDatabase.php';

class User {
    private $db;
    
    public function __construct() {
        $this->db = MySQLDatabase::getInstance()->getConnection();
    }
    
    public function findByUsername($username) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        if ($user) {
            return ['id' => $user['id'], 'user' => $user];
        }
        return null;
    }
    
    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        if ($user) {
            return ['id' => $user['id'], 'user' => $user];
        }
        return null;
    }
    
    public function create($username, $email, $name, $passwordHash, $role = 'user') {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetchColumn() > 0) {
            return ['error' => 'Username already exists'];
        }
        
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetchColumn() > 0) {
            return ['error' => 'Email already exists'];
        }
        
        $stmt = $this->db->prepare("INSERT INTO users (username, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$username, $email, $name, $passwordHash, $role]);
        return ['success' => true, 'id' => $this->db->lastInsertId()];
    }
    
    public function getAll() {
        $stmt = $this->db->query("SELECT id, username, email, name, role, created_at FROM users");
        return $stmt->fetchAll();
    }
}
?>