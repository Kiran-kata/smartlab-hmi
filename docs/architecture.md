# SmartLab HMI Controller - Architecture

## System Overview

The SmartLab HMI Controller system consists of three main components:

1. **Mobile App** - React Native Android application
2. **Backend Server** - Node.js/Express with WebSocket support
3. **SmartLab Device** - ESP32-based IoT device

```
┌─────────────────────────────────────────────────────────────────────┐
│                           SYSTEM ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────┐         ┌───────────────┐         ┌─────────────┐ │
│  │   Mobile App  │◄───────►│    Backend    │◄───────►│   Device    │ │
│  │  React Native │   WS    │   Node.js     │  HTTP   │   ESP32     │ │
│  │   (Android)   │   +     │   Express     │         │   BLE/WiFi  │ │
│  └───────┬───────┘  REST   └───────┬───────┘         └──────┬──────┘ │
│          │                         │                         │        │
│          │         BLE             │                         │        │
│          └─────────────────────────┼─────────────────────────┘        │
│                                    │                                  │
│                           ┌────────┴────────┐                        │
│                           │   PostgreSQL    │                        │
│                           │    Database     │                        │
│                           └─────────────────┘                        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Communication Protocols

### 1. BLE Communication (App ↔ Device)

Used for local device control and status monitoring.

```
┌─────────────────────────────────────────────────────────┐
│                    BLE Service                          │
├─────────────────────────────────────────────────────────┤
│  Service UUID: 0000180A-0000-1000-8000-00805F9B34FB    │
├─────────────────────────────────────────────────────────┤
│  Characteristics:                                       │
│  ├── Command (Write)                                    │
│  │   UUID: 00002A57-0000-1000-8000-00805F9B34FB        │
│  │   - LED_ON, LED_OFF, MODE_AUTO, MODE_MANUAL         │
│  │                                                      │
│  ├── Status (Notify)                                    │
│  │   UUID: 00002A58-0000-1000-8000-00805F9B34FB        │
│  │   - Mode, LED state, button events                  │
│  │                                                      │
│  └── Sensor (Notify)                                    │
│      UUID: 00002A59-0000-1000-8000-00805F9B34FB        │
│      - Temperature, humidity readings                   │
└─────────────────────────────────────────────────────────┘
```

### 2. WebSocket Communication (App ↔ Backend)

Used for real-time sensor data streaming.

```
┌─────────────────────────────────────────────────────────┐
│                 WebSocket Protocol                       │
├─────────────────────────────────────────────────────────┤
│  Connection: ws://backend:4000                          │
├─────────────────────────────────────────────────────────┤
│  Messages:                                              │
│                                                          │
│  Client → Server:                                        │
│  {                                                       │
│    "type": "subscribe",                                 │
│    "deviceId": "uuid"                                   │
│  }                                                       │
│                                                          │
│  Server → Client:                                        │
│  {                                                       │
│    "type": "reading",                                   │
│    "reading": {                                         │
│      "deviceId": "uuid",                                │
│      "temperature": 25.5,                               │
│      "humidity": 45.2,                                  │
│      "createdAt": "2025-12-11T10:00:00Z"               │
│    }                                                     │
│  }                                                       │
│                                                          │
│  Server → Client:                                        │
│  {                                                       │
│    "type": "device_event",                              │
│    "event": {                                           │
│      "deviceId": "uuid",                                │
│      "eventType": "MODE_CHANGED",                       │
│      "payload": { "mode": "AUTO" }                      │
│    }                                                     │
│  }                                                       │
└─────────────────────────────────────────────────────────┘
```

### 3. REST API (App/Device ↔ Backend)

Used for CRUD operations and command logging.

```
┌─────────────────────────────────────────────────────────┐
│                    REST Endpoints                        │
├─────────────────────────────────────────────────────────┤
│  GET    /health                    Health check         │
│  GET    /devices                   List all devices     │
│  GET    /devices/:id               Get device details   │
│  POST   /devices                   Register device      │
│  POST   /devices/:id/readings      Post sensor reading  │
│  GET    /devices/:id/readings      Get reading history  │
│  POST   /devices/:id/commands      Log command          │
│  GET    /devices/:id/commands      Get command history  │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### Mobile App Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE APP                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                    UI Layer                          │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  Screens/          Components/        Navigation/   │ │
│  │  ├── Login         ├── GaugeView      └── App      │ │
│  │  ├── DeviceList    ├── LottieAnim        Navigator │ │
│  │  ├── BLEConnect    ├── StatusBadge                 │ │
│  │  ├── Dashboard     └── ControlButton               │ │
│  │  └── Control                                        │ │
│  └─────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                  Service Layer                       │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  api.ts            ws.ts            ble.ts          │ │
│  │  (Axios REST)      (WebSocket)      (Native BLE)    │ │
│  └─────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                  Native Layer                        │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  SmartBleModule.kt                                  │ │
│  │  ├── scanDevices()                                  │ │
│  │  ├── connectToDevice()                              │ │
│  │  ├── writeCommand()                                 │ │
│  │  └── subscribeToNotifications()                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BACKEND SERVER                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                  HTTP Layer                          │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  Express.js                                         │ │
│  │  ├── REST routes                                    │ │
│  │  ├── Middleware (CORS, JSON)                        │ │
│  │  └── Error handling                                 │ │
│  └─────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                WebSocket Layer                       │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  ws (WebSocketServer)                               │ │
│  │  ├── Client management                              │ │
│  │  ├── Subscription handling                          │ │
│  │  └── Broadcast to subscribers                       │ │
│  └─────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                  Data Layer                          │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  PostgreSQL (pg client)                             │ │
│  │  ├── devices                                        │ │
│  │  ├── readings                                       │ │
│  │  └── command_logs                                   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Sensor Reading Flow

```
1. Device reads sensor → Posts to backend (HTTP)
2. Backend stores in DB → Broadcasts via WebSocket
3. Mobile receives WS message → Updates UI
4. UI renders new gauge/values with animation
```

### Control Command Flow

```
1. User taps control in app
2. App sends BLE command to device
3. Device executes command (LED on/off, mode change)
4. Device sends confirmation via BLE notify
5. App logs command to backend (REST)
6. Backend stores in command_logs table
7. App shows Lottie success animation
```

### Physical Button Flow

```
1. User presses physical button on device
2. Device changes mode internally
3. Device sends notification via BLE
4. Device posts event to backend
5. Backend broadcasts via WebSocket
6. All subscribed clients update their UI
```

## Safety Logic

```
┌─────────────────────────────────────────────────────────┐
│                    SAFETY CHECKS                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  IF temperature > HIGH_THRESHOLD (40°C):                │
│    - Show animated warning overlay                      │
│    - Disable non-essential commands                     │
│    - Log safety event                                   │
│                                                          │
│  IF temperature > CRITICAL_THRESHOLD (50°C):            │
│    - Force AUTO mode                                    │
│    - Show emergency notification                        │
│    - Disable all manual controls                        │
│                                                          │
│  Emergency Stop:                                         │
│    - Always accessible via floating button              │
│    - Sends EMERGENCY_STOP command                       │
│    - Device shuts down all outputs                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Mobile UI | React Native + TypeScript | Cross-platform UI |
| Navigation | React Navigation | Screen routing |
| Animations | Lottie | Micro-interactions |
| 3D Graphics | Three.js (WebView) | Gauge visualization |
| BLE | Kotlin Native Module | Device communication |
| Backend | Node.js + Express | REST API + WebSocket |
| Database | PostgreSQL | Data persistence |
| Real-time | WebSocket (ws) | Pub/sub streaming |
| Device | ESP32 | IoT hardware |
