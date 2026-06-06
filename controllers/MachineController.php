<?php
require_once __DIR__ . '/../services/MachineService.php';
require_once __DIR__ . '/../services/AuthService.php';

class MachineController {
    private $machineService;
    
    public function __construct() {
        $this->machineService = new MachineService();
    }
    
    private function sendResponse($data, $code = 200) {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    public function getAll() {
        $machines = $this->machineService->getAll();
        $this->sendResponse(['status' => 'success', 'message' => 'Machines list', 'data' => $machines]);
    }
    
    public function getOne($params) {
        $id = $params[0] ?? null;
        
        if (!$id) {
            $this->sendResponse(['status' => 'error', 'message' => 'ID not provided'], 400);
        }
        
        $machineData = $this->machineService->getOne($id);
        
        if (!$machineData) {
            $this->sendResponse(['status' => 'error', 'message' => 'Machine not found'], 404);
        }
        
        $this->sendResponse(['status' => 'success', 'message' => 'Machine details', 'data' => $machineData['machine']]);
    }
    
    public function create() {
        $adminUser = AuthService::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        
        $result = $this->machineService->create($input, $adminUser);
        
        if (isset($result['error'])) {
            $this->sendResponse(['status' => 'error', 'message' => $result['error']], 400);
        }
        
        $this->sendResponse(['status' => 'success', 'message' => 'Machine created', 'data' => ['machine_id' => $result['machine_id']]]);
    }
    
    public function update($params) {
        $adminUser = AuthService::requireAdmin();
        $id = $params[0] ?? null;
        
        if (!$id) {
            $this->sendResponse(['status' => 'error', 'message' => 'ID not provided'], 400);
        }
        
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $result = $this->machineService->update($id, $input, $adminUser);
        
        if (isset($result['error'])) {
            $this->sendResponse(['status' => 'error', 'message' => $result['error']], 404);
        }
        
        $this->sendResponse(['status' => 'success', 'message' => 'Machine updated']);
    }
    
    public function delete($params) {
        $adminUser = AuthService::requireAdmin();
        $id = $params[0] ?? null;
        
        if (!$id) {
            $this->sendResponse(['status' => 'error', 'message' => 'ID not provided'], 400);
        }
        
        $result = $this->machineService->delete($id, $adminUser);
        
        if (isset($result['error'])) {
            $this->sendResponse(['status' => 'error', 'message' => $result['error']], 404);
        }
        
        $this->sendResponse(['status' => 'success', 'message' => 'Machine deleted']);
    }
}
?>