import { Router, Request, Response } from 'express';
import { eventRepository, deviceRepository } from '../repositories';
import { wsManager } from '../websocket/wsManager';

const router = Router();

// POST /devices/:id/events - Post device event
router.post('/:id/events', async (req: Request, res: Response) => {
  try {
    const { id: deviceId } = req.params;
    const { eventType, payload } = req.body;

    // Validate device exists
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      return res.status(404).json({
        error: { code: 'DEVICE_NOT_FOUND', message: `Device with ID ${deviceId} not found` },
      });
    }

    // Validate event type
    const validEvents = [
      'MODE_CHANGED', 
      'BUTTON_PRESSED', 
      'LED_STATE_CHANGED', 
      'THRESHOLD_EXCEEDED',
      'DEVICE_CONNECTED',
      'DEVICE_DISCONNECTED'
    ];
    
    if (!eventType || !validEvents.includes(eventType)) {
      return res.status(400).json({
        error: { 
          code: 'INVALID_REQUEST', 
          message: `Invalid event type. Valid types: ${validEvents.join(', ')}` 
        },
      });
    }

    const event = await eventRepository.create(deviceId, { eventType, payload });

    // Update device last seen
    await deviceRepository.updateLastSeen(deviceId);

    // Broadcast to WebSocket subscribers
    wsManager.broadcastEvent(deviceId, {
      eventType: event.eventType,
      payload: event.payload,
      createdAt: event.createdAt.toISOString(),
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create event' } });
  }
});

// GET /devices/:id/events - Get event history
router.get('/:id/events', async (req: Request, res: Response) => {
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

    const result = await eventRepository.findByDeviceId(deviceId, {
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    res.json({
      ...result,
      limit: limit ? parseInt(limit as string, 10) : 100,
      offset: offset ? parseInt(offset as string, 10) : 0,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch events' } });
  }
});

export default router;
