# 🧪 SmartLab HMI Controller

<p align="center">
  <img src="https://raw.githubusercontent.com/Kiran-kata/smartlab-hmi/main/screenshots/app_icon.png" alt="SmartLab HMI" width="120"/>
</p>

<p align="center">
  <strong>A modern mobile Human-Machine Interface for smart laboratory equipment monitoring and control</strong>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-api-reference">API Reference</a>
</p>

---

## 📖 Overview

### What is SmartLab HMI Controller?

**SmartLab HMI Controller** is a comprehensive mobile application that serves as the primary control interface for smart laboratory equipment. Built with **React Native** and following **Apple Human Interface Guidelines**, it provides an intuitive, touch-based interface for monitoring sensor data, controlling device states, and managing laboratory equipment remotely.

The application replaces or extends traditional physical controls (buttons, LEDs, small displays) with a modern, feature-rich graphical interface that lab technicians and engineers can use from their Android devices.

### Why This Project?

In modern laboratories, equipment often needs to be:
- **Monitored remotely** - Check sensor readings without being physically present
- **Controlled safely** - Adjust settings through a validated interface
- **Logged comprehensively** - Track all readings and commands for compliance
- **Alerted proactively** - Receive visual warnings when thresholds are exceeded

SmartLab HMI Controller addresses all these needs with a single, well-designed mobile application.

---

## 🔬 What Does It Control?

The app interfaces with **SmartLab devices** - environmental chambers, sensor hubs, or lab controller boxes that include:

### 🌡️ Environmental Sensors
| Sensor | Range | Accuracy | Update Rate |
|--------|-------|----------|-------------|
| **Temperature** | -40°C to +85°C | ±0.5°C | 1 second |
| **Humidity** | 0% to 100% RH | ±2% RH | 1 second |

*Expandable to pressure, gas levels, light intensity, and more.*

### 💡 LED Status Indicators
Visual feedback through programmable LED states:
- 🟢 **Green (Normal)** - All readings within acceptable range
- 🟡 **Yellow (Warning)** - Approaching threshold limits
- 🔴 **Red (Critical)** - Threshold exceeded, immediate attention required

### ⚙️ Operating Modes
| Mode | Description | Use Case |
|------|-------------|----------|
| **AUTO** | Device autonomously responds to sensor readings | Normal operation, hands-off monitoring |
| **MANUAL** | User has direct control over all outputs | Testing, calibration, override situations |

### 🎚️ Safety Thresholds
- Configure temperature and humidity alert thresholds
- Real-time visual warnings when limits are approached or exceeded
- Automatic LED/alarm triggering on threshold breach
- Threshold changes logged for audit compliance

### 📊 Data Streaming & Logging
- Real-time WebSocket streaming for live dashboard updates
- All sensor readings persisted to PostgreSQL database
- Command history tracked with timestamps and user context
- Export capabilities for analysis and compliance reporting

---

## 🎯 Real-World Use Cases

### Laboratory Monitoring Scenario

A **lab technician** needs to monitor an incubation chamber remotely:

1. **Opens SmartLab HMI Controller** on their Android device
2. **Scans for nearby devices** via Bluetooth Low Energy (BLE)
3. **Connects to the target chamber** - sees live temperature/humidity
4. **Sets safety thresholds** - e.g., alert if temp > 37.5°C
5. **Monitors from their desk** - real-time updates via WebSocket
6. **Receives visual alerts** - if readings go out of range
7. **Reviews history** - all data saved for lab notebook documentation

### Primary Application Areas

| Application | Description |
|-------------|-------------|
| **Environmental Chambers** | Monitor and control temperature/humidity in growth chambers, incubators |
| **Clean Rooms** | Track environmental conditions for manufacturing compliance |
| **Cold Storage** | Monitor refrigerators, freezers, cryogenic storage |
| **Process Monitoring** | Real-time oversight of chemical reactions, fermentation |
| **Quality Control** | Environmental logging for ISO/GMP compliance |

---

## 📸 Screenshots

<p align="center">
  <img src="https://raw.githubusercontent.com/Kiran-kata/smartlab-hmi/main/screenshots/01_login_screen.png" width="200" alt="Login Screen"/>
  &nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/Kiran-kata/smartlab-hmi/main/screenshots/02_device_list.png" width="200" alt="Device List"/>
  &nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/Kiran-kata/smartlab-hmi/main/screenshots/03_dashboard.png" width="200" alt="Dashboard"/>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/Kiran-kata/smartlab-hmi/main/screenshots/04_control_panel.png" width="200" alt="Control Panel"/>
  &nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/Kiran-kata/smartlab-hmi/main/screenshots/05_ble_scan.png" width="200" alt="BLE Scan"/>
</p>

### Screen Descriptions

| Screen | Purpose | Key Features |
|--------|---------|--------------|
| **Login** | User authentication | Clean Apple-style design, gradient header, secure input |
| **Device List** | Device management | All registered devices, connection status, quick access |
| **Dashboard** | Real-time monitoring | Animated gauge visualization, live temp/humidity readings |
| **Control Panel** | Device control | LED toggle, mode switching, threshold adjustment, command history |
| **BLE Scan** | Device discovery | Bluetooth scanning, signal strength indicators, device pairing |

---

## ✨ Features

### 📱 Mobile Application

| Feature | Description |
|---------|-------------|
| **Apple HIG Design** | Clean, modern iOS-style interface with consistent typography and spacing |
| **Real-time Dashboard** | Animated gauge visualization with live sensor data updates |
| **BLE Connectivity** | Bluetooth Low Energy for direct device communication |
| **WebSocket Streaming** | Sub-100ms latency for live data updates |
| **Native Animations** | Smooth React Native Animated API for fluid UI transitions |
| **Offline Capability** | Mock mode for development and testing without physical hardware |
| **Type Safety** | Full TypeScript implementation for reliability |

### 🖥️ Backend Server

| Feature | Description |
|---------|-------------|
| **RESTful API** | Complete CRUD operations for devices, readings, commands |
| **WebSocket Server** | Real-time pub/sub system for connected clients |
| **PostgreSQL Storage** | Persistent, reliable data storage with proper indexing |
| **In-Memory Fallback** | Works without database for quick development setup |
| **Health Monitoring** | `/health` endpoint for infrastructure health checks |
| **Type Safety** | Full TypeScript implementation |

### 🔌 Device Communication

| Protocol | Purpose | Details |
|----------|---------|---------|
| **BLE GATT** | Local control | Custom service UUID with read/write/notify characteristics |
| **WebSocket** | Real-time sync | Bi-directional streaming for live updates |
| **REST API** | Management | Device registration, history retrieval, configuration |

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP                                │
│                    (React Native + TypeScript)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Screens    │  │   Services   │  │    Theme     │          │
│  │  - Dashboard │  │  - API       │  │  - Colors    │          │
│  │  - Control   │  │  - BLE       │  │  - Typography│          │
│  │  - BLE Scan  │  │  - WebSocket │  │  - Spacing   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────┬──────────────────────────────┬─────────────────────┘
             │                              │
             │ BLE (Local)                  │ HTTP/WebSocket (Remote)
             │                              │
             ▼                              ▼
┌─────────────────────┐          ┌─────────────────────────────────┐
│    SMARTLAB DEVICE  │          │         BACKEND SERVER          │
│       (ESP32)       │          │      (Node.js + Express)        │
│  ┌───────────────┐  │          │  ┌───────────┐ ┌─────────────┐ │
│  │ BLE GATT      │  │  Wi-Fi   │  │ REST API  │ │  WebSocket  │ │
│  │ Server        │◄─┼──────────┼─►│ /devices  │ │   Pub/Sub   │ │
│  └───────────────┘  │          │  │ /readings │ │             │ │
│  ┌───────────────┐  │          │  └───────────┘ └─────────────┘ │
│  │ DHT22/BME280  │  │          │         │                       │
│  │ Sensors       │  │          │         ▼                       │
│  └───────────────┘  │          │  ┌─────────────────────┐       │
│  ┌───────────────┐  │          │  │    PostgreSQL       │       │
│  │ GPIO (LEDs)   │  │          │  │    Database         │       │
│  └───────────────┘  │          │  └─────────────────────┘       │
└─────────────────────┘          └─────────────────────────────────┘
```

### Data Flow

| Flow | Path | Description |
|------|------|-------------|
| **Sensor → Backend** | Device → Wi-Fi → Server → DB | Sensor readings stored for history |
| **Backend → App** | Server → WebSocket → Mobile | Real-time updates pushed to app |
| **App → Device (Local)** | Mobile → BLE → Device | Direct commands when nearby |
| **App → Device (Remote)** | Mobile → API → Server → Device | Remote commands via backend |

---

## 📂 Project Structure

```
smartlab-hmi/
│
├── 📁 backend/                      # Node.js backend server
│   ├── src/
│   │   ├── routes/                 # REST API endpoint handlers
│   │   │   ├── devices.ts         # Device CRUD operations
│   │   │   ├── readings.ts        # Sensor data endpoints
│   │   │   └── commands.ts        # Command dispatch endpoints
│   │   ├── repositories/          # Data access layer
│   │   │   ├── deviceRepository.ts
│   │   │   └── readingRepository.ts
│   │   ├── websocket/             # Real-time communication
│   │   │   └── wsManager.ts       # WebSocket connection manager
│   │   ├── types/                 # TypeScript type definitions
│   │   └── server.ts              # Application entry point
│   ├── dist/                      # Compiled JavaScript output
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 mobile/                       # React Native mobile application
│   ├── src/
│   │   ├── screens/               # Application screens
│   │   │   ├── LoginScreen.tsx   # User authentication
│   │   │   ├── DeviceListScreen.tsx
│   │   │   ├── DashboardScreen.tsx   # Real-time monitoring
│   │   │   ├── ControlScreen.tsx     # Device control
│   │   │   └── BLEConnectScreen.tsx  # Bluetooth scanning
│   │   ├── components/            # Reusable UI components
│   │   │   └── CommandSuccessAnimation.tsx
│   │   ├── services/              # External service integrations
│   │   │   ├── api.ts            # REST API client
│   │   │   ├── bleService.ts     # Bluetooth Low Energy
│   │   │   └── wsService.ts      # WebSocket client
│   │   ├── theme/                 # Design system
│   │   │   ├── colors.ts         # Color palette
│   │   │   ├── typography.ts     # Font styles
│   │   │   └── spacing.ts        # Layout constants
│   │   └── types/                 # TypeScript definitions
│   ├── android/                   # Android native code
│   │   └── app/src/main/java/
│   │       └── com/smartlabmobile/
│   │           └── SmartBle.kt   # Native BLE bridge
│   ├── package.json
│   ├── metro.config.js           # Metro bundler configuration
│   ├── app.json                  # React Native app configuration
│   └── tsconfig.json
│
├── 📁 device/                       # Firmware documentation
│   └── protocol.md                # BLE/MQTT protocol specification
│
├── 📁 screenshots/                  # Application screenshots
│   ├── 01_login_screen.png
│   ├── 02_device_list.png
│   ├── 03_dashboard.png
│   ├── 04_control_panel.png
│   └── 05_ble_scan.png
│
├── 📁 docs/                         # Additional documentation
│   ├── requirements.md
│   ├── architecture.md
│   └── api.md
│
└── README.md                        # This file
```

---

## 🛠️ Technology Stack

### Mobile Application

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.73.6 | Cross-platform mobile framework |
| **TypeScript** | 5.x | Type-safe JavaScript superset |
| **React Navigation** | 6.x | Screen navigation and routing |
| **Axios** | 1.x | HTTP client for REST API |
| **React Native Animated** | (built-in) | Smooth UI animations |

### Backend Server

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **TypeScript** | 5.x | Type-safe development |
| **Express.js** | 4.x | Web framework |
| **ws** | 8.x | WebSocket server |
| **PostgreSQL** | 15+ | Relational database |
| **pg** | 8.x | PostgreSQL client |

### Device Firmware

| Technology | Purpose |
|------------|---------|
| **ESP32** | Microcontroller with Wi-Fi/BLE |
| **DHT22/BME280** | Environmental sensors |
| **BLE GATT** | Local wireless communication |

### Design System

| Aspect | Implementation |
|--------|----------------|
| **Colors** | Apple System Colors (Primary #007AFF, Success #34C759, Error #FF3B30) |
| **Typography** | SF Pro-inspired sizing (Title 34px, Headline 17px, Body 15px) |
| **Spacing** | 8-point grid system (4, 8, 12, 16, 20, 24, 32px) |
| **Shadows** | Subtle depth with low opacity (2px, 4px, 8px offsets) |
| **Border Radius** | Consistent rounding (8px small, 12px medium, 16px large) |

---

## 📦 Installation

### Prerequisites

| Requirement | Version | Download |
|-------------|---------|----------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **npm** | 9+ | Included with Node.js |
| **Android Studio** | Latest | [developer.android.com](https://developer.android.com/studio) |
| **JDK** | 17 | Included with Android Studio |
| **PostgreSQL** | 15+ (optional) | [postgresql.org](https://www.postgresql.org/download/) |

### Step 1: Clone Repository

```bash
git clone https://github.com/Kiran-kata/smartlab-hmi.git
cd smartlab-hmi
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration (optional)
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_USER=smartlab
DB_PASS=smartlab
DB_NAME=smartlab
PORT=4000
EOF

# Build TypeScript
npm run build

# Start server (development mode with auto-reload)
npm run dev

# Or start compiled version (production)
node dist/server.js
```

The backend will start on `http://localhost:4000`. If PostgreSQL is not configured, it will automatically use an in-memory data store.

### Step 3: Mobile App Setup

```bash
# Navigate to mobile directory
cd ../mobile

# Install dependencies
npm install

# Start Metro bundler
npx react-native start

# In a separate terminal, build and run on Android
npx react-native run-android
```

### Step 4: Connect Emulator to Backend

If using Android Emulator, the backend runs on your host machine. Configure port forwarding:

```bash
# Forward backend port to emulator
adb reverse tcp:4000 tcp:4000
```

---

## 🔌 API Reference

### REST Endpoints

#### Health Check
```http
GET /health
```
Returns server status and uptime.

#### Devices

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/devices` | List all registered devices | - |
| `POST` | `/devices` | Register a new device | `{ name, firmwareVersion }` |
| `GET` | `/devices/:id` | Get device details | - |
| `DELETE` | `/devices/:id` | Remove a device | - |

#### Readings

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| `GET` | `/devices/:id/readings` | Get historical readings | `limit`, `offset` |
| `GET` | `/devices/:id/readings/latest` | Get most recent reading | - |
| `POST` | `/devices/:id/readings` | Submit new reading | `{ temperature, humidity }` |

#### Commands

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/devices/:id/commands` | Get command history | Query: `limit`, `offset` |
| `POST` | `/devices/:id/commands` | Send command to device | `{ commandType, payload }` |

### WebSocket Events

Connect to `ws://localhost:4000` for real-time updates.

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `subscribe` | Client → Server | `{ deviceId }` | Subscribe to device updates |
| `unsubscribe` | Client → Server | `{ deviceId }` | Unsubscribe from device |
| `reading` | Server → Client | `{ deviceId, temperature, humidity, timestamp }` | New sensor reading |
| `status` | Server → Client | `{ deviceId, connected, mode }` | Device status change |
| `command` | Client → Server | `{ deviceId, type, payload }` | Send command |

### BLE Commands

| Command | Payload | Description |
|---------|---------|-------------|
| `LED_ON` | - | Turn status LED on |
| `LED_OFF` | - | Turn status LED off |
| `MODE_AUTO` | - | Switch to automatic mode |
| `MODE_MANUAL` | - | Switch to manual mode |
| `SET_THRESHOLD` | `{ threshold: number }` | Set temperature alert threshold |
| `START_STREAM` | - | Begin continuous data streaming |
| `STOP_STREAM` | - | Stop data streaming |

---

## 🧪 Testing

### Emulator Mode (No Hardware Required)

The app automatically detects when running in an Android emulator and activates **mock mode**:

- **3 simulated BLE devices** appear in the scan list
- **Random sensor readings** are generated (20-40°C, 30-70% RH)
- **All commands** work with simulated responses
- **WebSocket connection** uses mock data stream

This allows full testing of the UI and user flows without physical SmartLab hardware.

### Physical Device Testing

1. Enable **USB Debugging** on your Android device
2. Connect via USB cable
3. Run `adb devices` to verify connection
4. Run `npx react-native run-android`
5. The app will use real BLE to scan for SmartLab devices

### Backend Testing

```bash
# Test health endpoint
curl http://localhost:4000/health

# Create a test device
curl -X POST http://localhost:4000/devices \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Device", "firmwareVersion": "1.0.0"}'

# Get all devices
curl http://localhost:4000/devices
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Use **TypeScript** for all new code
- Follow existing **ESLint** configuration
- Maintain **Apple HIG** design consistency
- Add **JSDoc comments** for public functions
- Include **type definitions** for all exports

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Kiran Kata**

- GitHub: [@Kiran-kata](https://github.com/Kiran-kata)
- Repository: [smartlab-hmi](https://github.com/Kiran-kata/smartlab-hmi)

---

<p align="center">
  <strong>SmartLab HMI Controller</strong><br/>
  Modern laboratory equipment monitoring and control
</p>
