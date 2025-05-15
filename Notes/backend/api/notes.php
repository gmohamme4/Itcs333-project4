<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");



require_once '../config/db.php';
$pdo = connectDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->prepare("SELECT * FROM notes ORDER BY createdAt DESC");
        $stmt->execute();
        $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($notes);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("INSERT INTO notes (courseCode, courseName, topic, content, attachments, createdAt) VALUES (?, ?, ?, ?, ?, ?)");
        $result = $stmt->execute([
            $data['courseCode'],
            $data['courseName'],
            $data['topic'],
            $data['content'],
            json_encode($data['attachments']),
            $data['createdAt']
        ]);
        if ($result) {
            $data['id'] = $pdo->lastInsertId();
            echo json_encode($data);
        } else {
            echo json_encode(["error" => "Failed to insert"]);
        }
        break;

    case 'DELETE':
        $url = explode('/', $_SERVER['REQUEST_URI']);
        $id = end($url);
        $stmt = $pdo->prepare("DELETE FROM notes WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Note deleted"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
?>
