<?php
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/MachineController.php';

$routes = [
    'GET' => [
        '/agro-shop/api/machines' => ['MachineController', 'getAll'],
    ],
    'POST' => [
        '/agro-shop/api/register' => ['AuthController', 'register'],
        '/agro-shop/api/login' => ['AuthController', 'login'],
    ]
];
?>