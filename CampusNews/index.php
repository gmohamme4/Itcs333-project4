<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = trim($path, '/');
$segments = explode('/', $path);
$endpoint = end($segments);

if ($endpoint === 'news') {
    include __DIR__ . '/api/news.php';
} else {
    http_response_code(404);
    echo json_encode(["error" => "Invalid endpoint: $path"]);
}
?>