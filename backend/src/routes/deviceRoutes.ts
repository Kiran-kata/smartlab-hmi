import { Router, Request, Response } from 'express';
import { deviceRepository } from '../repositories';

const router = Router();

// GET /devices - List all devices
router.get('/', async (_req: Request, res: Response) => {
  try {
    const devices = await deviceRepository.findAll();
    res.json({ devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch devices' } });
  }
});

// GET /devices/:id - Get device details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const device = await deviceRepository.findById(id);

    if (!device) {
      return res.status(404).json({
        error: { code: 'DEVICE_NOT_FOUND', message: `Device with ID ${id} not found` },
      });
    }

    res.json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch device' } });
  }
});

// POST /devices - Register new device
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, firmwareVersion } = req.body;

    if (!name) {
      return res.status(400).json({
        error: { code: 'INVALID_REQUEST', message: 'Device name is required' },
      });
    }

    const device = await deviceRepository.create({ name, firmwareVersion });
    res.status(201).json(device);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create device' } });
  }
});

export default router;
