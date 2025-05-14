/**
 * Routes for Crisis Events API
 * Handles CRUD operations for crisis/panic events
 */

import { Express, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { insertCrisisEventSchema, crisisIntensityEnum, crisisTypeEnum } from '../shared/schema';

// Type definition for authenticated request
type AuthRequest = Request & {
  user?: {
    id: number;
    username: string;
  }
}

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
}

/**
 * Register crisis events routes with Express application
 */
export function registerCrisisRoutes(app: Express) {
  // Get all crisis events for authenticated user
  app.get('/api/crisis-events', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const events = await req.app.locals.storage.getCrisisEvents(userId);
      res.json(events);
    } catch (error) {
      console.error('Error fetching crisis events:', error);
      res.status(500).json({ message: 'Error fetching crisis events' });
    }
  });

  // Get crisis events in a date range
  app.get('/api/crisis-events/range', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Missing startDate or endDate' });
      }
      
      const events = await req.app.locals.storage.getCrisisEventsByDateRange(
        userId, 
        startDate as string, 
        endDate as string
      );
      res.json(events);
    } catch (error) {
      console.error('Error fetching crisis events by date range:', error);
      res.status(500).json({ message: 'Error fetching crisis events by date range' });
    }
  });

  // Get a specific crisis event
  app.get('/api/crisis-events/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const eventId = parseInt(req.params.id, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }
      
      const event = await req.app.locals.storage.getCrisisEventById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Crisis event not found' });
      }
      
      // Ensure the event belongs to the authenticated user
      if (event.userId !== req.user!.id) {
        return res.status(403).json({ message: 'Unauthorized access to this event' });
      }
      
      res.json(event);
    } catch (error) {
      console.error('Error fetching crisis event:', error);
      res.status(500).json({ message: 'Error fetching crisis event' });
    }
  });

  // Create a new crisis event
  app.post('/api/crisis-events', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Extend the schema to validate request body
      const createSchema = insertCrisisEventSchema.extend({
        symptoms: z.array(z.string()).optional(),
        triggers: z.array(z.string()).optional(),
        copingStrategiesUsed: z.array(z.string()).optional(),
      });
      
      // Validate request body
      const validatedData = createSchema.parse({
        ...req.body,
        userId,
      });
      
      // Handle JSON arrays
      const eventData = {
        ...validatedData,
        symptoms: validatedData.symptoms ? JSON.stringify(validatedData.symptoms) : null,
        triggers: validatedData.triggers ? JSON.stringify(validatedData.triggers) : null,
        copingStrategiesUsed: validatedData.copingStrategiesUsed ? JSON.stringify(validatedData.copingStrategiesUsed) : null,
      };
      
      const createdEvent = await req.app.locals.storage.createCrisisEvent(eventData);
      res.status(201).json(createdEvent);
    } catch (error) {
      console.error('Error creating crisis event:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating crisis event' });
    }
  });

  // Update an existing crisis event
  app.put('/api/crisis-events/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const eventId = parseInt(req.params.id, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }
      
      // Fetch the event to check ownership
      const existingEvent = await req.app.locals.storage.getCrisisEventById(eventId);
      if (!existingEvent) {
        return res.status(404).json({ message: 'Crisis event not found' });
      }
      
      // Ensure the event belongs to the authenticated user
      if (existingEvent.userId !== req.user!.id) {
        return res.status(403).json({ message: 'Unauthorized access to this event' });
      }
      
      // Extend the schema to validate request body (making all fields optional)
      const updateSchema = z.object({
        type: z.enum(crisisTypeEnum.enumValues).optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        intensity: z.enum(crisisIntensityEnum.enumValues).optional(),
        duration: z.number().optional(),
        notes: z.string().optional(),
        symptoms: z.array(z.string()).optional(),
        triggers: z.array(z.string()).optional(),
        copingStrategiesUsed: z.array(z.string()).optional(),
        copingStrategyEffectiveness: z.number().optional(),
        helpSought: z.boolean().optional(),
        medication: z.boolean().optional(),
      });
      
      // Validate request body
      const validatedData = updateSchema.parse(req.body);
      
      // Handle JSON arrays
      const updateData: any = { ...validatedData };
      if (validatedData.symptoms) {
        updateData.symptoms = JSON.stringify(validatedData.symptoms);
      }
      if (validatedData.triggers) {
        updateData.triggers = JSON.stringify(validatedData.triggers);
      }
      if (validatedData.copingStrategiesUsed) {
        updateData.copingStrategiesUsed = JSON.stringify(validatedData.copingStrategiesUsed);
      }
      
      const updatedEvent = await req.app.locals.storage.updateCrisisEvent(eventId, updateData);
      res.json(updatedEvent);
    } catch (error) {
      console.error('Error updating crisis event:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Error updating crisis event' });
    }
  });

  // Delete a crisis event
  app.delete('/api/crisis-events/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const eventId = parseInt(req.params.id, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }
      
      // Fetch the event to check ownership
      const existingEvent = await req.app.locals.storage.getCrisisEventById(eventId);
      if (!existingEvent) {
        return res.status(404).json({ message: 'Crisis event not found' });
      }
      
      // Ensure the event belongs to the authenticated user
      if (existingEvent.userId !== req.user!.id) {
        return res.status(403).json({ message: 'Unauthorized access to this event' });
      }
      
      await req.app.locals.storage.deleteCrisisEvent(eventId);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting crisis event:', error);
      res.status(500).json({ message: 'Error deleting crisis event' });
    }
  });

  // Get analytics summary for crisis events
  app.get('/api/crisis-events/analytics/summary', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;
      
      const analytics = await req.app.locals.storage.getCrisisAnalytics(
        userId,
        startDate as string | undefined,
        endDate as string | undefined
      );
      
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching crisis analytics:', error);
      res.status(500).json({ message: 'Error fetching crisis analytics' });
    }
  });

  // Get period-based summary (day/week/month/year)
  app.get('/api/crisis-events/analytics/period/:period', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const period = req.params.period as 'day' | 'week' | 'month' | 'year';
      
      if (!['day', 'week', 'month', 'year'].includes(period)) {
        return res.status(400).json({ message: 'Invalid period. Must be day, week, month, or year' });
      }
      
      const summary = await req.app.locals.storage.getCrisisTimePeriodSummary(userId, period);
      res.json(summary);
    } catch (error) {
      console.error('Error fetching crisis period summary:', error);
      res.status(500).json({ message: 'Error fetching crisis period summary' });
    }
  });

  // Get coping strategies suggestions
  app.get('/api/crisis-events/coping-strategies', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      // This endpoint could potentially integrate with Anthropic or another ML service
      // to provide personalized coping strategies based on user's crisis history
      const strategies = [
        { name: 'Deep Breathing', description: 'Focus on slow, deep breaths. Inhale for 4 counts, hold for 2, exhale for 6.' },
        { name: 'Grounding Exercise', description: 'Use the 5-4-3-2-1 technique: notice 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, 1 thing you taste.' },
        { name: 'Progressive Muscle Relaxation', description: 'Tense and then release each muscle group, starting from your toes and working up to your head.' },
        { name: 'TIPP Skills', description: 'Temperature change (cold water on face), Intense exercise, Paced breathing, Progressive muscle relaxation.' },
        { name: 'Opposite Action', description: 'Do the opposite of what your emotion urges you to do. If you want to isolate, reach out to someone instead.' },
      ];
      
      res.json(strategies);
    } catch (error) {
      console.error('Error fetching coping strategies:', error);
      res.status(500).json({ message: 'Error fetching coping strategies' });
    }
  });
}