<?php
require_once __DIR__ . '/../vendor/autoload.php';
date_default_timezone_set('Europe/Moscow');
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../core/Router.php';
require_once __DIR__ . '/routes.php';

$router = new Router();
$router->run();
?>