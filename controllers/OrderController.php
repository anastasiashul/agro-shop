<?php
require_once __DIR__ . '/../services/OrderService.php';
require_once __DIR__ . '/../services/AuthService.php';

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
    
    public function getMyOrders() {
        $user = AuthService::requireAuth();
        $orders = $this->orderService->getMyOrders($user['user_id']);
        $this->sendResponse(['status' => 'success', 'message' => 'My orders', 'data' => $orders]);
    }
    
    public function getAllOrders() {
        AuthService::requireAdmin();
        $orders = $this->orderService->getAllOrders();
        $this->sendResponse(['status' => 'success', 'message' => 'All orders', 'data' => $orders]);
    }
    
    public function create() {
        $user = AuthService::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        
        $items = $input['items'] ?? [];
        $total = $input['total'] ?? 0;
        
        $result = $this->orderService->createOrder($user['user_id'], $items, $total);
        
        if (isset($result['error'])) {
            $this->sendResponse(['status' => 'error', 'message' => $result['error']], 400);
        }
        
        $this->sendResponse(['status' => 'success', 'message' => 'Order created', 'data' => ['order_id' => $result['order_id']]]);
    }
    
    public function pay($params) {
        $user = AuthService::requireAuth();
        $id = $params[0] ?? null;
        
        if (!$id) {
            $this->sendResponse(['status' => 'error', 'message' => 'Order ID not provided'], 400);
        }
        
        $result = $this->orderService->payOrder($id, $user['user_id']);
        
        if (isset($result['error'])) {
            $this->sendResponse(['status' => 'error', 'message' => $result['error']], 400);
        }
        
        $this->sendResponse(['status' => 'success', 'message' => 'Order paid successfully']);
    }
    
    public function cancel($params) {
        $user = AuthService::requireAuth();
        $id = $params[0] ?? null;
        
        if (!$id) {
            $this->sendResponse(['status' => 'error', 'message' => 'Order ID not provided'], 400);
        }
        
        $result = $this->orderService->cancelOrder($id, $user['user_id']);
        
        if (isset($result['error'])) {
            $this->sendResponse(['status' => 'error', 'message' => $result['error']], 400);
        }
        
        $this->sendResponse(['status' => 'success', 'message' => 'Order cancelled']);
    }
}
?>