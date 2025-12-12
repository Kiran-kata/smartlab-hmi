// Device types and interfaces

export interface Device {
  id: string;
  name: string;
  firmwareVersion: string | null;
  lastSeen: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reading {
  id: number;
  deviceId: string;
  temperature: number;
  humidity: number;
  createdAt: Date;
}

export interface CommandLog {
  id: number;
  deviceId: string;
  commandType: CommandType;
  payload: Record<string, unknown>;
  status: CommandStatus;
  createdAt: Date;
}

export interface DeviceEvent {
  id: number;
  deviceId: string;
  eventType: EventType;
  payload: Record<string, unknown>;
  createdAt: Date;
}

export type CommandType =
  | 'LED_ON'
  | 'LED_OFF'
  | 'MODE_AUTO'
  | 'MODE_MANUAL'
  | 'SET_THRESHOLD'
  | 'EMERGENCY_STOP';

export type CommandStatus = 'sent' | 'acknowledged' | 'failed';

export type EventType =
  | 'MODE_CHANGED'
  | 'BUTTON_PRESSED'
  | 'LED_STATE_CHANGED'
  | 'THRESHOLD_EXCEEDED'
  | 'DEVICE_CONNECTED'
  | 'DEVICE_DISCONNECTED';

export interface CreateDeviceDto {
  name: string;
  firmwareVersion?: string;
}

export interface CreateReadingDto {
  temperature: number;
  humidity: number;
}

export interface CreateCommandDto {
  commandType: CommandType;
  payload?: Record<string, unknown>;
}

export interface CreateEventDto {
  eventType: EventType;
  payload?: Record<string, unknown>;
}

// WebSocket message types
export interface WsSubscribeMessage {
  type: 'subscribe';
  deviceId: string;
}

export interface WsReadingMessage {
  type: 'reading';
  reading: {
    deviceId: string;
    temperature: number;
    humidity: number;
    createdAt: string;
  };
}

export interface WsDeviceEventMessage {
  type: 'device_event';
  event: {
    deviceId: string;
    eventType: EventType;
    payload: Record<string, unknown>;
    createdAt: string;
  };
}

export interface WsConnectionStatusMessage {
  type: 'connection_status';
  status: 'connected' | 'disconnected';
  deviceId: string;
}

export type WsOutgoingMessage =
  | WsReadingMessage
  | WsDeviceEventMessage
  | WsConnectionStatusMessage;

export type WsIncomingMessage = WsSubscribeMessage;
