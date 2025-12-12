import { pool } from '../db';
import { CommandLog, CreateCommandDto, CommandStatus } from '../types';

// In-memory store for development when database is unavailable
let commandIdCounter = 1;
const memoryCommands: CommandLog[] = [];
let useMemoryStore = false;

export class CommandRepository {
  async create(deviceId: string, dto: CreateCommandDto): Promise<CommandLog> {
    if (useMemoryStore) {
      const command: CommandLog = {
        id: commandIdCounter++,
        deviceId,
        commandType: dto.commandType,
        payload: dto.payload || {},
        status: 'pending' as CommandStatus,
        createdAt: new Date(),
      };
      memoryCommands.unshift(command);
      return command;
    }
    
    try {
      const result = await pool.query(
        `INSERT INTO command_logs (device_id, command_type, payload)
         VALUES ($1, $2, $3)
         RETURNING id, device_id as "deviceId", command_type as "commandType", 
                   payload, status, created_at as "createdAt"`,
        [deviceId, dto.commandType, JSON.stringify(dto.payload || {})]
      );
      return result.rows[0];
    } catch (error) {
      console.warn('Database unavailable, using in-memory store');
      useMemoryStore = true;
      const command: CommandLog = {
        id: commandIdCounter++,
        deviceId,
        commandType: dto.commandType,
        payload: dto.payload || {},
        status: 'pending' as CommandStatus,
        createdAt: new Date(),
      };
      memoryCommands.unshift(command);
      return command;
    }
  }

  async findByDeviceId(
    deviceId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ commands: CommandLog[]; total: number }> {
    const { limit = 100, offset = 0 } = options;

    if (useMemoryStore) {
      const filtered = memoryCommands.filter(c => c.deviceId === deviceId);
      return {
        commands: filtered.slice(offset, offset + limit),
        total: filtered.length,
      };
    }
    
    try {
      const countResult = await pool.query(
        `SELECT COUNT(*) as total FROM command_logs WHERE device_id = $1`,
        [deviceId]
      );

      const result = await pool.query(
        `SELECT id, device_id as "deviceId", command_type as "commandType", 
                payload, status, created_at as "createdAt"
         FROM command_logs 
         WHERE device_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [deviceId, limit, offset]
      );

      return {
        commands: result.rows,
        total: parseInt(countResult.rows[0].total, 10),
      };
    } catch (error) {
      console.warn('Database unavailable, using in-memory store');
      useMemoryStore = true;
      const filtered = memoryCommands.filter(c => c.deviceId === deviceId);
      return {
        commands: filtered.slice(offset, offset + limit),
        total: filtered.length,
      };
    }
  }

  async updateStatus(id: number, status: string): Promise<void> {
    if (useMemoryStore) {
      const command = memoryCommands.find(c => c.id === id);
      if (command) {
        command.status = status as CommandStatus;
      }
      return;
    }
    
    try {
      await pool.query(
        `UPDATE command_logs SET status = $1 WHERE id = $2`,
        [status, id]
      );
    } catch (error) {
      console.warn('Database unavailable, using in-memory store');
      useMemoryStore = true;
      const command = memoryCommands.find(c => c.id === id);
      if (command) {
        command.status = status as CommandStatus;
      }
    }
  }
}

export const commandRepository = new CommandRepository();
