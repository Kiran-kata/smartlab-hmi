import axios, { AxiosInstance, AxiosError } from 'axios';
import { Device, Reading, Command } from '../types';
import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2, iOS simulator uses localhost
const getApiBase = () => {
  if (__DEV__) {
    return Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
  }
  return 'https://api.smartlab.example.com';
};

const API_BASE = getApiBase();

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('[API] Response error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Device endpoints
  async getDevices(): Promise<Device[]> {
    const response = await this.client.get('/devices');
    return response.data.devices;
  }

  async getDevice(deviceId: string): Promise<Device> {
    const response = await this.client.get(`/devices/${deviceId}`);
    return response.data;
  }

  async registerDevice(name: string, firmwareVersion?: string): Promise<Device> {
    const response = await this.client.post('/devices', {
      name,
      firmwareVersion,
    });
    return response.data;
  }

  // Reading endpoints
  async getReadings(
    deviceId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ readings: Reading[]; total: number }> {
    const response = await this.client.get(`/devices/${deviceId}/readings`, {
      params: options,
    });
    return response.data;
  }

  async getLatestReading(deviceId: string): Promise<Reading | null> {
    try {
      const response = await this.client.get(`/devices/${deviceId}/readings/latest`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Command endpoints
  async sendCommand(deviceId: string, command: Command): Promise<void> {
    await this.client.post(`/devices/${deviceId}/commands`, command);
  }

  async getCommandHistory(
    deviceId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ commands: Command[]; total: number }> {
    const response = await this.client.get(`/devices/${deviceId}/commands`, {
      params: options,
    });
    return response.data;
  }
}

export const api = new ApiService();
export default api;
