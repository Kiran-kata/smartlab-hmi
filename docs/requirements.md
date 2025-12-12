# SmartLab HMI Controller - Requirements

## Overview

The SmartLab HMI Controller is a mobile application designed to interface with laboratory IoT devices for monitoring and control purposes. The app provides real-time sensor data visualization, device control, and seamless synchronization between physical and digital interfaces.

## Functional Requirements

### 1. Device Discovery & Connection

- **FR-1.1**: App must discover SmartLab devices via Bluetooth Low Energy (BLE) scanning
- **FR-1.2**: App must display a list of discovered devices with name and signal strength
- **FR-1.3**: App must establish BLE connection to selected device
- **FR-1.4**: App must maintain connection state and handle disconnections gracefully
- **FR-1.5**: App must reconnect automatically when device comes back in range

### 2. Backend Communication

- **FR-2.1**: App must connect to backend via WebSocket over Wi-Fi for real-time data
- **FR-2.2**: App must subscribe to device-specific data channels
- **FR-2.3**: App must receive and process sensor readings in real-time
- **FR-2.4**: App must handle network disconnections and reconnect automatically
- **FR-2.5**: App must support REST API calls for non-real-time operations

### 3. Dashboard Display

- **FR-3.1**: Display current temperature reading with animated gauge
- **FR-3.2**: Display current humidity reading with animated gauge
- **FR-3.3**: Display current operation mode (Auto/Manual)
- **FR-3.4**: Display connection status (BLE, Wi-Fi, Backend)
- **FR-3.5**: Display LED state indicator
- **FR-3.6**: Update all readings in real-time (< 100ms latency)

### 4. Device Control

- **FR-4.1**: Toggle LED on/off via BLE command
- **FR-4.2**: Change operation mode (Auto/Manual) via BLE command
- **FR-4.3**: Adjust temperature threshold via BLE command
- **FR-4.4**: All commands must be logged to backend database
- **FR-4.5**: Visual feedback on command success/failure (Lottie animation)

### 5. Physical Control Synchronization

- **FR-5.1**: Physical button press on device must update app UI mode indicator
- **FR-5.2**: LED state changes on device must be reflected in app UI
- **FR-5.3**: Synchronization must occur within 500ms
- **FR-5.4**: App must handle conflicting states gracefully

### 6. Data Storage

- **FR-6.1**: All sensor readings must be stored in PostgreSQL database
- **FR-6.2**: All control commands must be logged with timestamp
- **FR-6.3**: Device information must be persisted
- **FR-6.4**: Data retention policy: minimum 30 days of readings

### 7. User Experience

- **FR-7.1**: Wireframed in Figma before implementation
- **FR-7.2**: Animated feedback using Lottie for user interactions
- **FR-7.3**: 3D gauge visualization for sensor data
- **FR-7.4**: Intuitive navigation between screens
- **FR-7.5**: Responsive UI for different Android screen sizes

## Non-Functional Requirements

### Performance

- **NFR-1.1**: App startup time < 3 seconds
- **NFR-1.2**: BLE scan results displayed within 2 seconds
- **NFR-1.3**: Sensor data update latency < 100ms
- **NFR-1.4**: UI animations at 60fps

### Reliability

- **NFR-2.1**: App must handle BLE disconnections gracefully
- **NFR-2.2**: App must queue commands during offline periods
- **NFR-2.3**: App must recover from crashes without data loss

### Security

- **NFR-3.1**: All WebSocket connections must use WSS in production
- **NFR-3.2**: API endpoints must be authenticated
- **NFR-3.3**: BLE pairing must be required for control commands

### Compatibility

- **NFR-4.1**: Android 8.0 (API 26) or higher
- **NFR-4.2**: BLE 4.0 or higher support

## Safety Requirements

- **SR-1**: Commands must be disabled when readings exceed safety thresholds
- **SR-2**: Visual warning must be displayed for abnormal readings
- **SR-3**: Emergency stop command must always be available
- **SR-4**: Physical device safety features must not be overridable from app

## Acceptance Criteria

1. User can scan and connect to a SmartLab device via BLE
2. User can view real-time sensor data on dashboard
3. User can control LED and mode via app
4. Physical button changes are reflected in app within 500ms
5. All readings are stored in database
6. Animations provide clear feedback for all interactions
7. App handles network disconnections gracefully
