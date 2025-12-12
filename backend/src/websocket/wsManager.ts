import { WebSocket, WebSocketServer } from 'ws';
import { WsOutgoingMessage, WsIncomingMessage } from '../types';

interface Client {
  ws: WebSocket;
  deviceId: string | null;
  isAlive: boolean;
}

class WebSocketManager {
  private clients: Client[] = [];
  private wss: WebSocketServer | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  initialize(wss: WebSocketServer): void {
    this.wss = wss;

    wss.on('connection', (ws: WebSocket) => {
      const client: Client = { ws, deviceId: null, isAlive: true };
      this.clients.push(client);

      console.log(`Client connected. Total clients: ${this.clients.length}`);

      ws.on('pong', () => {
        client.isAlive = true;
      });

      ws.on('message', (data: Buffer) => {
        try {
          const message: WsIncomingMessage = JSON.parse(data.toString());
          this.handleMessage(client, message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        const index = this.clients.indexOf(client);
        if (index >= 0) {
          this.clients.splice(index, 1);
        }
        console.log(`Client disconnected. Total clients: ${this.clients.length}`);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    // Start heartbeat
    this.startHeartbeat();
  }

  private handleMessage(client: Client, message: WsIncomingMessage): void {
    switch (message.type) {
      case 'subscribe':
        if (message.deviceId) {
          client.deviceId = message.deviceId;
          console.log(`Client subscribed to device: ${message.deviceId}`);
          
          // Send connection confirmation
          this.sendToClient(client, {
            type: 'connection_status',
            status: 'connected',
            deviceId: message.deviceId,
          });
        }
        break;
      default:
        console.log('Unknown message type:', message);
    }
  }

  private startHeartbeat(): void {
    const interval = parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000', 10);
    
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client) => {
        if (!client.isAlive) {
          client.ws.terminate();
          return;
        }

        client.isAlive = false;
        client.ws.ping();
      });
    }, interval);
  }

  private sendToClient(client: Client, message: WsOutgoingMessage): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  broadcastToDevice(deviceId: string, message: WsOutgoingMessage): void {
    const subscribers = this.clients.filter((c) => c.deviceId === deviceId);
    
    subscribers.forEach((client) => {
      this.sendToClient(client, message);
    });

    console.log(`Broadcast to ${subscribers.length} clients for device ${deviceId}`);
  }

  broadcastReading(
    deviceId: string,
    reading: { temperature: number; humidity: number; createdAt: string }
  ): void {
    this.broadcastToDevice(deviceId, {
      type: 'reading',
      reading: {
        deviceId,
        ...reading,
      },
    });
  }

  broadcastEvent(
    deviceId: string,
    event: { eventType: string; payload: Record<string, unknown>; createdAt: string }
  ): void {
    this.broadcastToDevice(deviceId, {
      type: 'device_event',
      event: {
        deviceId,
        eventType: event.eventType as any,
        payload: event.payload,
        createdAt: event.createdAt,
      },
    });
  }

  getConnectedClientsCount(): number {
    return this.clients.length;
  }

  getSubscribersCount(deviceId: string): number {
    return this.clients.filter((c) => c.deviceId === deviceId).length;
  }

  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.clients.forEach((client) => {
      client.ws.close();
    });

    this.clients = [];
  }
}

export const wsManager = new WebSocketManager();
