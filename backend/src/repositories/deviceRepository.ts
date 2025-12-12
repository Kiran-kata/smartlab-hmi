import { pool } from '../db';
import { Device, CreateDeviceDto } from '../types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for development when database is unavailable
const memoryStore: Device[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'SmartLab-001',
    firmwareVersion: '1.0.0',
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'SmartLab-002',
    firmwareVersion: '1.0.1',
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let useMemoryStore = false;

export class DeviceRepository {
  async findAll(): Promise<Device[]> {
    if (useMemoryStore) {
      return memoryStore;
    }
    
    try {
      const result = await pool.query(
        `SELECT id, name, firmware_version as "firmwareVersion", 
                last_seen as "lastSeen", created_at as "createdAt", 
                updated_at as "updatedAt"
         FROM devices 
         ORDER BY created_at DESC`
      );
      return result.rows;
    } catch (error) {
      console.warn('Database unavailable, using in-memory store');
      useMemoryStore = true;
      return memoryStore;
    }
  }

  async findById(id: string): Promise<Device | null> {
    if (useMemoryStore) {
      return memoryStore.find(d => d.id === id) || null;
    }
    
    try {
      const result = await pool.query(
        `SELECT id, name, firmware_version as "firmwareVersion", 
                last_seen as "lastSeen", created_at as "createdAt", 
                updated_at as "updatedAt"
         FROM devices 
         WHERE id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database unavailable, using in-memory store');
      useMemoryStore = true;
      return memoryStore.find(d => d.id === id) || null;
    }
  }

  async create(dto: CreateDeviceDto): Promise<Device> {
    if (useMemoryStore) {
      const device: Device = {
        id: uuidv4(),
        name: dto.name,
        firmwareVersion: dto.firmwareVersion || '1.0.0',
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.push(device);
      return device;
    }
    
    try {
      const result = await pool.query(
        `INSERT INTO devices (name, firmware_version, last_seen)
         VALUES ($1, $2, NOW())
         RETURNING id, name, firmware_version as "firmwareVersion", 
                   last_seen as "lastSeen", created_at as "createdAt", 
                   updated_at as "updatedAt"`,
        [dto.name, dto.firmwareVersion || null]
      );
      return result.rows[0];
    } catch (error) {
      console.warn('Database unavailable, using in-memory store');
      useMemoryStore = true;
      const device: Device = {
        id: uuidv4(),
        name: dto.name,
        firmwareVersion: dto.firmwareVersion || '1.0.0',
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.push(device);
      return device;
    }
  }

  async updateLastSeen(id: string): Promise<void> {
    if (useMemoryStore) {
      const device = memoryStore.find(d => d.id === id);
      if (device) {
        device.lastSeen = new Date();
        device.updatedAt = new Date();
      }
      return;
    }
    
    try {
      await pool.query(
        `UPDATE devices SET last_seen = NOW(), updated_at = NOW() WHERE id = $1`,
        [id]
      );
    } catch (error) {
      console.warn('Database unavailable, using in-memory store');
      useMemoryStore = true;
      const device = memoryStore.find(d => d.id === id);
      if (device) {
        device.lastSeen = new Date();
        device.updatedAt = new Date();
      }
    }
  }

  async delete(id: string): Promise<boolean> {
    if (useMemoryStore) {
      const index = memoryStore.findIndex(d => d.id === id);
      if (index >= 0) {
        memoryStore.splice(index, 1);
        return true;
      }
      return false;
    }
    
    try {
      const result = await pool.query(
        `DELETE FROM devices WHERE id = $1`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.warn('Database unavailable, using in-memory store');
      useMemoryStore = true;
      const index = memoryStore.findIndex(d => d.id === id);
      if (index >= 0) {
        memoryStore.splice(index, 1);
        return true;
      }
      return false;
    }
  }
}

export const deviceRepository = new DeviceRepository();
