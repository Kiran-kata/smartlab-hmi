import { pool } from '../db';
import { DeviceEvent, CreateEventDto } from '../types';

export class EventRepository {
  async create(deviceId: string, dto: CreateEventDto): Promise<DeviceEvent> {
    const result = await pool.query(
      `INSERT INTO device_events (device_id, event_type, payload)
       VALUES ($1, $2, $3)
       RETURNING id, device_id as "deviceId", event_type as "eventType", 
                 payload, created_at as "createdAt"`,
      [deviceId, dto.eventType, JSON.stringify(dto.payload || {})]
    );
    return result.rows[0];
  }

  async findByDeviceId(
    deviceId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ events: DeviceEvent[]; total: number }> {
    const { limit = 100, offset = 0 } = options;

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM device_events WHERE device_id = $1`,
      [deviceId]
    );

    const result = await pool.query(
      `SELECT id, device_id as "deviceId", event_type as "eventType", 
              payload, created_at as "createdAt"
       FROM device_events 
       WHERE device_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [deviceId, limit, offset]
    );

    return {
      events: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }
}

export const eventRepository = new EventRepository();
