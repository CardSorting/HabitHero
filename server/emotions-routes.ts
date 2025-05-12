import { Request, Response, NextFunction, Express } from 'express';
import { db } from './db';
import { 
  emotionTrackingEntries,
  InsertEmotionTrackingEntry,
  EmotionTrackingEntry
} from '@shared/schema';
import { eq, and, sql, desc, gte, lte } from 'drizzle-orm';
import { insertEmotionTrackingEntrySchema } from '@shared/schema';
import { format, subDays, addDays, parseISO } from 'date-fns';

// Type for authenticated requests
type AuthRequest = Request & {
  user?: {
    id: number;
    username: string;
  }
}

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
}

// Register emotions tracker routes
export function registerEmotionsRoutes(app: Express) {
  // Get predefined emotions
  app.get('/api/emotions/predefined', (req: Request, res: Response) => {
    // Predefined emotions are handled on the client side
    // But we could serve them from the server in the future
    res.status(200).json([]);
  });

  // Get a specific predefined emotion
  app.get('/api/emotions/predefined/:id', (req: Request, res: Response) => {
    // Predefined emotions are handled on the client side
    // But we could serve them from the server in the future
    res.status(404).json({ message: 'Emotion not found' });
  });

  // Get emotion entries for a date range
  app.get('/api/emotions/entries', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { dateFrom, dateTo } = req.query as { dateFrom: string, dateTo: string };
      const userId = req.user!.id;
      
      if (!dateFrom || !dateTo) {
        return res.status(400).json({ message: 'dateFrom and dateTo are required' });
      }
      
      const fromDate = parseISO(dateFrom);
      const toDate = parseISO(dateTo);
      
      // Format dates as strings for comparison
      const fromDateStr = format(fromDate, 'yyyy-MM-dd');
      const toDateStr = format(toDate, 'yyyy-MM-dd');
      
      const entries = await db
        .select()
        .from(emotionTrackingEntries)
        .where(
          and(
            eq(emotionTrackingEntries.userId, userId),
            sql`DATE(${emotionTrackingEntries.date}) >= ${fromDateStr}`,
            sql`DATE(${emotionTrackingEntries.date}) <= ${toDateStr}`
          )
        )
        .orderBy(desc(emotionTrackingEntries.date));
      
      res.status(200).json(entries);
    } catch (error) {
      console.error('Error fetching emotion entries:', error);
      res.status(500).json({ message: 'Error fetching emotion entries' });
    }
  });

  // Get a specific emotion entry
  app.get('/api/emotions/entries/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }
      
      const [entry] = await db
        .select()
        .from(emotionTrackingEntries)
        .where(
          and(
            eq(emotionTrackingEntries.id, id),
            eq(emotionTrackingEntries.userId, userId)
          )
        );
      
      if (!entry) {
        return res.status(404).json({ message: 'Emotion entry not found' });
      }
      
      res.status(200).json(entry);
    } catch (error) {
      console.error('Error fetching emotion entry:', error);
      res.status(500).json({ message: 'Error fetching emotion entry' });
    }
  });

  // Create a new emotion entry
  app.post('/api/emotions/entries', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Validate request body
      const validationResult = insertEmotionTrackingEntrySchema.safeParse({
        ...req.body,
        userId: userId, // Override userId with the authenticated user's ID
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid emotion entry data',
          errors: validationResult.error.errors 
        });
      }
      
      // Insert the new entry
      const [newEntry] = await db
        .insert(emotionTrackingEntries)
        .values({
          ...validationResult.data,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      res.status(201).json(newEntry);
    } catch (error) {
      console.error('Error creating emotion entry:', error);
      res.status(500).json({ message: 'Error creating emotion entry' });
    }
  });

  // Update an existing emotion entry
  app.put('/api/emotions/entries/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }
      
      // Check if the entry exists and belongs to the user
      const [existingEntry] = await db
        .select()
        .from(emotionTrackingEntries)
        .where(
          and(
            eq(emotionTrackingEntries.id, id),
            eq(emotionTrackingEntries.userId, userId)
          )
        );
      
      if (!existingEntry) {
        return res.status(404).json({ message: 'Emotion entry not found' });
      }
      
      // Update the entry
      const [updatedEntry] = await db
        .update(emotionTrackingEntries)
        .set({
          ...req.body,
          userId: userId, // Ensure userId is not changed
          id: id, // Ensure id is not changed
          updatedAt: new Date()
        })
        .where(eq(emotionTrackingEntries.id, id))
        .returning();
      
      res.status(200).json(updatedEntry);
    } catch (error) {
      console.error('Error updating emotion entry:', error);
      res.status(500).json({ message: 'Error updating emotion entry' });
    }
  });

  // Delete an emotion entry
  app.delete('/api/emotions/entries/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }
      
      // Check if the entry exists and belongs to the user
      const [existingEntry] = await db
        .select()
        .from(emotionTrackingEntries)
        .where(
          and(
            eq(emotionTrackingEntries.id, id),
            eq(emotionTrackingEntries.userId, userId)
          )
        );
      
      if (!existingEntry) {
        return res.status(404).json({ message: 'Emotion entry not found' });
      }
      
      // Delete the entry
      await db
        .delete(emotionTrackingEntries)
        .where(eq(emotionTrackingEntries.id, id));
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting emotion entry:', error);
      res.status(500).json({ message: 'Error deleting emotion entry' });
    }
  });

  // Analytics routes
  
  // Get emotion summary for a specific date
  app.get('/api/emotions/analytics/summary/:date', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const dateStr = req.params.date;
      const userId = req.user!.id;
      
      if (!dateStr) {
        return res.status(400).json({ message: 'Date is required' });
      }
      
      const date = parseISO(dateStr);
      
      // Get all emotions for the day
      const entries = await db
        .select()
        .from(emotionTrackingEntries)
        .where(
          and(
            eq(emotionTrackingEntries.userId, userId),
            sql`DATE(${emotionTrackingEntries.date}) = DATE(${date})`
          )
        );
      
      if (entries.length === 0) {
        return res.status(200).json({
          date: dateStr,
          averageIntensity: 0,
          dominantEmotion: '',
          emotionCounts: {},
          highestIntensity: {
            emotion: '',
            value: 0
          }
        });
      }
      
      // Calculate summary data
      const emotionCounts: Record<string, number> = {};
      let totalIntensity = 0;
      let highestIntensity = 0;
      let highestIntensityEmotion = '';
      
      entries.forEach(entry => {
        // Count occurrences of each emotion
        emotionCounts[entry.emotionName] = (emotionCounts[entry.emotionName] || 0) + 1;
        
        // Sum intensities for average
        totalIntensity += entry.intensity;
        
        // Track highest intensity
        if (entry.intensity > highestIntensity) {
          highestIntensity = entry.intensity;
          highestIntensityEmotion = entry.emotionName;
        }
      });
      
      // Find dominant emotion (most frequently tracked)
      let dominantEmotion = '';
      let maxCount = 0;
      
      Object.entries(emotionCounts).forEach(([emotion, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantEmotion = emotion;
        }
      });
      
      // Construct response
      const summary = {
        date: dateStr,
        averageIntensity: Math.round((totalIntensity / entries.length) * 10) / 10,
        dominantEmotion,
        emotionCounts,
        highestIntensity: {
          emotion: highestIntensityEmotion,
          value: highestIntensity
        }
      };
      
      res.status(200).json(summary);
    } catch (error) {
      console.error('Error calculating emotion summary:', error);
      res.status(500).json({ message: 'Error calculating emotion summary' });
    }
  });

  // Get emotion trends over a date range
  app.get('/api/emotions/analytics/trends', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { dateFrom, dateTo } = req.query as { dateFrom: string, dateTo: string };
      const userId = req.user!.id;
      
      if (!dateFrom || !dateTo) {
        return res.status(400).json({ message: 'dateFrom and dateTo are required' });
      }
      
      const fromDate = parseISO(dateFrom);
      const toDate = parseISO(dateTo);
      
      // Get all entries in the date range
      // Format dates as strings for comparison
      const fromDateStr = format(fromDate, 'yyyy-MM-dd');
      const toDateStr = format(toDate, 'yyyy-MM-dd');
      
      const entries = await db
        .select()
        .from(emotionTrackingEntries)
        .where(
          and(
            eq(emotionTrackingEntries.userId, userId),
            sql`DATE(${emotionTrackingEntries.date}) >= ${fromDateStr}`,
            sql`DATE(${emotionTrackingEntries.date}) <= ${toDateStr}`
          )
        )
        .orderBy(emotionTrackingEntries.date);
      
      if (entries.length === 0) {
        return res.status(200).json([]);
      }
      
      // Group entries by emotion
      const emotionMap: Record<string, {
        entries: EmotionTrackingEntry[],
        category: string
      }> = {};
      
      entries.forEach(entry => {
        if (!emotionMap[entry.emotionName]) {
          emotionMap[entry.emotionName] = {
            entries: [],
            category: entry.categoryId
          };
        }
        
        emotionMap[entry.emotionName].entries.push(entry);
      });
      
      // Calculate trends
      const trends = Object.entries(emotionMap).map(([emotion, data]) => {
        const { entries, category } = data;
        
        // Calculate data points
        const dataPoints = entries.map(entry => ({
          date: format(new Date(entry.date), 'yyyy-MM-dd'),
          intensity: entry.intensity
        }));
        
        // Calculate average intensity
        const totalIntensity = entries.reduce((sum, entry) => sum + entry.intensity, 0);
        const averageIntensity = Math.round((totalIntensity / entries.length) * 10) / 10;
        
        // Determine trend direction
        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        
        if (entries.length >= 3) {
          // Compare average of first third vs last third
          const third = Math.floor(entries.length / 3);
          
          const firstThird = entries.slice(0, third);
          const lastThird = entries.slice(entries.length - third);
          
          const firstAvg = firstThird.reduce((sum, e) => sum + e.intensity, 0) / firstThird.length;
          const lastAvg = lastThird.reduce((sum, e) => sum + e.intensity, 0) / lastThird.length;
          
          if (lastAvg - firstAvg > 0.5) {
            trend = 'increasing';
          } else if (firstAvg - lastAvg > 0.5) {
            trend = 'decreasing';
          }
        }
        
        return {
          emotion,
          category,
          dataPoints,
          averageIntensity,
          trend
        };
      });
      
      res.status(200).json(trends);
    } catch (error) {
      console.error('Error calculating emotion trends:', error);
      res.status(500).json({ message: 'Error calculating emotion trends' });
    }
  });

  // Get most frequently logged emotions
  app.get('/api/emotions/analytics/frequent', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { dateFrom, dateTo, limit } = req.query as { dateFrom: string, dateTo: string, limit: string };
      const userId = req.user!.id;
      
      if (!dateFrom || !dateTo) {
        return res.status(400).json({ message: 'dateFrom and dateTo are required' });
      }
      
      const fromDate = parseISO(dateFrom);
      const toDate = parseISO(dateTo);
      const limitNum = limit ? parseInt(limit) : 5;
      
      // Get all entries in the date range
      const entries = await db
        .select()
        .from(emotionTrackingEntries)
        .where(
          and(
            eq(emotionTrackingEntries.userId, userId),
            gte(emotionTrackingEntries.date, fromDate),
            lte(emotionTrackingEntries.date, toDate)
          )
        );
      
      if (entries.length === 0) {
        return res.status(200).json([]);
      }
      
      // Count emotions
      const emotionCounts: Record<string, number> = {};
      
      entries.forEach(entry => {
        emotionCounts[entry.emotionId] = (emotionCounts[entry.emotionId] || 0) + 1;
      });
      
      // Convert to array and sort
      const sortedEmotions = Object.entries(emotionCounts)
        .map(([emotionId, count]) => ({ emotionId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limitNum);
      
      res.status(200).json(sortedEmotions);
    } catch (error) {
      console.error('Error calculating frequent emotions:', error);
      res.status(500).json({ message: 'Error calculating frequent emotions' });
    }
  });

  // Get emotions with highest intensity
  app.get('/api/emotions/analytics/highest-intensity', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { dateFrom, dateTo, limit } = req.query as { dateFrom: string, dateTo: string, limit: string };
      const userId = req.user!.id;
      
      if (!dateFrom || !dateTo) {
        return res.status(400).json({ message: 'dateFrom and dateTo are required' });
      }
      
      const fromDate = parseISO(dateFrom);
      const toDate = parseISO(dateTo);
      const limitNum = limit ? parseInt(limit) : 5;
      
      // Get all entries in the date range
      const entries = await db
        .select()
        .from(emotionTrackingEntries)
        .where(
          and(
            eq(emotionTrackingEntries.userId, userId),
            gte(emotionTrackingEntries.date, fromDate),
            lte(emotionTrackingEntries.date, toDate)
          )
        );
      
      if (entries.length === 0) {
        return res.status(200).json([]);
      }
      
      // Find max intensity for each emotion
      const maxIntensities: Record<string, number> = {};
      
      entries.forEach(entry => {
        maxIntensities[entry.emotionId] = Math.max(
          maxIntensities[entry.emotionId] || 0,
          entry.intensity
        );
      });
      
      // Convert to array and sort
      const sortedIntensities = Object.entries(maxIntensities)
        .map(([emotionId, maxIntensity]) => ({ emotionId, maxIntensity }))
        .sort((a, b) => b.maxIntensity - a.maxIntensity)
        .slice(0, limitNum);
      
      res.status(200).json(sortedIntensities);
    } catch (error) {
      console.error('Error calculating highest intensity emotions:', error);
      res.status(500).json({ message: 'Error calculating highest intensity emotions' });
    }
  });
}