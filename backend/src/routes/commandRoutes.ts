import { Router, Request, Response } from 'express';
import { commandRepository, deviceRepository } from '../repositories';

const router = Router();

// POST /devices/:id/commands - Log command
router.post('/:id/commands', async (req: Request, res: Response) => {
  try {
    const { id: deviceId } = req.params;
    const { commandType, payload } = req.body;

    // Validate device exists
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      return res.status(404).json({
        error: { code: 'DEVICE_NOT_FOUND', message: `Device with ID ${deviceId} not found` },
      });
    }

    // Validate command type
    const validCommands = ['LED_ON', 'LED_OFF', 'MODE_AUTO', 'MODE_MANUAL', 'SET_THRESHOLD', 'EMERGENCY_STOP'];
    if (!commandType || !validCommands.includes(commandType)) {
      return res.status(400).json({
        error: { 
          code: 'INVALID_REQUEST', 
          message: `Invalid command type. Valid types: ${validCommands.join(', ')}` 
        },
      });
    }

    const command = await commandRepository.create(deviceId, { commandType, payload });

    res.status(201).json(command);
  } catch (error) {
    console.error('Error creating command:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create command' } });
  }
});

// GET /devices/:id/commands - Get command history
router.get('/:id/commands', async (req: Request, res: Response) => {
  try {
    const { id: deviceId } = req.params;
    const { limit, offset } = req.query;

    // Validate device exists
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      return res.status(404).json({
        error: { code: 'DEVICE_NOT_FOUND', message: `Device with ID ${deviceId} not found` },
      });
    }

    const result = await commandRepository.findByDeviceId(deviceId, {
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    res.json({
      ...result,
      limit: limit ? parseInt(limit as string, 10) : 100,
      offset: offset ? parseInt(offset as string, 10) : 0,
    });
  } catch (error) {
    console.error('Error fetching commands:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch commands' } });
  }
});

export default router;
