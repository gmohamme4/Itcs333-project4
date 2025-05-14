<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$endpoint = $_GET['endpoint'] ?? '';

switch ($endpoint) {
    case 'events':
        handleEvents($method);
        break;
    case 'registrations':
        handleRegistrations($method);
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
}

function handleEvents($method) {
    global $pdo;
    
    try {
        switch ($method) {
            case 'GET':
                $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
                $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
                $search = isset($_GET['search']) ? "%".$_GET['search']."%" : null;
                
                $sql = "SELECT * FROM events";
                $params = [];
                
                if ($search) {
                    $sql .= " WHERE title LIKE :search OR description LIKE :search";
                    $params[':search'] = $search;
                }
                
                $sql .= " ORDER BY date DESC LIMIT :limit OFFSET :offset";
                
                $stmt = $pdo->prepare($sql);
                foreach ($params as $key => $value) {
                    $stmt->bindValue($key, $value);
                }
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();
                
                echo json_encode($stmt->fetchAll());
                break;
                
            case 'POST':
                $data = json_decode(file_get_contents("php://input"), true);
                
                if (!isset($data['title'], $data['date'], $data['description'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing required fields']);
                    exit;
                }
                
                $stmt = $pdo->prepare("
                    INSERT INTO events 
                    (title, date, description, registerable, moreinfo, image) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    htmlspecialchars($data['title']),
                    $data['date'],
                    htmlspecialchars($data['description']),
                    $data['registerable'] ?? 'no',
                    htmlspecialchars($data['moreinfo'] ?? ''),
                    $data['image'] ?? ''
                ]);
                
                echo json_encode([
                    'message' => 'Event added',
                    'id' => $pdo->lastInsertId()
                ]);
                break;
                
            case 'PUT':
                $data = json_decode(file_get_contents("php://input"), true);
                $id = $_GET['id'] ?? 0;
                
                if (!$id || !isset($data['title'], $data['date'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing required fields']);
                    exit;
                }
                
                $stmt = $pdo->prepare("
                    UPDATE events SET 
                    title = ?, 
                    date = ?, 
                    description = ?,
                    registerable = ?,
                    moreinfo = ?,
                    image = ?
                    WHERE id = ?
                ");
                
                $stmt->execute([
                    htmlspecialchars($data['title']),
                    $data['date'],
                    htmlspecialchars($data['description'] ?? ''),
                    $data['registerable'] ?? 'no',
                    htmlspecialchars($data['moreinfo'] ?? ''),
                    $data['image'] ?? '',
                    $id
                ]);
                
                echo json_encode(['message' => 'Event updated']);
                break;
                
            case 'DELETE':
                $id = $_GET['id'] ?? 0;
                $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(['message' => 'Event deleted']);
                break;
                
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function handleRegistrations($method) {
    global $pdo;
    
    try {
        switch ($method) {
            case 'POST':
                $data = json_decode(file_get_contents("php://input"), true);
                
                if (!isset($data['event_id'], $data['name'], $data['email'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing required fields']);
                    exit;
                }
                
                $eventStmt = $pdo->prepare("SELECT id FROM events WHERE id = ?");
                $eventStmt->execute([$data['event_id']]);
                if (!$eventStmt->fetch()) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Event not found']);
                    exit;
                }
                
                $stmt = $pdo->prepare("
                    INSERT INTO registrations 
                    (event_id, name, email) 
                    VALUES (?, ?, ?)
                ");
                
                $stmt->execute([
                    (int)$data['event_id'],
                    htmlspecialchars($data['name']),
                    htmlspecialchars($data['email'])
                ]);
                
                echo json_encode([
                    'message' => 'Registration added',
                    'id' => $pdo->lastInsertId()
                ]);
                break;
                
            case 'GET':
                $event_id = $_GET['event_id'] ?? 0;
                
                if (!$event_id) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing event_id']);
                    exit;
                }
                
                $stmt = $pdo->prepare("
                    SELECT * FROM registrations 
                    WHERE event_id = ?
                    ORDER BY registered_at DESC
                ");
                $stmt->execute([$event_id]);
                
                echo json_encode($stmt->fetchAll());
                break;
                
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
?>