import { pool } from '../db';
import { Reading, CreateReadingDto } from '../types';

// In-memory store for development when database is unavailable
let readingIdCounter = 1;
const memoryReadings: Reading[] = [
  {
    id: readingIdCounter++,
    deviceId: '550e8400-e29b-41d4-a716-446655440000',
    temperature: 25.5,
    humidity: 45.2,
    createdAt: new Date(),
  },
  {
    id: readingIdCounter++,
    deviceId: '550e8400-e29b-41d4-a716-446655440000',
    temperature: 26.1,
    humidity: 44.8,
    createdAt: new Date(Date.now() - 60000),
  },
];

let useMemoryStore = false;

export class ReadingRepository {
  async create(deviceId: string, dto: CreateReadingDto): Promise<Reading> {
    if (useMemoryStore) {
      const reading: Reading = {
        id: readingIdCounter++,
        deviceId,
        temperature: dto.temperature,
        humidity: dto.humidity,
        createdAt: new Date(),
      };
      memoryReadings.unshift(reading);
      return reading;
    }
    
    try {
      const result = await pool.query(
        `INSERT INTO readings (device_id, temperature, humidity)
         VALUES ($1, $2, $3)
         RETURNING id, device_id as "deviceId", temperature, humidity, 
                   created_at as "createdAt"`,
        [deviceId, dto.temperature, dto.humidity]
      );
      return result.rows[0];
    } catch (error) {
      console.warn('Database unavailable, using in-memory store');
      useMemoryStore = true;
      const reading: Reading = {
        id: readingIdCounter++,
        deviceId,
        temperature: dto.temperature,
        humidity: dto.humidity,
        createdAt: new Date(),
      };
      memoryReadings.unshift(reading);
      return reading;
    }
  }

  async findByDeviceId(
    deviceId: string,
    options: { limit?: number; offset?: number; from?: Date; to?: Date } = {}
  ): Promise<{ readings: Reading[]; total: number }> {
    const { limit = 100, offset = 0 } = options;

    if (useMemoryStore) {
      const filtered = memoryReadings.filter(r => r.deviceId === deviceId);
      return {
        readings: filtered.slice(offset, offset + limit),
        total: filtered.length,
      };
    }
    
    try {
      let whereClause = 'WHERE device_id = $1';
      const params: (string | number | Date)[] = [deviceId];
      let paramIndex = 2;

      if (options.from) {
        whereClause += ` AND created_at >= $${paramIndex}`;
        params.push(options.from);
        paramIndex++;
      }

      if (options.to) {
        whereClause += ` AND created_at <= $${paramIndex}`;
        params.push(options.to);
        paramIndex++;
      }

      const countResult = await pool.query(
        `SELECT COUNT(*) as total FROM readings ${whereClause}`,
        params
      );

      const result = await pool.query(
        `SELECT id, device_id as "deviceId", temperature, humidity, 
                created_at as "createdAt"
         FROM readings 
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      );

      return {
        readings: result.rows,
        total: parseInt(countResult.rows[0].total, 10),
      };
    } catch (error) {
      console.warn('Database unavailable, using in-memory store');
      useMemoryStore = true;
      const filtered = memoryReadings.filter(r => r.deviceId === deviceId);
      return {
        readings: filtered.slice(offset, offset + limit),
        total: filtered.length,
      };
    }
  }

  async getLatestByDeviceId(deviceId: string): Promise<Reading | null> {
    if (useMemoryStore) {
      return memoryReadings.find(r => r.deviceId === deviceId) || null;
    }
    
    try {
      const result = await pool.query(
        `SELECT id, device_id as "deviceId", temperature, humidity, 
                created_at as "createdAt"
         FROM readings 
         WHERE device_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [deviceId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database unavailable, using in-memory store');
      useMemoryStore = true;
      return memoryReadings.find(r => r.deviceId === deviceId) || null;
    }
  }

  async getAverageByDeviceId(
    deviceId: string,
    _duration: string = '1 hour'
  ): Promise<{ avgTemperature: number; avgHumidity: number } | null> {
    if (useMemoryStore) {
      const readings = memoryReadings.filter(r => r.deviceId === deviceId);
      if (readings.length === 0) return null;
      const avgTemp = readings.reduce((sum, r) => sum + r.temperature, 0) / readings.length;
      const avgHum = readings.reduce((sum, r) => sum + r.humidity, 0) / readings.length;
      return { avgTemperature: avgTemp, avgHumidity: avgHum };
    }
    
    try {
      const result = await pool.query(
        `SELECT AVG(temperature) as "avgTemperature", 
                AVG(humidity) as "avgHumidity"
         FROM readings 
         WHERE device_id = $1 
         AND created_at >= NOW() - INTERVAL '1 hour'`,
        [deviceId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database unavailable, using in-memory store');
      useMemoryStore = true;
      const readings = memoryReadings.filter(r => r.deviceId === deviceId);
      if (readings.length === 0) return null;
      const avgTemp = readings.reduce((sum, r) => sum + r.temperature, 0) / readings.length;
      const avgHum = readings.reduce((sum, r) => sum + r.humidity, 0) / readings.length;
      return { avgTemperature: avgTemp, avgHumidity: avgHum };
    }
  }
}

export const readingRepository = new ReadingRepository();
