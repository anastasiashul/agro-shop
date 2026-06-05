<?php
class MachineController {
    private $machines = [];
    
    public function __construct() {
        $this->machines = [
            ['id' => 1, 'name' => 'Трактор Беларус-82.1', 'category' => 'Тракторы', 'price' => 3500000, 'description' => 'Универсальный колесный трактор', 'stock' => 5],
            ['id' => 2, 'name' => 'Комбайн Дон-1500', 'category' => 'Комбайны', 'price' => 8500000, 'description' => 'Зерноуборочный комбайн', 'stock' => 3],
            ['id' => 3, 'name' => 'Плуг ПЛН-4-35', 'category' => 'Плуги', 'price' => 250000, 'description' => 'Навесной плуг', 'stock' => 10],
        ];
        $this->nextId = 4;
    }
    
    private function sendResponse($data, $code = 200) {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    private function isAdmin() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $token = str_replace('Bearer ', '', $authHeader);
        
        if (!$token) return false;
        
        $decoded = base64_decode($token);
        $parts = explode(':', $decoded);
        return (count($parts) === 3 && $parts[2] === 'admin');
    }
    
    public function getAll() {
        $this->sendResponse(['status' => 'success', 'data' => $this->machines]);
    }
    
    public function getOne($params) {
        $id = $params[0] ?? null;
        foreach ($this->machines as $machine) {
            if ($machine['id'] == $id) {
                $this->sendResponse(['status' => 'success', 'data' => $machine]);
                return;
            }
        }
        $this->sendResponse(['status' => 'error', 'message' => 'Machine not found'], 404);
    }
    
    public function create() {
        if (!$this->isAdmin()) {
            $this->sendResponse(['status' => 'error', 'message' => 'Forbidden'], 403);
        }
        
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        
        $newMachine = [
            'id' => $this->nextId++,
            'name' => $input['name'] ?? '',
            'category' => $input['category'] ?? '',
            'price' => $input['price'] ?? 0,
            'description' => $input['description'] ?? '',
            'stock' => $input['stock'] ?? 0
        ];
        
        $this->machines[] = $newMachine;
        $this->sendResponse(['status' => 'success', 'message' => 'Machine created', 'data' => ['machine_id' => $newMachine['id']]]);
    }
    
    public function update($params) {
        if (!$this->isAdmin()) {
            $this->sendResponse(['status' => 'error', 'message' => 'Forbidden'], 403);
        }
        
        $id = $params[0] ?? null;
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        
        foreach ($this->machines as &$machine) {
            if ($machine['id'] == $id) {
                $machine['name'] = $input['name'] ?? $machine['name'];
                $machine['category'] = $input['category'] ?? $machine['category'];
                $machine['price'] = $input['price'] ?? $machine['price'];
                $machine['description'] = $input['description'] ?? $machine['description'];
                $machine['stock'] = $input['stock'] ?? $machine['stock'];
                $this->sendResponse(['status' => 'success', 'message' => 'Machine updated']);
            }
        }
        $this->sendResponse(['status' => 'error', 'message' => 'Machine not found'], 404);
    }
    
    public function delete($params) {
        if (!$this->isAdmin()) {
            $this->sendResponse(['status' => 'error', 'message' => 'Forbidden'], 403);
        }
        
        $id = $params[0] ?? null;
        foreach ($this->machines as $key => $machine) {
            if ($machine['id'] == $id) {
                unset($this->machines[$key]);
                $this->machines = array_values($this->machines);
                $this->sendResponse(['status' => 'success', 'message' => 'Machine deleted']);
            }
        }
        $this->sendResponse(['status' => 'error', 'message' => 'Machine not found'], 404);
    }
}
?>