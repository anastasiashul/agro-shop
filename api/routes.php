<?php
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/MachineController.php';
require_once __DIR__ . '/../controllers/CartController.php';
require_once __DIR__ . '/../controllers/OrderController.php';
require_once __DIR__ . '/../controllers/UserController.php';
require_once __DIR__ . '/../controllers/StatsController.php';

$routes = [
    'GET' => [
        '/agro-shop/api/machines' => ['MachineController', 'getAll'],
        '/agro-shop/api/machines/%d' => ['MachineController', 'getOne'],
        '/agro-shop/api/cart' => ['CartController', 'get'],
        '/agro-shop/api/orders' => ['OrderController', 'getMyOrders'],
        '/agro-shop/api/orders/all' => ['OrderController', 'getAllOrders'],
        '/agro-shop/api/users' => ['UserController', 'getAll'],
        '/agro-shop/api/users/%d' => ['UserController', 'getOne'],
        '/agro-shop/api/stats/machines' => ['StatsController', 'getMachinesStats'],
        '/agro-shop/api/stats/users' => ['StatsController', 'getUserStats']
    ],
    'POST' => [
        '/agro-shop/api/register' => ['AuthController', 'register'],
        '/agro-shop/api/login' => ['AuthController', 'login'],
        '/agro-shop/api/machines' => ['MachineController', 'create'],
        '/agro-shop/api/orders' => ['OrderController', 'create'],
        '/agro-shop/api/cart' => ['CartController', 'save'],
        '/agro-shop/api/users' => ['UserController', 'create'],
        '/agro-shop/api/logout' => ['AuthController', 'logout'],
        '/agro-shop/api/orders/%d/pay' => ['OrderController', 'pay']
        
    ],
    'PUT' => [
        '/agro-shop/api/machines/%d' => ['MachineController', 'update']
    ],
    'DELETE' => [
        '/agro-shop/api/orders/%d' => ['OrderController', 'cancel'],
        '/agro-shop/api/machines/%d' => ['MachineController', 'delete'],
    ]
];
?>