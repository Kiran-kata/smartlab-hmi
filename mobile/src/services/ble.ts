import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid, Alert } from 'react-native';
import { BleDevice, CommandType } from '../types';

// Check if running on emulator
const isEmulator = (): boolean => {
  // Android emulator detection
  if (Platform.OS === 'android') {
    const { PlatformConstants } = NativeModules;
    return PlatformConstants?.Model?.includes('sdk') || 
           PlatformConstants?.Model?.includes('Emulator') ||
           PlatformConstants?.Model?.includes('Android SDK') ||
           __DEV__;
  }
  return __DEV__;
};

// Native module interface
interface SmartBleNativeModule {
  scanDevices(): void;
  stopScan(): void;
  connectToDevice(deviceId: string): Promise<boolean>;
  disconnectFromDevice(deviceId: string): Promise<void>;
  writeCommand(deviceId: string, command: string): Promise<void>;
  subscribeToNotifications(deviceId: string): Promise<void>;
  unsubscribeFromNotifications(deviceId: string): Promise<void>;
}

const { SmartBle } = NativeModules as { SmartBle: SmartBleNativeModule };

// Mock devices for emulator testing
const MOCK_DEVICES: BleDevice[] = [
  { id: 'AA:BB:CC:DD:EE:01', name: 'SmartLab-001', rssi: -45 },
  { id: 'AA:BB:CC:DD:EE:02', name: 'SmartLab-002', rssi: -62 },
  { id: 'AA:BB:CC:DD:EE:03', name: 'SmartLab-Sensor', rssi: -78 },
];

type DeviceCallback = (device: BleDevice) => void;
type ConnectionCallback = (connected: boolean, deviceId: string) => void;
type NotificationCallback = (data: { type: string; payload: Record<string, unknown> }) => void;

class BleService {
  private emitter: NativeEventEmitter | null = null;
  private deviceCallbacks: DeviceCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private notificationCallbacks: NotificationCallback[] = [];
  private connectedDeviceId: string | null = null;
  private mockDataInterval: ReturnType<typeof setInterval> | null = null;
  private useMockMode: boolean = false;

  constructor() {
    this.useMockMode = !SmartBle || isEmulator();
    
    if (SmartBle && !this.useMockMode) {
      this.emitter = new NativeEventEmitter(SmartBle as any);
      this.setupListeners();
    } else {
      console.log('[BLE] Running in mock mode (emulator/development)');
    }
  }

  private setupListeners(): void {
    if (!this.emitter) return;

    // Listen for scan results
    this.emitter.addListener('BleScanResult', (device: BleDevice) => {
      this.deviceCallbacks.forEach((cb) => cb(device));
    });

    // Listen for connection state changes
    this.emitter.addListener('BleConnectionState', (data: { deviceId: string; connected: boolean }) => {
      if (data.connected) {
        this.connectedDeviceId = data.deviceId;
      } else if (this.connectedDeviceId === data.deviceId) {
        this.connectedDeviceId = null;
      }
      this.connectionCallbacks.forEach((cb) => cb(data.connected, data.deviceId));
    });

    // Listen for notifications from device
    this.emitter.addListener('BleNotification', (data: { type: string; payload: Record<string, unknown> }) => {
      this.notificationCallbacks.forEach((cb) => cb(data));
    });
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);

      const allGranted = Object.values(granted).every(
        (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        Alert.alert(
          'Permissions Required',
          'Bluetooth and location permissions are required to scan for devices.',
          [{ text: 'OK' }]
        );
      }

      return allGranted;
    } catch (error) {
      console.error('[BLE] Permission request failed:', error);
      return false;
    }
  }

  async startScan(): Promise<void> {
    if (this.useMockMode) {
      console.log('[BLE] Starting mock scan...');
      // Simulate scanning with delayed device discoveries
      let index = 0;
      const scanInterval = setInterval(() => {
        if (index < MOCK_DEVICES.length) {
          const device = { 
            ...MOCK_DEVICES[index], 
            rssi: MOCK_DEVICES[index].rssi + Math.floor(Math.random() * 10 - 5) 
          };
          this.deviceCallbacks.forEach((cb) => cb(device));
          index++;
        } else {
          clearInterval(scanInterval);
        }
      }, 600);
      return;
    }

    const hasPermissions = await this.requestPermissions();
    if (!hasPermissions) {
      throw new Error('Bluetooth permissions not granted');
    }

    SmartBle.scanDevices();
  }

  stopScan(): void {
    if (SmartBle) {
      SmartBle.stopScan();
    }
  }

  async connect(deviceId: string): Promise<boolean> {
    if (this.useMockMode) {
      console.log('[BLE] Mock connecting to device:', deviceId);
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.connectedDeviceId = deviceId;
      this.connectionCallbacks.forEach((cb) => cb(true, deviceId));
      
      // Start sending mock sensor data every 2 seconds
      this.startMockDataStream();
      
      return true;
    }

    try {
      const connected = await SmartBle.connectToDevice(deviceId);
      if (connected) {
        await SmartBle.subscribeToNotifications(deviceId);
      }
      return connected;
    } catch (error) {
      console.error('[BLE] Connection failed:', error);
      return false;
    }
  }
  
  private startMockDataStream(): void {
    if (this.mockDataInterval) {
      clearInterval(this.mockDataInterval);
    }
    
    // Send mock sensor readings every 2 seconds
    this.mockDataInterval = setInterval(() => {
      if (this.connectedDeviceId) {
        const mockData = {
          type: 'sensor_reading',
          payload: {
            temperature: 22 + Math.random() * 8, // 22-30°C
            humidity: 40 + Math.random() * 20,   // 40-60%
            ledState: Math.random() > 0.5,
            mode: Math.random() > 0.5 ? 'AUTO' : 'MANUAL',
            timestamp: new Date().toISOString(),
          },
        };
        this.notificationCallbacks.forEach((cb) => cb(mockData));
      }
    }, 2000);
  }
  
  private stopMockDataStream(): void {
    if (this.mockDataInterval) {
      clearInterval(this.mockDataInterval);
      this.mockDataInterval = null;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connectedDeviceId) return;

    // Stop mock data stream if running
    this.stopMockDataStream();

    if (SmartBle && !this.useMockMode) {
      try {
        await SmartBle.unsubscribeFromNotifications(this.connectedDeviceId);
        await SmartBle.disconnectFromDevice(this.connectedDeviceId);
      } catch (error) {
        console.error('[BLE] Disconnect failed:', error);
      }
    }

    const deviceId = this.connectedDeviceId;
    this.connectedDeviceId = null;
    this.connectionCallbacks.forEach((cb) => cb(false, deviceId));
  }

  async sendCommand(command: CommandType, payload?: Record<string, unknown>): Promise<void> {
    if (!this.connectedDeviceId) {
      throw new Error('No device connected');
    }

    const commandData = JSON.stringify({ command, payload });

    if (this.useMockMode) {
      console.log('[BLE] Mock sending command:', commandData);
      // Simulate command response
      setTimeout(() => {
        if (command === 'LED_ON' || command === 'LED_OFF') {
          this.notificationCallbacks.forEach((cb) =>
            cb({ type: 'LED_STATE_CHANGED', payload: { state: command === 'LED_ON' } })
          );
        } else if (command === 'MODE_AUTO' || command === 'MODE_MANUAL') {
          this.notificationCallbacks.forEach((cb) =>
            cb({ type: 'MODE_CHANGED', payload: { mode: command === 'MODE_AUTO' ? 'AUTO' : 'MANUAL' } })
          );
        } else if (command === 'SET_THRESHOLD') {
          this.notificationCallbacks.forEach((cb) =>
            cb({ type: 'THRESHOLD_CHANGED', payload: { threshold: payload?.threshold } })
          );
        }
      }, 100);
      return;
    }

    await SmartBle.writeCommand(this.connectedDeviceId, commandData);
  }

  onDeviceDiscovered(callback: DeviceCallback): () => void {
    this.deviceCallbacks.push(callback);
    return () => {
      const index = this.deviceCallbacks.indexOf(callback);
      if (index >= 0) {
        this.deviceCallbacks.splice(index, 1);
      }
    };
  }

  onConnectionStateChanged(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index >= 0) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  onNotification(callback: NotificationCallback): () => void {
    this.notificationCallbacks.push(callback);
    return () => {
      const index = this.notificationCallbacks.indexOf(callback);
      if (index >= 0) {
        this.notificationCallbacks.splice(index, 1);
      }
    };
  }

  isConnected(): boolean {
    return this.connectedDeviceId !== null;
  }

  getConnectedDeviceId(): string | null {
    return this.connectedDeviceId;
  }
}

export const bleService = new BleService();
export default bleService;
