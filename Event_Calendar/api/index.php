<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'Database.php';
require_once 'EventController.php';
require_once 'RegistrationController.php';

$db = new Database();
$eventController = new EventController($db);
$registrationController = new RegistrationController($db);

$requestMethod = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

if ($pathParts[1] === 'api') {
    $resource = $pathParts[2] ?? '';
    $id = $pathParts[3] ?? null;
    $subResource = $pathParts[4] ?? null;
    $subId = $pathParts[5] ?? null;

    switch ($resource) {
        case 'events':
            handleEventsRequest($eventController, $requestMethod, $id);
            break;
        case 'registrations':
            handleRegistrationsRequest($registrationController, $requestMethod, $id, $subResource, $subId);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Not Found']);
            break;
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not Found']);
}

function handleEventsRequest($controller, $method, $id) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $controller->getEvent($id);
            } else {
                $page = $_GET['page'] ?? 1;
                $perPage = $_GET['per_page'] ?? 8;
                $search = $_GET['search'] ?? '';
                $date = $_GET['date'] ?? '';
                $fromDate = $_GET['from_date'] ?? '';
                $toDate = $_GET['to_date'] ?? '';
                $controller->getEvents($page, $perPage, $search, $date, $fromDate, $toDate);
            }
            break;
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $controller->createEvent($data);
            break;
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $controller->updateEvent($id, $data);
            break;
        case 'DELETE':
            $controller->deleteEvent($id);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            break;
    }
}

function handleRegistrationsRequest($controller, $method, $id, $subResource, $subId) {
    switch ($method) {
        case 'GET':
            if ($subResource === 'event' && $subId) {
                $controller->getRegistrationsByEvent($subId);
            } elseif ($id) {
                $controller->getRegistration($id);
            } else {
                $controller->getRegistrations();
            }
            break;
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $controller->createRegistration($data);
            break;
        case 'DELETE':
            $controller->deleteRegistration($id);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            break;
    }
}