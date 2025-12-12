import { Router, Request, Response } from 'express';
import { readingRepository, deviceRepository } from '../repositories';
import { wsManager } from '../websocket/wsManager';

const router = Router();

// POST /devices/:id/readings - Post sensor reading
router.post('/:id/readings', async (req: Request, res: Response) => {
  try {
    const { id: deviceId } = req.params;
    const { temperature, humidity } = req.body;

    // Validate device exists
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      return res.status(404).json({
        error: { code: 'DEVICE_NOT_FOUND', message: `Device with ID ${deviceId} not found` },
      });
    }

    // Validate reading data
    if (temperature === undefined || humidity === undefined) {
      return res.status(400).json({
        error: { code: 'INVALID_REQUEST', message: 'Temperature and humidity are required' },
      });
    }

    // Create reading
    const reading = await readingRepository.create(deviceId, { temperature, humidity });

    // Update device last seen
    await deviceRepository.updateLastSeen(deviceId);

    // Broadcast to WebSocket subscribers
    wsManager.broadcastReading(deviceId, {
      temperature: reading.temperature,
      humidity: reading.humidity,
      createdAt: reading.createdAt.toISOString(),
    });

    res.status(201).json(reading);
  } catch (error) {
    console.error('Error creating reading:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create reading' } });
  }
});

// GET /devices/:id/readings - Get reading history
router.get('/:id/readings', async (req: Request, res: Response) => {
  try {
    const { id: deviceId } = req.params;
    const { limit, offset, from, to } = req.query;

    // Validate device exists
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      return res.status(404).json({
        error: { code: 'DEVICE_NOT_FOUND', message: `Device with ID ${deviceId} not found` },
      });
    }

    const result = await readingRepository.findByDeviceId(deviceId, {
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
    });

    res.json({
      ...result,
      limit: limit ? parseInt(limit as string, 10) : 100,
      offset: offset ? parseInt(offset as string, 10) : 0,
    });
  } catch (error) {
    console.error('Error fetching readings:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch readings' } });
  }
});

// GET /devices/:id/readings/latest - Get latest reading
router.get('/:id/readings/latest', async (req: Request, res: Response) => {
  try {
    const { id: deviceId } = req.params;

    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      return res.status(404).json({
        error: { code: 'DEVICE_NOT_FOUND', message: `Device with ID ${deviceId} not found` },
      });
    }

    const reading = await readingRepository.getLatestByDeviceId(deviceId);

    if (!reading) {
      return res.status(404).json({
        error: { code: 'NO_READINGS', message: 'No readings found for this device' },
      });
    }

    res.json(reading);
  } catch (error) {
    console.error('Error fetching latest reading:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch latest reading' } });
  }
});

export default router;
