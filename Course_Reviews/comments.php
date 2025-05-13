<?php
header('Content-Type: application/json');
//require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['review_id'], $data['text'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing fields']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO comments (review_id, user, text) VALUES (?, ?, ?)");
        $stmt->execute([
            (int)$data['review_id'],
            htmlspecialchars($data['user'] ?? 'Anonymous'),
            htmlspecialchars($data['text'])
        ]);
        echo json_encode(['message' => 'Comment added']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
