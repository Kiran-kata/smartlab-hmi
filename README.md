# 🧪 SmartLab HMI Controller

<p align="center">
  <img src="https://raw.githubusercontent.com/Kiran-kata/smartlab-hmi/main/screenshots/app_icon.png" alt="SmartLab HMI" width="120"/>
</p>

<p align="center">
  <strong>A modern mobile Human-Machine Interface for smart lab equipment</strong>
</p>

<p align="center">
  <a href="#-live-demo">Live Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-architecture">Architecture</a>
</p>

---

## 📱 What is SmartLab HMI Controller?

**SmartLab HMI Controller** is a mobile app that acts as the control panel for a smart lab device.

> *"The app you use to monitor lab equipment in real time and control it safely from your phone."*

It replaces or extends the physical buttons, LEDs, and small displays on lab equipment with a richer, touch-based interface following **Apple Human Interface Guidelines** for a clean, intuitive user experience.

---

## 🔬 What Does It Control?

The app connects to a **SmartLab device** (environmental chamber, sensor hub, or lab controller box) that has:

### 🌡️ Sensors
- **Temperature** monitoring (°C)
- **Humidity** monitoring (%)
- Expandable to pressure, gas levels, etc.

### 💡 LED Status & Alerts
- Turn LED **on/off** from the app
- Color/blink patterns based on status:
  - 🟢 **Normal** - Everything OK
  - 🟡 **Warning** - Approaching threshold
  - 🔴 **Critical** - Threshold exceeded

### ⚙️ Operating Modes
- **Auto Mode** - Device decides based on sensor readings
- **Manual Mode** - User directly controls outputs

### 🎚️ Safety Thresholds
- Set temperature/humidity thresholds from the app
- When readings cross thresholds:
  - App shows warnings (animations, color changes)
  - Device triggers LEDs or alarms

### 📊 Data Streaming
- Start a "session" for constant data streaming
- Stop streaming to save power/bandwidth
- All readings stored for later analysis

### 🔮 Future Expansions
- Fan on/off control
- Pump on/off control
- "Experiment profiles" (e.g., maintain 25-27°C for 30 minutes)

---

## 🎯 Real-Life Use Cases

A **lab technician or engineer** wants to monitor and control a small lab setup (sensor box in a growth chamber or test rig) without being next to it:

1. **Open the SmartLab HMI Controller app** on Android
2. **Connect to device** via BLE (nearby) or Wi-Fi/WebSockets (remote)
3. **See live readings** - temperature, humidity in real-time
4. **Adjust modes and thresholds** - switch between Auto/Manual
5. **Get visual warnings** - if something goes out of range
6. **Review history** - all data saved to database

### Primary Uses:
| Use Case | Description |
|----------|-------------|
| **Monitoring** | Real-time view of lab device conditions from your phone |
| **Control** | Safely change device behavior (LEDs, modes, thresholds) |
| **HMI/UX** | Modern graphical interface replacing physical controls |
| **Data Logging** | All readings and commands saved for analysis |

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

| Screen | Description |
|--------|-------------|
| **Login** | Clean Apple-style authentication screen with gradient header |
| **Device List** | View all registered SmartLab devices with status indicators |
| **Dashboard** | Real-time 3D gauge with temperature/humidity readings |
| **Control Panel** | LED control, mode switching, threshold adjustment |
| **BLE Scan** | Discover nearby SmartLab devices via Bluetooth Low Energy |

---

## 🚀 Live Demo

### Try it with Expo Go! 📲

Scan the QR code below with the **Expo Go** app to access the repository:

<p align="center">
  <img src="https://raw.githubusercontent.com/Kiran-kata/smartlab-hmi/main/screenshots/expo_qr.png" width="200" alt="Expo QR Code"/>
</p>

> **Note:** Download [Expo Go](https://expo.dev/client) from Play Store/App Store first.

### Run Locally

```bash
# Clone the repository
git clone https://github.com/Kiran-kata/smartlab-hmi.git
cd smartlab-hmi

# Start the backend
cd backend
npm install
npm run dev

# Start the mobile app (in another terminal)
cd mobile
npm install
npx expo start
```

---

## ✨ Features

### 📱 Mobile App (React Native + TypeScript)
- **Apple HIG Design** - Clean, modern iOS-style interface
- **Real-time Dashboard** - 3D animated gauge visualization
- **BLE Connectivity** - Connect to nearby devices via Bluetooth
- **WebSocket Streaming** - Live sensor data updates
- **Offline Mock Mode** - Works in emulator with simulated data
- **Lottie Animations** - Smooth loading and success animations

### 🖥️ Backend (Node.js + TypeScript)
- **REST API** - Device registration, readings, commands
- **WebSocket Server** - Real-time pub/sub for live data
- **PostgreSQL** - Persistent storage (with in-memory fallback)
- **Health Monitoring** - `/health` endpoint for status checks

### 🔌 Device Protocol
- **BLE GATT** - Custom service/characteristics for commands
- **JSON Commands** - LED_ON, LED_OFF, MODE_AUTO, MODE_MANUAL, SET_THRESHOLD
- **Sensor Notifications** - Temperature, humidity, status updates

---

## 🏗️ Architecture

```
┌─────────────────┐     BLE      ┌─────────────────┐
│   SmartLab      │◄────────────►│   Mobile App    │
│   Device        │              │   (React Native)│
│   (ESP32)       │              │                 │
└────────┬────────┘              └────────┬────────┘
         │                                │
         │ Wi-Fi                          │ HTTP/WS
         │                                │
         ▼                                ▼
┌─────────────────────────────────────────────────┐
│              Backend Server                      │
│              (Node.js + Express)                 │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ REST API │  │WebSocket │  │  PostgreSQL  │  │
│  │ /devices │  │  Pub/Sub │  │   Database   │  │
│  │ /readings│  │          │  │              │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────┘
```

### Data Flow

1. **Device → Backend**: Sensor readings via Wi-Fi (MQTT/HTTP)
2. **Backend → App**: Real-time updates via WebSocket
3. **App → Device**: BLE commands for local control
4. **App → Backend**: REST API for device management

---

## 📂 Project Structure

```
smartlab-hmi/
├── 📁 backend/              # Node.js backend server
│   ├── src/
│   │   ├── routes/         # REST API endpoints
│   │   ├── repositories/   # Data access layer
│   │   ├── websocket/      # WebSocket handlers
│   │   └── server.ts       # Entry point
│   └── package.json
│
├── 📁 mobile/               # React Native app
│   ├── src/
│   │   ├── screens/        # UI screens
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API, BLE, WebSocket
│   │   ├── theme/          # Apple HIG design system
│   │   └── types/          # TypeScript definitions
│   ├── android/            # Android native code
│   │   └── app/src/main/java/.../SmartBle.kt
│   └── package.json
│
├── 📁 device/               # Firmware documentation
│   └── protocol.md         # BLE/MQTT protocol spec
│
├── 📁 screenshots/          # App screenshots
│
└── 📁 docs/                 # Documentation
    ├── requirements.md
    ├── architecture.md
    └── api.md
```

---

## 🛠️ Tech Stack - Detailed Breakdown

### 📱 Frontend (Mobile App)

| Technology | Version | Purpose | Why We Chose It |
|------------|---------|---------|-----------------|
| **React Native** | 0.73.x | Cross-platform mobile framework | Write once, deploy to Android & iOS. Large community, extensive libraries. |
| **TypeScript** | 5.x | Type-safe JavaScript | Catches errors at compile time, better IDE support, self-documenting code. |
| **React Navigation** | 6.x | Screen navigation & routing | Industry standard for React Native navigation. Supports stack, tab, drawer navigators. |
| **Expo** | SDK 54 | Development & deployment platform | Simplified build process, OTA updates, easy testing via Expo Go app. |
| **Lottie React Native** | 6.x | Vector animations | Smooth, scalable animations from After Effects. Used for loading spinners, success animations. |
| **Axios** | 1.x | HTTP client | Promise-based, interceptors for auth, automatic JSON parsing. |
| **React Native WebView** | 13.x | Embedded web content | Used for 3D gauge visualization with Three.js. |
| **Three.js** | (via WebView) | 3D graphics library | Creates the interactive 3D temperature gauge with smooth animations. |

#### Mobile Architecture Patterns:
- **Component-based UI**: Reusable components (GaugeView, StatusBadge, ControlButton)
- **Service Layer**: Abstracted API, BLE, and WebSocket services
- **Custom Hooks**: For state management and side effects
- **Theme System**: Centralized colors, typography, spacing following Apple HIG

### 🖥️ Backend (Server)

| Technology | Version | Purpose | Why We Chose It |
|------------|---------|---------|-----------------|
| **Node.js** | 18+ | JavaScript runtime | Non-blocking I/O, perfect for real-time applications. Same language as frontend. |
| **TypeScript** | 5.x | Type-safe JavaScript | Type safety across the entire stack. Shared types between frontend and backend. |
| **Express.js** | 4.x | Web framework | Minimal, flexible, huge ecosystem of middleware. Industry standard for Node.js APIs. |
| **ws** | 8.x | WebSocket library | Lightweight, high-performance WebSocket implementation for real-time data. |
| **PostgreSQL** | 15+ | Relational database | ACID compliance, JSON support, excellent for time-series sensor data. |
| **pg** | 8.x | PostgreSQL client | Native PostgreSQL bindings, connection pooling, prepared statements. |
| **dotenv** | 16.x | Environment variables | Secure configuration management, different settings per environment. |
| **uuid** | 9.x | Unique ID generation | RFC-compliant UUIDs for device and reading identification. |

#### Backend Architecture Patterns:
- **Repository Pattern**: Data access abstraction (deviceRepository, readingRepository)
- **Route Handlers**: RESTful endpoints with proper error handling
- **WebSocket Manager**: Pub/sub for real-time updates to connected clients
- **In-Memory Fallback**: Works without database for development/testing

### 📡 Communication Protocols

| Protocol | Use Case | Details |
|----------|----------|---------|
| **BLE GATT** | Local device control | Custom service UUID, characteristics for commands/notifications. Range: ~10m. |
| **HTTP/REST** | Device management | CRUD operations for devices, readings, commands. JSON payloads. |
| **WebSocket** | Real-time streaming | Bi-directional, persistent connection. Sub-100ms latency for live data. |
| **JSON** | Data format | Human-readable, easy to parse, supported everywhere. |

### 🔌 Device/Firmware (ESP32)

| Technology | Purpose | Details |
|------------|---------|---------|
| **ESP32** | Microcontroller | Dual-core, built-in Wi-Fi & Bluetooth, low power consumption. |
| **BLE Stack** | Local communication | GATT server with custom service for SmartLab protocol. |
| **Wi-Fi** | Remote communication | Connects to backend for cloud sync and remote control. |
| **DHT22/BME280** | Sensors | Temperature & humidity sensing with high accuracy. |
| **GPIO** | LED/Actuator control | Direct control of status LEDs, relays, and other outputs. |

### 🎨 Design System

| Aspect | Implementation | Details |
|--------|----------------|---------|
| **Colors** | Apple System Colors | Primary blue (#007AFF), success green (#34C759), error red (#FF3B30) |
| **Typography** | SF Pro-inspired | Large titles (34px), headlines (17px), body (15px), captions (12px) |
| **Spacing** | 8-point grid | Consistent spacing: 4, 8, 12, 16, 20, 24, 32px |
| **Shadows** | Subtle depth | Small (2px), medium (4px), large (8px) with low opacity |
| **Border Radius** | Rounded corners | Small (8px), medium (12px), large (16px), full (9999px) |

### 🔧 Development Tools

| Tool | Purpose |
|------|---------|
| **VS Code** | IDE with TypeScript, React Native, and ESLint support |
| **Android Studio** | Android SDK, emulator, and native debugging |
| **Metro Bundler** | React Native JavaScript bundler |
| **Gradle** | Android build system |
| **Git** | Version control |
| **npm** | Package management |

---

## 📦 Installation

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Android Studio** (for emulator) ([Download](https://developer.android.com/studio))
- **PostgreSQL** (optional, has in-memory fallback)

### Backend Setup

```bash
cd backend
npm install

# Create .env file (optional)
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_USER=smartlab
DB_PASS=smartlab
DB_NAME=smartlab
PORT=4000
EOF

# Start server (development)
npm run dev

# Or build and run (production)
npm run build
node dist/server.js
```

### Mobile Setup

```bash
cd mobile
npm install

# For Expo (recommended - easiest)
npx expo start

# For React Native CLI (requires Android SDK)
npx react-native run-android

# For production build
cd android && ./gradlew assembleRelease
```

---

## 🔌 API Reference

### REST Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/health` | Health check | - |
| GET | `/devices` | List all devices | - |
| POST | `/devices` | Register new device | `{ name, firmwareVersion }` |
| GET | `/devices/:id` | Get device details | - |
| GET | `/devices/:id/readings` | Get sensor readings | Query: `limit`, `offset` |
| GET | `/devices/:id/readings/latest` | Get latest reading | - |
| POST | `/devices/:id/commands` | Send command | `{ commandType, payload }` |
| GET | `/devices/:id/commands` | Get command history | Query: `limit`, `offset` |

### WebSocket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `subscribe` | Client → Server | `{ deviceId }` | Subscribe to device updates |
| `unsubscribe` | Client → Server | `{ deviceId }` | Unsubscribe from device |
| `reading` | Server → Client | `{ deviceId, temperature, humidity, timestamp }` | New sensor reading |
| `command` | Client → Server | `{ deviceId, type, payload }` | Send command to device |
| `status` | Server → Client | `{ deviceId, connected, mode }` | Device status change |

### BLE Commands

| Command | Payload | Description |
|---------|---------|-------------|
| `LED_ON` | - | Turn LED on |
| `LED_OFF` | - | Turn LED off |
| `MODE_AUTO` | - | Switch to automatic mode |
| `MODE_MANUAL` | - | Switch to manual mode |
| `SET_THRESHOLD` | `{ threshold: number }` | Set temperature threshold |

---

## 🧪 Testing

### Run on Emulator (Mock Mode)
The app automatically detects when running on an emulator and uses mock data:
- 3 simulated BLE devices
- Random temperature/humidity readings
- Simulated command responses

### Run on Physical Device
1. Enable USB debugging on your Android phone
2. Connect via USB
3. Run `npx react-native run-android`
4. The app will use real BLE to scan for SmartLab devices

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Kiran Kata**

- GitHub: [@Kiran-kata](https://github.com/Kiran-kata)

---

<p align="center">
  Made with ❤️ for smart lab automation
</p>
