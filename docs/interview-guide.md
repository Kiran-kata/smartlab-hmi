# SmartLab HMI Controller - Interview Reference Guide

This document maps the project implementation to the 12 technical interview questions.

---

## Q1: How do you integrate native Android modules into React Native?

### Implementation Files:
- `mobile/android/app/src/main/java/com/smartlabhmi/SmartBleModule.kt`
- `mobile/android/app/src/main/java/com/smartlabhmi/SmartBlePackage.kt`
- `mobile/android/app/src/main/java/com/smartlabhmi/MainApplication.kt`

### Key Concepts:
```kotlin
// 1. Create Native Module extending ReactContextBaseJavaModule
class SmartBleModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    override fun getName() = "SmartBleModule"
    
    @ReactMethod
    fun scanForDevices(promise: Promise) {
        // Native BLE scanning logic
    }
}

// 2. Create Package to register module
class SmartBlePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext) = 
        listOf(SmartBleModule(reactContext))
}

// 3. Register in MainApplication.kt
override val reactNativeHost = object : DefaultReactNativeHost(this) {
    override fun getPackages() = listOf(
        MainReactPackage(),
        SmartBlePackage()
    )
}
```

### JavaScript Bridge:
```typescript
// mobile/src/services/ble.ts
import { NativeModules, NativeEventEmitter } from 'react-native';
const { SmartBleModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(SmartBleModule);

// Use native methods
await SmartBleModule.scanForDevices();
await SmartBleModule.connectToDevice(deviceId);
```

---

## Q2: What's your approach to BLE communication in React Native?

### Implementation Files:
- `mobile/android/app/src/main/java/com/smartlabhmi/SmartBleModule.kt`
- `mobile/src/services/ble.ts`
- `device/protocol.md`

### Key Concepts:

1. **Permission Handling**: Request BLUETOOTH_SCAN, BLUETOOTH_CONNECT at runtime
2. **Scanning**: Use BluetoothLeScanner with ScanCallback
3. **Connection**: BluetoothGatt with connection state callbacks
4. **Characteristics**: Read/Write using GATT characteristics
5. **Error Recovery**: Automatic reconnection, timeout handling

```kotlin
// GATT Callback for reliable communication
override fun onCharacteristicChanged(gatt: BluetoothGatt, char: BluetoothGattCharacteristic) {
    val data = char.value
    // Parse and emit to JavaScript
    sendEvent("BleData", mapOf("value" to data.toHexString()))
}
```

---

## Q3: How do you manage real-time data updates across the app?

### Implementation Files:
- `backend/src/websocket/wsManager.ts`
- `mobile/src/services/ws.ts`
- `mobile/src/screens/DashboardScreen.tsx`

### Architecture:

```
Device → BLE → Native Module → React Native → WebSocket → Backend → PostgreSQL
                    ↓                              ↓
              Local State                    Broadcast to
              (useState)                   All Connected Clients
```

### Key Concepts:
1. **WebSocket Manager**: Pub/sub pattern with topic subscription
2. **React State**: useState + useEffect for reactive updates
3. **Event Emitter**: NativeEventEmitter for BLE → JS communication

```typescript
// WebSocket subscription
ws.subscribe('device:123:readings');
ws.on('message', (data) => {
    setReadings(prev => [...prev, data]);
});

// BLE event listener
eventEmitter.addListener('BleData', (event) => {
    updateLocalState(event.value);
});
```

---

## Q4: Describe your backend API design and database schema.

### Implementation Files:
- `backend/src/routes/*.ts`
- `backend/src/repositories/*.ts`
- `backend/src/db/schema.sql`

### Database Schema:
```sql
-- Core tables with relationships
devices (id, serial_number, name, type, status, firmware_version)
readings (id, device_id FK, reading_type, value, unit, created_at)
command_logs (id, device_id FK, command, status, sent_at, acked_at, error)
device_events (id, device_id FK, event_type, severity, message, created_at)
```

### REST API Design:
```
GET    /api/devices              - List all devices
POST   /api/devices              - Register device
GET    /api/devices/:id          - Get device details
GET    /api/devices/:id/readings - Get device readings
POST   /api/commands             - Send command
WebSocket /ws                    - Real-time updates
```

---

## Q5: How do you handle offline scenarios and data sync?

### Implementation:
- Local state caching in React Native
- Command queue for offline operations
- Reconnection logic in WebSocket service

```typescript
// WebSocket reconnection
class WebSocketService {
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    
    private handleClose = () => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => this.connect(), 
                Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
            );
        }
    };
}
```

---

## Q6: What animation libraries do you use and why?

### Implementation Files:
- `mobile/src/assets/animations/*.json`
- `mobile/src/components/CommandSuccessAnimation.tsx`
- `mobile/src/components/LoadingSpinner.tsx`

### Lottie Integration:
```typescript
import LottieView from 'lottie-react-native';

<LottieView
    source={require('../assets/animations/success.json')}
    autoPlay
    loop={false}
    style={{ width: 150, height: 150 }}
    onAnimationFinish={onComplete}
/>
```

### Why Lottie:
- Smooth 60fps animations
- Small file size (JSON)
- Designer-friendly (After Effects export)
- Cross-platform consistency

---

## Q7: How do you render complex visualizations like 3D gauges?

### Implementation Files:
- `mobile/src/assets/gauge.html`
- `mobile/src/components/Gauge3D.tsx`
- `mobile/src/components/GaugeView.tsx`

### Three.js WebView Approach:
```typescript
// Gauge3D.tsx - React Native wrapper
<WebView
    source={require('../assets/gauge.html')}
    onMessage={handleMessage}
/>

// Communication via postMessage
webViewRef.current?.postMessage(JSON.stringify({
    type: 'setValue',
    value: 75
}));
```

### Three.js Implementation:
- 3D extruded arc with gradient colors
- Animated needle with smooth transitions
- Real-time value updates via postMessage

---

## Q8: Explain your navigation architecture.

### Implementation Files:
- `mobile/src/navigation/AppNavigator.tsx`
- `mobile/src/screens/*.tsx`

### React Navigation Setup:
```typescript
const Stack = createNativeStackNavigator<RootStackParamList>();

// Type-safe navigation
type RootStackParamList = {
    Login: undefined;
    DeviceList: undefined;
    BLEConnect: undefined;
    Dashboard: { deviceId: string };
    Control: { deviceId: string };
};

// Deep linking ready
<NavigationContainer>
    <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
</NavigationContainer>
```

---

## Q9: How do you handle TypeScript in a React Native project?

### Implementation Files:
- `mobile/tsconfig.json`
- `mobile/src/types/index.ts`

### Key Practices:
```typescript
// Strict type definitions
interface Device {
    id: string;
    serialNumber: string;
    name: string;
    status: 'online' | 'offline' | 'error';
}

// Props typing
interface GaugeViewProps {
    value: number;
    min: number;
    max: number;
    label?: string;
}

// Navigation typing
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
```

---

## Q10: Describe your testing strategy.

### Recommended Approach:
```bash
# Unit tests with Jest
npm test

# Component tests with React Native Testing Library
npm run test:components

# E2E tests with Detox
npm run test:e2e
```

### Test Structure:
```typescript
// __tests__/services/ble.test.ts
describe('BLE Service', () => {
    it('should scan for devices', async () => {
        const devices = await bleService.scan();
        expect(devices).toBeInstanceOf(Array);
    });
});
```

---

## Q11: How do you secure API communications?

### Implementation:
```typescript
// JWT Authentication
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});

// Environment variables for secrets
// backend/.env
JWT_SECRET=your-secret-key
DATABASE_URL=postgres://...
```

### Security Measures:
- HTTPS for all API calls
- JWT token authentication
- Environment-based configuration
- Input validation on backend

---

## Q12: What's your deployment and CI/CD approach?

### Build Commands:
```bash
# Backend
cd backend && npm run build

# Android APK
cd mobile/android && ./gradlew assembleRelease

# Android Bundle (Play Store)
cd mobile/android && ./gradlew bundleRelease
```

### Recommended CI/CD:
```yaml
# GitHub Actions example
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm test
```

---

## Project Structure Summary

```
smartlab-hmi/
├── backend/                 # Node.js + Express + WebSocket + PostgreSQL
│   ├── src/
│   │   ├── db/             # Database schema and connection
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # REST API endpoints
│   │   ├── websocket/      # WebSocket manager
│   │   └── server.ts       # Main server entry
│   └── package.json
│
├── mobile/                  # React Native Android app
│   ├── android/            # Native Android code
│   │   └── app/src/main/java/com/smartlabhmi/
│   │       ├── SmartBleModule.kt    # Native BLE module
│   │       └── SmartBlePackage.kt   # React Native package
│   ├── src/
│   │   ├── assets/         # Lottie animations, 3D gauge HTML
│   │   ├── components/     # Reusable UI components
│   │   ├── navigation/     # React Navigation setup
│   │   ├── screens/        # App screens
│   │   ├── services/       # API, WebSocket, BLE services
│   │   └── types/          # TypeScript definitions
│   └── package.json
│
├── device/                  # Device protocol documentation
│   └── protocol.md
│
├── docs/                    # Project documentation
│   ├── requirements.md
│   ├── architecture.md
│   └── api.md
│
└── scripts/                 # Setup scripts
    ├── setup.ps1           # Windows PowerShell
    └── setup.sh            # Unix/Linux/macOS
```

---

## Quick Start

```bash
# 1. Install dependencies
npm run setup

# 2. Configure database
# Edit backend/.env with PostgreSQL credentials

# 3. Run migrations
npm run backend:migrate

# 4. Start backend
npm run backend:dev

# 5. Run mobile app
npm run mobile:android
```
