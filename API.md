# API Documentation

## Authentication

All internal API endpoints require authentication via NextAuth session. External API endpoints use API key authentication.

## Internal API Endpoints

### Pinterest Boards

#### GET `/api/pinterest/boards`
Get user's Pinterest boards.

**Response:**
```json
[
  {
    "id": "board_id",
    "name": "Board Name",
    "description": "Board Description",
    "url": "https://pinterest.com/username/board-name",
    "pin_count": 150
  }
]
```

### Pin Management

#### POST `/api/pins/create`
Create a new pin or schedule it for later posting.

**Request Body:**
```json
{
  "boardId": "board_id",
  "title": "Pin Title",
  "description": "Pin Description",
  "imageUrl": "https://example.com/image.jpg",
  "link": "https://example.com",
  "scheduledAt": "2024-01-01T12:00:00Z"
}
```

**Response:**
```json
{
  "pin": {
    "id": "pinterest_pin_id",
    "title": "Pin Title",
    "description": "Pin Description",
    "link": "https://example.com",
    "media": { ... },
    "board_id": "board_id"
  },
  "pinQueue": {
    "id": "queue_id",
    "title": "Pin Title",
    "scheduledAt": "2024-01-01T12:00:00Z",
    "posted": true
  }
}
```

#### GET `/api/pins/queue`
Get user's pin queue with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (`all`, `posted`, `pending`)

**Response:**
```json
{
  "pins": [
    {
      "id": "queue_id",
      "title": "Pin Title",
      "description": "Pin Description",
      "imageUrl": "https://example.com/image.jpg",
      "link": "https://example.com",
      "scheduledAt": "2024-01-01T12:00:00Z",
      "posted": false,
      "postedAt": null,
      "errorMessage": null,
      "retryCount": 0,
      "board": {
        "name": "Board Name"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### DELETE `/api/pins/[id]`
Delete a pin from the queue.

**Response:**
```json
{
  "message": "Pin deleted successfully"
}
```

## Chrome Extension API Endpoints

### Pin Creation

#### POST `/api/chrome-extension/pins`
Add a pin from Chrome extension.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "extensionId": "your-extension-id",
  "userId": "user_id",
  "boardId": "board_id",
  "title": "Pin Title",
  "description": "Pin Description",
  "imageUrl": "https://example.com/image.jpg",
  "link": "https://example.com",
  "scheduledAt": "2024-01-01T12:00:00Z",
  "signature": "hmac-signature"
}
```

**Response:**
```json
{
  "success": true,
  "pinId": "queue_id",
  "message": "Pin added to queue successfully",
  "scheduledAt": "2024-01-01T12:00:00Z"
}
```

### Status Check

#### GET `/api/chrome-extension/status`
Check pin status and queue.

**Query Parameters:**
- `extensionId`: Your Chrome extension ID
- `userId`: User ID
- `pinId` (optional): Specific pin ID
- `signature`: HMAC signature

**Response:**
```json
{
  "success": true,
  "pins": [
    {
      "id": "queue_id",
      "title": "Pin Title",
      "description": "Pin Description",
      "imageUrl": "https://example.com/image.jpg",
      "link": "https://example.com",
      "scheduledAt": "2024-01-01T12:00:00Z",
      "posted": false,
      "postedAt": null,
      "errorMessage": null,
      "retryCount": 0,
      "boardName": "Board Name"
    }
  ]
}
```

## Legacy External API Endpoints

### Pin Creation

#### POST `/api/external/pins`
Add a pin from an external system (legacy, no authentication).

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user_id",
  "boardId": "board_id",
  "title": "Pin Title",
  "description": "Pin Description",
  "imageUrl": "https://example.com/image.jpg",
  "link": "https://example.com",
  "scheduledAt": "2024-01-01T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "pinId": "queue_id",
  "message": "Pin added to queue successfully"
}
```

### Status Check

#### GET `/api/external/status`
Check pin status and queue (legacy, no authentication).

**Query Parameters:**
- `userId`: User ID
- `pinId` (optional): Specific pin ID

**Response:**
```json
{
  "success": true,
  "pins": [
    {
      "id": "queue_id",
      "title": "Pin Title",
      "description": "Pin Description",
      "imageUrl": "https://example.com/image.jpg",
      "link": "https://example.com",
      "scheduledAt": "2024-01-01T12:00:00Z",
      "posted": false,
      "postedAt": null,
      "errorMessage": null,
      "retryCount": 0,
      "boardName": "Board Name"
    }
  ]
}
```

## Cron Jobs

### Automated Posting

#### POST `/api/cron/post-pins`
Process scheduled pins (called by cron job).

**Headers:**
```
Authorization: Bearer your-cron-secret
```

**Response:**
```json
{
  "success": true,
  "processed": 5,
  "results": [
    {
      "pinId": "queue_id",
      "status": "success",
      "pinterestPinId": "pinterest_pin_id"
    },
    {
      "pinId": "queue_id",
      "status": "error",
      "error": "Error message"
    }
  ]
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

Error response format:
```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

## Rate Limits

- Pinterest API calls are limited by Pinterest's rate limits
- Internal API: No specific limits (limited by server resources)
- External API: No specific limits (limited by server resources)

## Webhooks

Currently, the application doesn't support webhooks. All status updates must be polled using the status endpoint.

## Examples

### cURL Examples

#### Create a pin via external API:
```bash
curl -X POST http://localhost:3000/api/external/pins \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your-secret",
    "userId": "user123",
    "boardId": "board456",
    "title": "My Pin",
    "description": "This is a test pin",
    "imageUrl": "https://example.com/image.jpg",
    "scheduledAt": "2024-01-01T12:00:00Z"
  }'
```

#### Check pin status:
```bash
curl "http://localhost:3000/api/external/status?apiKey=your-secret&userId=user123"
```

#### Trigger cron job:
```bash
curl -X POST http://localhost:3000/api/cron/post-pins \
  -H "Authorization: Bearer your-cron-secret"
```
