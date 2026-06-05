<?php
require_once __DIR__ . '/../services/OrderService.php';

class OrderController {
    private $orderService;
    
    public function __construct() {
        $this->orderService = new OrderService();
    }
    
    private function sendResponse($data, $code = 200) {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    private function getUserIdFromToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $token = str_replace('Bearer ', '', $authHeader);
        
        if (!$token) {
            $this->sendResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }
        
        $decoded = base64_decode($token);
        $parts = explode(':', $decoded);
        if (count($parts) !== 3) {
            $this->sendResponse(['status' => 'error', 'message' => 'Invalid token'], 401);
        }
        
        return $parts[0];
    }
    
    public function getMyOrders() {
        $userId = $this->getUserIdFromToken();
        $orders = $this->orderService->getMyOrders($userId);
        $this->sendResponse(['status' => 'success', 'data' => $orders]);
    }
    
    public function create() {
        $userId = $this->getUserIdFromToken();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        
        $items = $input['items'] ?? [];
        $total = $input['total'] ?? 0;
        
        $result = $this->orderService->createOrder($userId, $items, $total);
        
        if (isset($result['error'])) {
            $this->sendResponse(['status' => 'error', 'message' => $result['error']], 400);
        }
        
        $this->sendResponse(['status' => 'success', 'message' => 'Order created', 'data' => ['order_id' => $result['order_id']]]);
    }
    
    public function pay($params) {
        $userId = $this->getUserIdFromToken();
        $id = $params[0] ?? null;
        
        if (!$id) {
            $this->sendResponse(['status' => 'error', 'message' => 'Order ID not provided'], 400);
        }
        
        $result = $this->orderService->payOrder($id, $userId);
        
        if (isset($result['error'])) {
            $this->sendResponse(['status' => 'error', 'message' => $result['error']], 400);
        }
        
        $this->sendResponse(['status' => 'success', 'message' => 'Order paid successfully']);
    }
    
    public function cancel($params) {
        $userId = $this->getUserIdFromToken();
        $id = $params[0] ?? null;
        
        if (!$id) {
            $this->sendResponse(['status' => 'error', 'message' => 'Order ID not provided'], 400);
        }
        
        $result = $this->orderService->cancelOrder($id, $userId);
        
        if (isset($result['error'])) {
            $this->sendResponse(['status' => 'error', 'message' => $result['error']], 400);
        }
        
        $this->sendResponse(['status' => 'success', 'message' => 'Order cancelled']);
    }
}
?>