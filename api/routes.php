<?php
require_once __DIR__ . '/../controllers/MachineController.php';

$routes = [
    'GET' => [
        '/agro-shop/api/machines' => ['MachineController', 'getAll'],
    ]
];
?>