# Study Groups API Documentation

## Overview

This API provides endpoints to manage study groups, allowing users to create, read, update, and delete study group information.

## Base URL

```
https://c605d8fb-2d04-4224-9675-8d3eea663be3-00-38mfyhzkuk867.pike.replit.dev/api.php
```

## Database Configuration

The API uses environment variables for database configuration:
- `DB_HOST`: Database host (default: 127.0.0.1)
- `DB_NAME`: Database name (default: mydb)
- `DB_USER`: Database username (default: bushraalhamri)
- `DB_PASS`: Database password

## API Endpoints

### Get Study Groups

Retrieves a list of study groups with optional filtering, pagination, and sorting.

**Request:**
- Method: `GET`
- Endpoint: `/api.php`
- Query Parameters:
  - `action`: (optional) Set to "get" (default)
  - `page`: (optional) Page number for pagination (default: 1)
  - `limit`: (optional) Number of items per page (default: 0, returns all items)
  - `subject`: (optional) Filter by subject
  - `time`: (optional) Filter by time
  - `sort`: (optional) Sort results by:
    - `name-asc`: Sort by title ascending
    - `name-desc`: Sort by title descending
    - `subject-asc`: Sort by subject ascending
    - `subject-desc`: Sort by subject descending
    - `schedule-asc`: Sort by time ascending
    - `schedule-desc`: Sort by time descending

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Math Study Group",
      "subject": "Mathematics",
      "time": "3:00 PM",
      "image": "https://example.com/image.jpg",
      "moreInfo": "Additional information about the group"
    },
    // More study groups...
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Create Study Group

Creates a new study group.

**Request:**
- Method: `POST`
- Endpoint: `/api.php`
- Body:
```json
{
  "action": "create",
  "title": "Physics Study Group",
  "subject": "Physics",
  "time": "4:30 PM",
  "image": "https://example.com/physics.jpg",
  "moreInfo": "Join us to study quantum mechanics"
}
```

**Response:**
```json
{
  "message": "Group created successfully",
  "id": 5
}
```

### Update Study Group

Updates an existing study group.

**Request:**
- Method: `POST`
- Endpoint: `/api.php`
- Body:
```json
{
  "action": "update",
  "id": 5,
  "title": "Advanced Physics Study Group",
  "subject": "Physics",
  "time": "5:00 PM",
  "image": "https://example.com/advanced-physics.jpg",
  "moreInfo": "Updated information about the group"
}
```

**Response:**
```json
{
  "message": "Group updated successfully",
  "id": 5
}
```

### Delete Study Group

Deletes a study group.

**Request:**
- Method: `POST`
- Endpoint: `/api.php`
- Body:
```json
{
  "action": "delete",
  "id": 5
}
```

**Response:**
```json
{
  "message": "Group deleted successfully",
  "id": 5
}
```

## Data Validation

The API performs the following validations:

- **Title**:
  - Required
  - Minimum 3 characters
  - Maximum 100 characters

- **Subject**:
  - Required
  - Minimum 2 characters
  - Maximum 50 characters

- **Time**:
  - Required
  - Format: "12:00 AM/PM"

- **Image**:
  - Optional
  - Must be a valid URL or base64 encoded image

- **More Info**:
  - Optional
  - Maximum 1000 characters

## Error Handling

When an error occurs, the API returns a JSON response with an error message:

```json
{
  "error": "Error message details"
}
```

Common error status codes:
- `400`: Bad Request (validation errors, invalid action)
- `500`: Server Error (database connection issues)

## Database Schema

The API uses a MySQL database with the following schema:

```sql
CREATE TABLE study_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    time VARCHAR(20) NOT NULL,
    image TEXT,
    moreInfo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Development

### Requirements
- PHP 7.2 or higher
- MySQL 5.7 or higher
- PDO PHP extension