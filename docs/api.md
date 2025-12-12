# SmartLab HMI Controller - API Documentation

## Base URL

```
Development: http://localhost:4000
Production: https://api.smartlab.example.com
```

## Authentication

All API endpoints (except `/health`) require authentication via Bearer token.

```
Authorization: Bearer <token>
```

## REST Endpoints

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-11T10:00:00Z",
  "version": "1.0.0"
}
```

---

### Devices

#### List All Devices

```http
GET /devices
```

**Response:**
```json
{
  "devices": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "SmartLab-001",
      "firmwareVersion": "1.2.0",
      "lastSeen": "2025-12-11T10:00:00Z"
    }
  ]
}
```

#### Get Device Details

```http
GET /devices/:id
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | UUID | Device unique identifier |

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "SmartLab-001",
  "firmwareVersion": "1.2.0",
  "lastSeen": "2025-12-11T10:00:00Z",
  "status": {
    "mode": "AUTO",
    "ledState": "ON",
    "threshold": 35.0
  }
}
```

#### Register Device

```http
POST /devices
```

**Request Body:**
```json
{
  "name": "SmartLab-001",
  "firmwareVersion": "1.2.0"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "SmartLab-001",
  "firmwareVersion": "1.2.0",
  "createdAt": "2025-12-11T10:00:00Z"
}
```

---

### Readings

#### Post Sensor Reading

```http
POST /devices/:id/readings
```

**Request Body:**
```json
{
  "temperature": 25.5,
  "humidity": 45.2
}
```

**Response:**
```json
{
  "id": 1,
  "deviceId": "550e8400-e29b-41d4-a716-446655440000",
  "temperature": 25.5,
  "humidity": 45.2,
  "createdAt": "2025-12-11T10:00:00Z"
}
```

#### Get Reading History

```http
GET /devices/:id/readings
```

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| limit | number | 100 | Max records to return |
| offset | number | 0 | Pagination offset |
| from | ISO date | - | Start date filter |
| to | ISO date | - | End date filter |

**Response:**
```json
{
  "readings": [
    {
      "id": 1,
      "deviceId": "550e8400-e29b-41d4-a716-446655440000",
      "temperature": 25.5,
      "humidity": 45.2,
      "createdAt": "2025-12-11T10:00:00Z"
    }
  ],
  "total": 1000,
  "limit": 100,
  "offset": 0
}
```

---

### Commands

#### Log Command

```http
POST /devices/:id/commands
```

**Request Body:**
```json
{
  "commandType": "LED_ON",
  "payload": {
    "brightness": 100
  }
}
```

**Command Types:**
| Type | Description |
|------|-------------|
| LED_ON | Turn LED on |
| LED_OFF | Turn LED off |
| MODE_AUTO | Set automatic mode |
| MODE_MANUAL | Set manual mode |
| SET_THRESHOLD | Set temperature threshold |
| EMERGENCY_STOP | Emergency shutdown |

**Response:**
```json
{
  "id": 1,
  "deviceId": "550e8400-e29b-41d4-a716-446655440000",
  "commandType": "LED_ON",
  "payload": {
    "brightness": 100
  },
  "createdAt": "2025-12-11T10:00:00Z"
}
```

#### Get Command History

```http
GET /devices/:id/commands
```

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| limit | number | 100 | Max records to return |
| offset | number | 0 | Pagination offset |

**Response:**
```json
{
  "commands": [
    {
      "id": 1,
      "deviceId": "550e8400-e29b-41d4-a716-446655440000",
      "commandType": "LED_ON",
      "payload": { "brightness": 100 },
      "createdAt": "2025-12-11T10:00:00Z"
    }
  ],
  "total": 50,
  "limit": 100,
  "offset": 0
}
```

---

## WebSocket API

### Connection

```javascript
const socket = new WebSocket('ws://localhost:4000');
```

### Subscribe to Device

After connection, send a subscribe message to receive updates for a specific device.

```javascript
socket.send(JSON.stringify({
  type: 'subscribe',
  deviceId: '550e8400-e29b-41d4-a716-446655440000'
}));
```

### Message Types

#### Reading Update

Received when new sensor reading is posted.

```json
{
  "type": "reading",
  "reading": {
    "deviceId": "550e8400-e29b-41d4-a716-446655440000",
    "temperature": 25.5,
    "humidity": 45.2,
    "createdAt": "2025-12-11T10:00:00Z"
  }
}
```

#### Device Event

Received when device state changes (e.g., button press).

```json
{
  "type": "device_event",
  "event": {
    "deviceId": "550e8400-e29b-41d4-a716-446655440000",
    "eventType": "MODE_CHANGED",
    "payload": {
      "mode": "AUTO"
    },
    "createdAt": "2025-12-11T10:00:00Z"
  }
}
```

#### Connection Status

```json
{
  "type": "connection_status",
  "status": "connected",
  "deviceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "Device with ID 550e8400-e29b-41d4-a716-446655440000 not found",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_REQUEST | 400 | Malformed request body |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| DEVICE_NOT_FOUND | 404 | Device does not exist |
| VALIDATION_ERROR | 422 | Invalid field values |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| POST /devices/:id/readings | 10 req/sec per device |
| POST /devices/:id/commands | 5 req/sec per device |
| GET endpoints | 100 req/min per client |

---

## WebSocket Heartbeat

The server sends a ping every 30 seconds. Clients should respond with a pong to maintain the connection.

```javascript
socket.on('ping', () => {
  socket.pong();
});
```
