<?php
class Cart {
    private $carts = [];
    
    public function __construct() {
        $this->carts = [];
    }
    
    public function getByUserId($userId) {
        if (isset($this->carts[$userId])) {
            return $this->carts[$userId];
        }
        return [];
    }
    
    public function save($userId, $items) {
        $this->carts[$userId] = $items;
        return true;
    }
    
    public function clear($userId) {
        unset($this->carts[$userId]);
        return true;
    }
}
?>