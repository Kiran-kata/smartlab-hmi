// Type definitions for SmartLab Mobile App

export interface Device {
  id: string;
  name: string;
  firmwareVersion: string | null;
  lastSeen: string | null;
  rssi?: number;
}

export interface Reading {
  deviceId: string;
  temperature: number;
  humidity: number;
  createdAt: string;
}

export interface DeviceEvent {
  deviceId: string;
  eventType: EventType;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface Command {
  commandType: CommandType;
  payload?: Record<string, unknown>;
}

export type CommandType =
  | 'LED_ON'
  | 'LED_OFF'
  | 'MODE_AUTO'
  | 'MODE_MANUAL'
  | 'SET_THRESHOLD'
  | 'EMERGENCY_STOP';

export type EventType =
  | 'MODE_CHANGED'
  | 'BUTTON_PRESSED'
  | 'LED_STATE_CHANGED'
  | 'THRESHOLD_EXCEEDED'
  | 'DEVICE_CONNECTED'
  | 'DEVICE_DISCONNECTED';

export type OperationMode = 'AUTO' | 'MANUAL';

export interface DeviceStatus {
  mode: OperationMode;
  ledState: boolean;
  threshold: number;
  isConnected: boolean;
}

export interface BleDevice {
  id: string;
  name: string;
  rssi: number;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  DeviceList: undefined;
  BLEConnect: undefined;
  Dashboard: { deviceId: string };
  Control: { deviceId: string };
};

// WebSocket message types
export interface WsReadingMessage {
  type: 'reading';
  reading: Reading;
}

export interface WsDeviceEventMessage {
  type: 'device_event';
  event: DeviceEvent;
}

export interface WsConnectionStatusMessage {
  type: 'connection_status';
  status: 'connected' | 'disconnected';
  deviceId: string;
}

export type WsMessage = WsReadingMessage | WsDeviceEventMessage | WsConnectionStatusMessage;
