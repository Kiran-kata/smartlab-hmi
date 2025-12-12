import { WsMessage, Reading, DeviceEvent } from '../types';

// Android emulator uses 10.0.2.2 to access host machine's localhost
const WS_URL = __DEV__ ? 'ws://10.0.2.2:4000' : 'wss://api.smartlab.example.com';

type ReadingCallback = (reading: Reading) => void;
type EventCallback = (event: DeviceEvent) => void;
type StatusCallback = (status: 'connected' | 'disconnected') => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private deviceId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimer: NodeJS.Timeout | null = null;

  private onReadingCallbacks: ReadingCallback[] = [];
  private onEventCallbacks: EventCallback[] = [];
  private onStatusCallbacks: StatusCallback[] = [];

  connect(deviceId: string): void {
    if (this.socket?.readyState === WebSocket.OPEN && this.deviceId === deviceId) {
      console.log('[WS] Already connected to device:', deviceId);
      return;
    }

    this.deviceId = deviceId;
    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      console.log('[WS] Connected to server');
      this.reconnectAttempts = 0;

      // Subscribe to device updates
      this.socket?.send(
        JSON.stringify({
          type: 'subscribe',
          deviceId: this.deviceId,
        })
      );
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WsMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('[WS] Failed to parse message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('[WS] Error:', error);
    };

    this.socket.onclose = () => {
      console.log('[WS] Disconnected');
      this.notifyStatus('disconnected');
      this.attemptReconnect();
    };
  }

  private handleMessage(message: WsMessage): void {
    switch (message.type) {
      case 'reading':
        this.onReadingCallbacks.forEach((cb) => cb(message.reading));
        break;
      case 'device_event':
        this.onEventCallbacks.forEach((cb) => cb(message.event));
        break;
      case 'connection_status':
        this.notifyStatus(message.status);
        break;
      default:
        console.log('[WS] Unknown message type:', message);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WS] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      if (this.deviceId) {
        this.connect(this.deviceId);
      }
    }, delay);
  }

  private notifyStatus(status: 'connected' | 'disconnected'): void {
    this.onStatusCallbacks.forEach((cb) => cb(status));
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.deviceId = null;
    this.reconnectAttempts = 0;
  }

  onReading(callback: ReadingCallback): () => void {
    this.onReadingCallbacks.push(callback);
    return () => {
      const index = this.onReadingCallbacks.indexOf(callback);
      if (index >= 0) {
        this.onReadingCallbacks.splice(index, 1);
      }
    };
  }

  onEvent(callback: EventCallback): () => void {
    this.onEventCallbacks.push(callback);
    return () => {
      const index = this.onEventCallbacks.indexOf(callback);
      if (index >= 0) {
        this.onEventCallbacks.splice(index, 1);
      }
    };
  }

  onConnectionStatus(callback: StatusCallback): () => void {
    this.onStatusCallbacks.push(callback);
    return () => {
      const index = this.onStatusCallbacks.indexOf(callback);
      if (index >= 0) {
        this.onStatusCallbacks.splice(index, 1);
      }
    };
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
export default wsService;
