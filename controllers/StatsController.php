<?php
require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../core/MySQLProcedures.php';

class StatsController {
    private $procedures;
    
    public function __construct() {
        $this->procedures = new MySQLProcedures();
    }
    
    private function sendResponse($data, $code = 200) {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    public function getMachinesStats() {
        AuthService::requireAdmin();
        $stats = $this->procedures->getMachinesStats();
        $this->sendResponse(['status' => 'success', 'data' => $stats]);
    }
    
    public function getUserStats() {
        AuthService::requireAdmin();
        $stats = $this->procedures->getUserOrdersStats();
        $this->sendResponse(['status' => 'success', 'data' => $stats]);
    }
}
?>