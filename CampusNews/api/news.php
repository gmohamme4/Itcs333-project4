<?php
require_once __DIR__ . '/../config/db.php';
$pdo = connectDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM news ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['title'], $data['content'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing fields"]);
            exit();
        }

        $stmt = $pdo->prepare("INSERT INTO news (title, content) VALUES (?, ?)");
        $stmt->execute([$data['title'], $data['content']]);
        echo json_encode(["message" => "News created successfully"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
?>
