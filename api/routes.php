<?php
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/MachineController.php';
require_once __DIR__ . '/../controllers/CartController.php';
$routes = [
    'GET' => [
        '/agro-shop/api/machines' => ['MachineController', 'getAll'],
        '/agro-shop/api/cart' => ['CartController', 'get'],
    ],
    'POST' => [
        '/agro-shop/api/register' => ['AuthController', 'register'],
        '/agro-shop/api/login' => ['AuthController', 'login'],
        '/agro-shop/api/cart' => ['CartController', 'save'],
    ]
];
?>