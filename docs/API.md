# API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.voicechat.com`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Endpoints

### Authentication

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}

Response (201):
{
  "token": "jwt_token",
  "userId": "user_id",
  "user": { /* user object */ }
}
```

#### Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response (200):
{
  "token": "jwt_token",
  "userId": "user_id",
  "user": { /* user object */ }
}
```

#### Logout User
```
POST /auth/logout
Authorization: Bearer <token>

Response (200):
{
  "message": "Logged out successfully"
}
```

### Users

#### Get Current User Profile
```
GET /users/profile
Authorization: Bearer <token>

Response (200):
{
  "user": {
    "_id": "user_id",
    "username": "username",
    "email": "email",
    "profile": {
      "avatar": "url",
      "bio": "bio text",
      "status": "online|offline|away"
    },
    "createdAt": "ISO_date",
    "updatedAt": "ISO_date"
  }
}
```

#### Update User Profile
```
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile": {
    "avatar": "url",
    "bio": "new bio"
  }
}

Response (200):
{
  "message": "Profile updated",
  "user": { /* updated user object */ }
}
```

#### Get User Contacts
```
GET /users/contacts
Authorization: Bearer <token>

Response (200):
{
  "contacts": [
    {
      "_id": "user_id",
      "username": "username",
      "email": "email",
      "profile": { /* profile object */ }
    }
  ]
}
```

#### Add Contact
```
POST /users/contacts/:userId
Authorization: Bearer <token>

Response (201):
{
  "message": "Contact added",
  "contact": { /* contact object */ }
}
```

#### Remove Contact
```
DELETE /users/contacts/:userId
Authorization: Bearer <token>

Response (200):
{
  "message": "Contact removed"
}
```

#### Search Users
```
GET /users/search?q=search_query
Authorization: Bearer <token>

Response (200):
{
  "results": [
    { /* user objects */ }
  ]
}
```

### Messages

#### Get Messages with User
```
GET /messages/:recipientId
Authorization: Bearer <token>

Query Parameters:
  - limit: number (default: 50)
  - skip: number (default: 0)

Response (200):
{
  "messages": [
    {
      "_id": "message_id",
      "sender": "user_id",
      "recipient": "user_id",
      "content": "message content",
      "type": "text|audio|video|note",
      "mediaUrl": "url",
      "read": boolean,
      "timestamp": "ISO_date"
    }
  ],
  "total": number
}
```

#### Send Message
```
POST /messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "user_id",
  "content": "message content",
  "type": "text|audio|video|note",
  "mediaUrl": "url" (optional)
}

Response (201):
{
  "message": {
    "_id": "message_id",
    "sender": "user_id",
    "recipient": "user_id",
    "content": "message content",
    "type": "text",
    "timestamp": "ISO_date"
  }
}
```

#### Upload Media
```
POST /messages/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
  - file: File object

Response (200):
{
  "url": "media_url",
  "filename": "filename",
  "size": number,
  "type": "file_type"
}
```

#### Mark Messages as Read
```
PUT /messages/:recipientId/read
Authorization: Bearer <token>

Response (200):
{
  "message": "Messages marked as read"
}
```

### Voice Analysis

#### Submit Voice Analysis
```
POST /voice-analysis
Authorization: Bearer <token>
Content-Type: application/json

{
  "callDuration": number,
  "emotionalState": "happy|sad|angry|calm|stressed|tired|neutral",
  "confidence": number (0-1),
  "detectedPatterns": ["pattern1", "pattern2"],
  "notes": "optional notes"
}

Response (201):
{
  "analysis": {
    "_id": "analysis_id",
    "userId": "user_id",
    "callDuration": number,
    "emotionalState": "string",
    "confidence": number,
    "detectedPatterns": ["string"],
    "timestamp": "ISO_date"
  }
}
```

#### Get Voice Analysis History
```
GET /voice-analysis/history
Authorization: Bearer <token>

Query Parameters:
  - limit: number (default: 50)
  - skip: number (default: 0)

Response (200):
{
  "analyses": [
    { /* analysis objects */ }
  ],
  "total": number
}
```

#### Get Analysis Statistics
```
GET /voice-analysis/statistics
Authorization: Bearer <token>

Response (200):
{
  "totalAnalyses": number,
  "averageConfidence": number,
  "emotionalStates": {
    "happy": number,
    "sad": number,
    "angry": number,
    /* ... */
  },
  "detectedPatterns": {
    "pattern": count,
    /* ... */
  }
}
```

## WebSocket Events

### Client → Server Events

#### Send Message
```javascript
socket.emit('message', {
  recipientId: 'user_id',
  content: 'message content',
  type: 'text',
  timestamp: new Date()
});
```

#### Voice Analysis
```javascript
socket.emit('voice-analysis', {
  callId: 'call_id',
  emotionalState: 'happy',
  confidence: 0.85,
  detectedPatterns: ['pattern']
});
```

#### Initiate Call
```javascript
socket.emit('call-initiate', {
  targetUserId: 'user_id',
  callType: 'audio|video'
});
```

#### Answer Call
```javascript
socket.emit('call-answer', {
  callId: 'call_id',
  answer: webrtcAnswer
});
```

#### End Call
```javascript
socket.emit('call-end', {
  callId: 'call_id'
});
```

#### Update User Status
```javascript
socket.emit('user-status', {
  status: 'online|offline|away'
});
```

### Server → Client Events

#### New Message
```javascript
socket.on('message', (data) => {
  // {
  //   _id: 'message_id',
  //   sender: 'user_id',
  //   content: 'content',
  //   type: 'text',
  //   timestamp: date
  // }
});
```

#### Voice Analysis Result
```javascript
socket.on('voice-analysis-result', (data) => {
  // {
  //   callId: 'call_id',
  //   emotionalState: 'happy',
  //   confidence: 0.85,
  //   patterns: ['pattern']
  // }
});
```

#### Incoming Call
```javascript
socket.on('incoming-call', (data) => {
  // {
  //   callId: 'call_id',
  //   from: 'user_id',
  //   callType: 'audio|video',
  //   offer: webrtcOffer
  // }
});
```

#### Call Answered
```javascript
socket.on('call-answered', (data) => {
  // {
  //   callId: 'call_id',
  //   answer: webrtcAnswer
  // }
});
```

#### Call Ended
```javascript
socket.on('call-ended', (data) => {
  // {
  //   callId: 'call_id',
  //   reason: 'completed|rejected|timeout'
  // }
});
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 422 | Unprocessable | Validation error |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Internal error |
| 503 | Service Unavailable | Service down |

## Rate Limiting

Rate limits are applied per user:
- 100 requests per minute for standard endpoints
- 30 requests per minute for upload endpoints
- 1000 WebSocket events per minute

## Pagination

Endpoints with collection responses support pagination:

```
GET /endpoint?limit=50&skip=0
```

- `limit`: Maximum number of results (default: 50, max: 100)
- `skip`: Number of results to skip (default: 0)

---

For more information, see the backend README.md
