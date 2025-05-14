<?php
function connectDB() {
    $host = 'localhost';      // Use Replit DB host if needed
    $dbname = 'campus_hub';
    $username = 'root';
    $password = '';

    try {
        return new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    } catch (PDOException $e) {
        echo json_encode(["error" => $e->getMessage()]);
        exit;
    }
}
?>
