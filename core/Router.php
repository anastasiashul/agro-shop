<?php
class Router {
    public function run() {
        global $routes;
        
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        $routesForMethod = $routes[$method] ?? [];
        
        foreach ($routesForMethod as $pattern => $handler) {
            $regex = str_replace('%d', '(\d+)', $pattern);
            $regex = '#^' . $regex . '$#';
            
            if (preg_match($regex, $uri, $matches)) {
                array_shift($matches);
                $controllerName = $handler[0];
                $action = $handler[1];
                
                $controller = new $controllerName();
                $controller->$action($matches);
                return;
            }
        }
        
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Endpoint not found']);
    }
}
?>