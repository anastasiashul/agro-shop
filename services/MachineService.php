<?php
require_once __DIR__ . '/../models/Machine.php';
require_once __DIR__ . '/AuthService.php';
require_once __DIR__ . '/../core/Logger.php';

class MachineService {
    private $machineModel;
    
    public function __construct() {
        $this->machineModel = new Machine();
    }
    
    public function getAll() {
        return $this->machineModel->getAll();
    }
    
    public function getOne($id) {
        return $this->machineModel->findById($id);
    }
    
    public function create($data, $adminUser) {
        $name = trim($data['name'] ?? '');
        $category = trim($data['category'] ?? '');
        $price = $data['price'] ?? null;
        $description = trim($data['description'] ?? '');
        $image = trim($data['image'] ?? '/images/default.jpg');
        $stock = $data['stock'] ?? 0;
        
        if (empty($name) || empty($category) || $price === null) {
            return ['error' => 'Name, category and price are required'];
        }
        
        if ($price <= 0) {
            return ['error' => 'Price must be greater than 0'];
        }
        
        $result = $this->machineModel->create($name, $category, $price, $description, $image, $stock);
        Logger::log("Machine created: ID={$result['id']}, Name={$name}, Admin={$adminUser['username']}", 'MACHINE_CREATED');
        return ['success' => true, 'machine_id' => $result['id']];
    }
    
    public function update($id, $data, $adminUser) {
        $existing = $this->machineModel->findById($id);
        if (!$existing) {
            return ['error' => 'Machine not found'];
        }
        
        $name = trim($data['name'] ?? $existing['machine']['name']);
        $category = trim($data['category'] ?? $existing['machine']['category']);
        $price = $data['price'] ?? $existing['machine']['price'];
        $description = trim($data['description'] ?? $existing['machine']['description']);
        $image = trim($data['image'] ?? $existing['machine']['image']);
        $stock = $data['stock'] ?? $existing['machine']['stock'];
        
        $result = $this->machineModel->update($id, $name, $category, $price, $description, $image, $stock);
        Logger::log("Machine updated: ID={$id}, Name={$name}, Admin={$adminUser['username']}", 'MACHINE_UPDATED');
        return ['success' => true];
    }
    
    public function delete($id, $adminUser) {
        $result = $this->machineModel->delete($id);
        Logger::log("Machine deleted: ID={$id}, Admin={$adminUser['username']}", 'MACHINE_DELETED');
        return ['success' => true];
    }
}
?>