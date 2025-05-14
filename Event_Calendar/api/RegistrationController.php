<?php

class RegistrationController {
    private $db;

    public function __construct($db) {
        $this->db = $db->getConnection();
    }

    public function getRegistrations() {
        try {
            $stmt = $this->db->query("SELECT * FROM registrations");
            $registrations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($registrations);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getRegistrationsByEvent($eventId) {
        try {
            $stmt = $this->db->prepare("
                SELECT r.* FROM registrations r
                WHERE r.event_id = :eventId
                ORDER BY r.registered_at DESC
            ");
            $stmt->bindParam(':eventId', $eventId);
            $stmt->execute();
            
            $registrations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($registrations);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getRegistration($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM registrations WHERE id = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            $registration = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($registration) {
                echo json_encode($registration);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Registration not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function createRegistration($data) {
        try {
            $required = ['event_id', 'name', 'email'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    http_response_code(400);
                    echo json_encode(['error' => "$field is required"]);
                    return;
                }
            }
            
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid email format']);
                return;
            }
            
            $eventStmt = $this->db->prepare("SELECT id, registerable FROM events WHERE id = :eventId");
            $eventStmt->bindParam(':eventId', $data['event_id']);
            $eventStmt->execute();
            $event = $eventStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$event) {
                http_response_code(404);
                echo json_encode(['error' => 'Event not found']);
                return;
            }
            
            if ($event['registerable'] !== 'yes') {
                http_response_code(400);
                echo json_encode(['error' => 'This event does not allow registrations']);
                return;
            }
            
            $checkStmt = $this->db->prepare("SELECT id FROM registrations WHERE event_id = :eventId AND email = :email");
            $checkStmt->bindParam(':eventId', $data['event_id']);
            $checkStmt->bindParam(':email', $data['email']);
            $checkStmt->execute();
            
            if ($checkStmt->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'This email is already registered for the event']);
                return;
            }
            
            $sql = "INSERT INTO registrations (event_id, name, email) VALUES (:event_id, :name, :email)";
            $stmt = $this->db->prepare($sql);
            
            $stmt->bindParam(':event_id', $data['event_id']);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':email', $data['email']);
            
            if ($stmt->execute()) {
                $id = $this->db->lastInsertId();
                http_response_code(201);
                echo json_encode(['id' => $id, 'message' => 'Registration created successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create registration']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function deleteRegistration($id) {
        try {
            $stmt = $this->db->prepare("DELETE FROM registrations WHERE id = :id");
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['message' => 'Registration deleted successfully']);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Registration not found']);
                }
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete registration']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}