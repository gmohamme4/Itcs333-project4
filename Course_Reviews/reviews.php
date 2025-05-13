<?php
header('Content-Type: application/json');
//require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Pagination support
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
        $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

        $stmt = $pdo->prepare("SELECT * FROM reviews ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['courseName'], $data['professor'], $data['rating'], $data['reviewText'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO reviews (course_name, professor, rating, review_text) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            htmlspecialchars($data['courseName']),
            htmlspecialchars($data['professor']),
            (int)$data['rating'],
            htmlspecialchars($data['reviewText'])
        ]);

        echo json_encode(['message' => 'Review added']);
        break;

    case 'PUT':
        // Example assumes data includes `id`
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("UPDATE reviews SET course_name=?, professor=?, rating=?, review_text=? WHERE id=?");
        $stmt->execute([
            htmlspecialchars($data['courseName']),
            htmlspecialchars($data['professor']),
            (int)$data['rating'],
            htmlspecialchars($data['reviewText']),
            (int)$data['id']
        ]);
        echo json_encode(['message' => 'Review updated']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? 0;
        $stmt = $pdo->prepare("DELETE FROM reviews WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Review deleted']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
