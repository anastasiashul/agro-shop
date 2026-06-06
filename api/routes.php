<?php
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/MachineController.php';
require_once __DIR__ . '/../controllers/CartController.php';
require_once __DIR__ . '/../controllers/OrderController.php';
$routes = [
    'GET' => [
        '/agro-shop/api/machines' => ['MachineController', 'getAll'],
        '/agro-shop/api/machines/%d' => ['MachineController', 'getOne'],
        '/agro-shop/api/cart' => ['CartController', 'get'],
        '/agro-shop/api/orders' => ['OrderController', 'getMyOrders'],
    ],
    'POST' => [
        '/agro-shop/api/register' => ['AuthController', 'register'],
        '/agro-shop/api/login' => ['AuthController', 'login'],
        '/agro-shop/api/machines' => ['MachineController', 'create'],
        '/agro-shop/api/orders' => ['OrderController', 'create'],
        '/agro-shop/api/cart' => ['CartController', 'save'],
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