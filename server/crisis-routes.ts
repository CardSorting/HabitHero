import { Express, Request, Response, NextFunction } from 'express';
import { and, eq, gte, lte } from 'drizzle-orm';
import { db } from './db';
import { z } from 'zod';
import { format } from 'date-fns';
import { storage } from './storage';
import { crisisEvents, insertCrisisEventSchema } from '../shared/schema';
import { getCopingStrategy } from './anthropicService';

// Define a type for authenticated requests
type AuthRequest = Request & {
  user?: {
    id: number;
    username: string;
  }
}

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
}

// Define validation schemas using zod
const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

const periodSchema = z.enum(['day', 'week', 'month', 'year']);

// Register the crisis event routes
export function registerCrisisRoutes(app: Express) {
  // Get all crisis events for a user
  app.get('/api/crisis-events', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const events = await storage.getCrisisEvents(userId);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get crisis events for a user by date range
  app.get('/api/crisis-events/range', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      // Validate date format
      const result = dateRangeSchema.safeParse({ startDate, endDate });
      if (!result.success) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
      
      const events = await storage.getCrisisEventsByDateRange(userId, startDate, endDate);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get a specific crisis event by ID
  app.get('/api/crisis-events/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const event = await storage.getCrisisEventById(id);
      
      if (!event) {
        return res.status(404).json({ message: "Crisis event not found" });
      }
      
      // Make sure the user can only access their own events
      if (event.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a new crisis event
  app.post('/api/crisis-events', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Parse and validate the crisis event data
      const crisisEventData = { ...req.body, userId };
      const validationResult = insertCrisisEventSchema.safeParse(crisisEventData);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid crisis event data", 
          errors: validationResult.error.errors 
        });
      }
      
      const newEvent = await storage.createCrisisEvent(crisisEventData);
      res.status(201).json(newEvent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update a crisis event
  app.put('/api/crisis-events/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // Check if the event exists and belongs to the user
      const existingEvent = await storage.getCrisisEventById(id);
      
      if (!existingEvent) {
        return res.status(404).json({ message: "Crisis event not found" });
      }
      
      if (existingEvent.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Remove properties that should not be updated directly
      const { id: eventId, userId: eventUserId, createdAt, updatedAt, ...updateData } = req.body;
      
      const updatedEvent = await storage.updateCrisisEvent(id, updateData);
      res.json(updatedEvent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Delete a crisis event
  app.delete('/api/crisis-events/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // Check if the event exists and belongs to the user
      const existingEvent = await storage.getCrisisEventById(id);
      
      if (!existingEvent) {
        return res.status(404).json({ message: "Crisis event not found" });
      }
      
      if (existingEvent.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const deleted = await storage.deleteCrisisEvent(id);
      
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to delete crisis event" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get crisis analytics
  app.get('/api/crisis-events/analytics/summary', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { startDate, endDate } = req.query;
      
      // If date range is provided, validate it
      if (startDate && endDate) {
        if (typeof startDate !== 'string' || typeof endDate !== 'string') {
          return res.status(400).json({ message: "Invalid date format" });
        }
        
        const result = dateRangeSchema.safeParse({ startDate, endDate });
        if (!result.success) {
          return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
        }
        
        const analytics = await storage.getCrisisAnalytics(userId, startDate, endDate);
        return res.json(analytics);
      }
      
      // Otherwise, get all-time analytics
      const analytics = await storage.getCrisisAnalytics(userId);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get crisis time period summary
  app.get('/api/crisis-events/analytics/period/:period', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { period } = req.params;
      
      // Validate period
      const result = periodSchema.safeParse(period);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid period. Use 'day', 'week', 'month', or 'year'" });
      }
      
      const summary = await storage.getCrisisTimePeriodSummary(userId, period as 'day' | 'week' | 'month' | 'year');
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get coping strategies for a specific crisis type and intensity
  app.get('/api/crisis-events/coping-strategies', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { type, intensity } = req.query;
      
      if (!type || !intensity || typeof type !== 'string' || typeof intensity !== 'string') {
        return res.status(400).json({ message: "Crisis type and intensity are required" });
      }
      
      // Call the Anthropic API to get coping strategies
      const strategies = await getCopingStrategy(type, intensity);
      res.json({ strategies });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}