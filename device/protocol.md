# SmartLab Device Communication Protocol

## Overview

This document describes the communication protocol between the SmartLab HMI mobile application, backend server, and physical device (ESP32 or similar microcontroller).

## Communication Channels

### 1. BLE (Bluetooth Low Energy) - App ↔ Device

Used for direct device control when in close proximity.

### 2. HTTP/WebSocket - App ↔ Backend

Used for real-time data streaming and command logging.

### 3. HTTP - Device ↔ Backend

Used by the device to report sensor readings and events.

---

## BLE Protocol Specification

### Service Definition

| Attribute | Value |
|-----------|-------|
| Service Name | SmartLab Device Service |
| Service UUID | `0000180A-0000-1000-8000-00805F9B34FB` |

### Characteristics

#### Command Characteristic (Write)

| Attribute | Value |
|-----------|-------|
| UUID | `00002A57-0000-1000-8000-00805F9B34FB` |
| Properties | Write, Write Without Response |
| Description | Send commands to the device |

**Command Format (JSON):**

```json
{
  "command": "LED_ON" | "LED_OFF" | "MODE_AUTO" | "MODE_MANUAL" | "SET_THRESHOLD" | "EMERGENCY_STOP",
  "payload": {
    // Command-specific payload
  }
}
```

**Command Examples:**

```json
// Turn LED on
{ "command": "LED_ON" }

// Turn LED off
{ "command": "LED_OFF" }

// Set automatic mode
{ "command": "MODE_AUTO" }

// Set manual mode
{ "command": "MODE_MANUAL" }

// Set temperature threshold
{ "command": "SET_THRESHOLD", "payload": { "threshold": 35.0 } }

// Emergency stop
{ "command": "EMERGENCY_STOP" }
```

#### Status Characteristic (Notify)

| Attribute | Value |
|-----------|-------|
| UUID | `00002A58-0000-1000-8000-00805F9B34FB` |
| Properties | Read, Notify |
| Description | Device status and event notifications |

**Status Format (JSON):**

```json
{
  "type": "MODE_CHANGED" | "BUTTON_PRESSED" | "LED_STATE_CHANGED" | "THRESHOLD_EXCEEDED",
  "payload": {
    // Event-specific payload
  },
  "timestamp": 1702300000000
}
```

**Status Examples:**

```json
// Mode changed event
{
  "type": "MODE_CHANGED",
  "payload": { "mode": "AUTO" },
  "timestamp": 1702300000000
}

// Button pressed event
{
  "type": "BUTTON_PRESSED",
  "payload": { "button": "MODE" },
  "timestamp": 1702300000000
}

// LED state changed
{
  "type": "LED_STATE_CHANGED",
  "payload": { "state": true },
  "timestamp": 1702300000000
}

// Threshold exceeded warning
{
  "type": "THRESHOLD_EXCEEDED",
  "payload": { "temperature": 42.5, "threshold": 35.0 },
  "timestamp": 1702300000000
}
```

#### Sensor Characteristic (Notify)

| Attribute | Value |
|-----------|-------|
| UUID | `00002A59-0000-1000-8000-00805F9B34FB` |
| Properties | Read, Notify |
| Description | Live sensor readings |

**Sensor Format (JSON):**

```json
{
  "temperature": 25.5,
  "humidity": 45.2,
  "timestamp": 1702300000000
}
```

---

## HTTP Protocol (Device ↔ Backend)

### Device Registration

The device registers itself with the backend on first connection or when firmware is updated.

**Request:**
```http
POST /devices
Content-Type: application/json

{
  "name": "SmartLab-001",
  "firmwareVersion": "1.0.0"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "SmartLab-001",
  "firmwareVersion": "1.0.0",
  "createdAt": "2025-12-11T10:00:00Z"
}
```

### Sensor Readings

The device posts sensor readings at regular intervals (typically every 3 seconds).

**Request:**
```http
POST /devices/{deviceId}/readings
Content-Type: application/json

{
  "temperature": 25.5,
  "humidity": 45.2
}
```

**Response:**
```json
{
  "id": 12345,
  "deviceId": "550e8400-e29b-41d4-a716-446655440000",
  "temperature": 25.5,
  "humidity": 45.2,
  "createdAt": "2025-12-11T10:00:00Z"
}
```

### Device Events

The device reports events (button presses, mode changes, etc.) to the backend.

**Request:**
```http
POST /devices/{deviceId}/events
Content-Type: application/json

{
  "eventType": "MODE_CHANGED",
  "payload": {
    "mode": "AUTO",
    "triggeredBy": "BUTTON"
  }
}
```

**Response:**
```json
{
  "id": 456,
  "deviceId": "550e8400-e29b-41d4-a716-446655440000",
  "eventType": "MODE_CHANGED",
  "payload": { "mode": "AUTO", "triggeredBy": "BUTTON" },
  "createdAt": "2025-12-11T10:00:00Z"
}
```

---

## WebSocket Protocol (App ↔ Backend)

### Connection

```javascript
const ws = new WebSocket('ws://backend-host:4000');
```

### Subscribe to Device

After connecting, the app subscribes to a specific device's updates.

**Client → Server:**
```json
{
  "type": "subscribe",
  "deviceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Real-time Reading

When a new sensor reading is posted, the backend broadcasts to subscribed clients.

**Server → Client:**
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

### Device Event

When the device reports an event, the backend broadcasts to subscribed clients.

**Server → Client:**
```json
{
  "type": "device_event",
  "event": {
    "deviceId": "550e8400-e29b-41d4-a716-446655440000",
    "eventType": "MODE_CHANGED",
    "payload": { "mode": "AUTO" },
    "createdAt": "2025-12-11T10:00:00Z"
  }
}
```

---

## Device State Machine

```
                    ┌──────────────────────────────────────────┐
                    │                                          │
                    ▼                                          │
              ┌──────────┐                               ┌─────────┐
  Power On   │          │  Button Press / App Command   │         │
────────────►│   IDLE   │◄──────────────────────────────│  ACTIVE │
              │          │                               │         │
              └────┬─────┘                               └────┬────┘
                   │                                          │
                   │ Sensor Read Timer                        │ Threshold
                   │                                          │ Exceeded
                   ▼                                          ▼
              ┌──────────┐                               ┌─────────┐
              │          │                               │         │
              │ READING  │                               │ WARNING │
              │          │                               │         │
              └────┬─────┘                               └────┬────┘
                   │                                          │
                   │ Post to Backend                          │ Emergency
                   │                                          │ Stop
                   ▼                                          ▼
              ┌──────────┐                               ┌─────────┐
              │          │                               │         │
              │   IDLE   │                               │  SAFE   │
              │          │                               │         │
              └──────────┘                               └─────────┘
```

---

## Safety Interlocks

### Temperature Thresholds

| Level | Temperature | Action |
|-------|-------------|--------|
| Normal | < 35°C | Normal operation |
| Warning | 35°C - 45°C | Warning notification, reduced functionality |
| Critical | > 45°C | Emergency stop, all outputs disabled |

### Safety Rules

1. **Emergency Stop Priority**: Emergency stop command always takes precedence
2. **Physical Button Override**: Physical button can always change mode
3. **Auto-Recovery Disabled**: After critical threshold, device requires manual reset
4. **Command Rate Limiting**: Max 10 commands per second from app
5. **Watchdog Timer**: Device resets if no heartbeat from backend for 5 minutes

---

## Error Codes

| Code | Description |
|------|-------------|
| E001 | BLE connection failed |
| E002 | Backend unreachable |
| E003 | Invalid command format |
| E004 | Command rejected (safety interlock) |
| E005 | Sensor read failure |
| E006 | Threshold exceeded |
| E007 | Device in emergency stop mode |
| E008 | Firmware update required |

---

## Firmware Update Protocol

### OTA Update Flow

1. Backend notifies device of available update
2. Device downloads firmware in chunks
3. Device verifies checksum
4. Device reboots into bootloader
5. Bootloader applies update
6. Device reports new firmware version

```json
// Update available notification
{
  "type": "FIRMWARE_UPDATE",
  "payload": {
    "version": "1.1.0",
    "url": "https://firmware.smartlab.com/v1.1.0.bin",
    "checksum": "sha256:abc123...",
    "size": 524288
  }
}
```

---

## Testing

### Simulator Mode

The backend includes a device simulator (`npm run simulate`) that:
- Generates realistic sensor data
- Simulates button presses
- Posts readings every 3 seconds
- Triggers threshold warnings

### Mock BLE

The mobile app's BLE service falls back to mock mode when:
- Native module is not available
- Running on emulator without BLE support

This allows testing the full flow without physical hardware.
