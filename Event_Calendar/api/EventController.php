<?php

class EventController {
    private $db;

    public function __construct($db) {
        $this->db = $db->getConnection();
    }

    public function getEvents($page = 1, $perPage = 8, $search = '', $date = '', $fromDate = '', $toDate = '') {
        try {
            $offset = ($page - 1) * $perPage;
            
            $sql = "SELECT * FROM events WHERE 1=1";
            $params = [];
            
            if (!empty($search)) {
                $sql .= " AND (title LIKE :search OR description LIKE :search)";
                $params[':search'] = "%$search%";
            }
            
            if (!empty($date)) {
                $sql .= " AND date = :date";
                $params[':date'] = $date;
            }
            
            if (!empty($fromDate) && !empty($toDate)) {
                $sql .= " AND date BETWEEN :fromDate AND :toDate";
                $params[':fromDate'] = $fromDate;
                $params[':toDate'] = $toDate;
            }
            
            $countStmt = $this->db->prepare(str_replace('*', 'COUNT(*) as total', $sql));
            $countStmt->execute($params);
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            $sql .= " ORDER BY date ASC LIMIT :offset, :perPage";
            $stmt = $this->db->prepare($sql);
            
            $params[':offset'] = $offset;
            $params[':perPage'] = $perPage;
            
            foreach ($params as $key => &$val) {
                $stmt->bindParam($key, $val, is_int($val) ? PDO::PARAM_INT : PDO::PARAM_STR);
            }
            
            $stmt->execute();
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'data' => $events,
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'per_page' => $perPage,
                    'total_pages' => ceil($total / $perPage)
                ]
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getEvent($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM events WHERE id = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            $event = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($event) {
                echo json_encode($event);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Event not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function createEvent($data) {
        try {
            $required = ['title', 'date', 'description', 'registerable'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    http_response_code(400);
                    echo json_encode(['error' => "$field is required"]);
                    return;
                }
            }
            
            $sql = "INSERT INTO events (title, date, description, image, registerable, moreinfo) 
                    VALUES (:title, :date, :description, :image, :registerable, :moreinfo)";
            
            $stmt = $this->db->prepare($sql);
            
            $imagePath = null;
            if (!empty($data['image'])) {
                $imagePath = $this->saveImage($data['image']);
            }
            
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':date', $data['date']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':image', $imagePath);
            $stmt->bindParam(':registerable', $data['registerable']);
            $stmt->bindParam(':moreinfo', $data['moreinfo'] ?? null);
            
            if ($stmt->execute()) {
                $id = $this->db->lastInsertId();
                http_response_code(201);
                echo json_encode(['id' => $id, 'message' => 'Event created successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create event']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    private function saveImage($base64Image) {
    
        
        $uploadDir = 'uploads/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $base64Image));
        $filename = uniqid() . '.png';
        $filepath = $uploadDir . $filename;
        
        file_put_contents($filepath, $imageData);
        
        return $filepath;
    }

    public function updateEvent($id, $data) {
        try {
            $sql = "UPDATE events SET 
                    title = :title, 
                    date = :date, 
                    description = :description, 
                    image = :image, 
                    registerable = :registerable, 
                    moreinfo = :moreinfo 
                    WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            
            $imagePath = null;
            if (!empty($data['image'])) {
                $imagePath = $this->saveImage($data['image']);
            }
            
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':date', $data['date']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':image', $imagePath);
            $stmt->bindParam(':registerable', $data['registerable']);
            $stmt->bindParam(':moreinfo', $data['moreinfo'] ?? null);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['message' => 'Event updated successfully']);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Event not found or no changes made']);
                }
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update event']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function deleteEvent($id) {
        try {
            $event = $this->getEventForDelete($id);
            
            if (!$event) {
                http_response_code(404);
                echo json_encode(['error' => 'Event not found']);
                return;
            }
            
            $stmt = $this->db->prepare("DELETE FROM events WHERE id = :id");
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                if ($event['image']) {
                    @unlink($event['image']);
                }
                
                echo json_encode(['message' => 'Event deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete event']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    private function getEventForDelete($id) {
        $stmt = $this->db->prepare("SELECT image FROM events WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}