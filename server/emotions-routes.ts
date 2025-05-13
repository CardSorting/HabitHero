import { Express, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { z } from 'zod';
import { getCopingStrategy } from './anthropicService';
import * as schema from '../shared/schema';

// Define a type for authenticated requests
type AuthRequest = Request & {
  user?: {
    id: number;
    username: string;
  }
}

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'You must be logged in to access this resource' });
}

// Emotion tracking routes
export function registerEmotionsRoutes(app: Express) {
  // Get all predefined emotions
  app.get('/api/emotions/predefined', (req: Request, res: Response) => {
    try {
      // In a real application, we'd fetch this from the database
      // Using predefined emotions stored on the client for now
      res.json({ message: 'Use client-side predefined emotions' });
    } catch (error) {
      console.error('Error fetching emotions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get a specific predefined emotion
  app.get('/api/emotions/predefined/:id', (req: Request, res: Response) => {
    try {
      // In a real application, we'd fetch this from the database
      res.json({ message: 'Use client-side predefined emotions' });
    } catch (error) {
      console.error(`Error fetching emotion with ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all emotion entries for current user
  app.get('/api/emotions/entries', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get entries from the database
      const entries = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq }) => eq(entries.userId, req.user!.id)
      });

      res.json(entries);
    } catch (error) {
      console.error('Error fetching emotion entries:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get a specific emotion entry
  app.get('/api/emotions/entries/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const entryId = req.params.id;
      
      // Get entry from the database
      const entry = await db.query.emotionTrackingEntries.findFirst({
        where: (entries, { eq, and }) => 
          and(
            eq(entries.id, entryId),
            eq(entries.userId, req.user!.id)
          )
      });

      if (!entry) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      res.json(entry);
    } catch (error) {
      console.error(`Error fetching emotion entry with ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get entries for a specific date
  app.get('/api/emotions/entries/date/:date', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const date = req.params.date;
      
      // Get entries from the database
      const entries = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and }) => 
          and(
            eq(entries.date, date),
            eq(entries.userId, req.user!.id)
          )
      });

      res.json(entries);
    } catch (error) {
      console.error(`Error fetching emotion entries for date ${req.params.date}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get entries for a date range
  app.get('/api/emotions/entries/range', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const fromDate = req.query.from as string;
      const toDate = req.query.to as string;
      
      if (!fromDate || !toDate) {
        return res.status(400).json({ error: 'Missing from or to date parameters' });
      }
      
      // Get entries from the database
      const entries = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and, gte, lte }) => 
          and(
            gte(entries.date, fromDate),
            lte(entries.date, toDate),
            eq(entries.userId, req.user!.id)
          )
      });

      res.json(entries);
    } catch (error) {
      console.error(`Error fetching emotion entries for date range:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create a new emotion entry
  app.post('/api/emotions/entries', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate request body
      const entrySchema = z.object({
        emotionId: z.string(),
        emotionName: z.string(),
        intensity: z.number().min(1).max(10),
        date: z.string(),
        notes: z.string().optional(),
        triggers: z.array(z.string()).optional(),
        copingMechanisms: z.array(z.string()).optional(),
        categoryId: z.string()
      });
      
      const validatedData = entrySchema.parse(req.body);
      
      // Generate coping strategy if intensity is high (7-10)
      let copingStrategies = validatedData.copingMechanisms || [];
      if (validatedData.intensity >= 7 && (!copingStrategies || copingStrategies.length === 0)) {
        try {
          const intensityString = validatedData.intensity <= 7 ? 'moderate' : 
                                 validatedData.intensity <= 9 ? 'high' : 'extreme';
          const strategy = await getCopingStrategy(validatedData.emotionName, intensityString);
          if (strategy) {
            copingStrategies = [strategy];
          }
        } catch (e) {
          console.error('Failed to generate coping strategy:', e);
        }
      }
      
      // Create entry in the database
      const newEntry = await db.insert(schema.emotionTrackingEntries).values({
        userId: req.user.id,
        emotionId: validatedData.emotionId,
        emotionName: validatedData.emotionName,
        intensity: validatedData.intensity,
        date: validatedData.date,
        notes: validatedData.notes,
        triggers: validatedData.triggers || [],
        copingMechanisms: copingStrategies,
        categoryId: validatedData.categoryId
      }).returning();

      res.status(201).json(newEntry[0]);
    } catch (error) {
      console.error('Error creating emotion entry:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Update an emotion entry
  app.put('/api/emotions/entries/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const entryId = req.params.id;
      
      // Check if entry exists and belongs to user
      const existingEntry = await db.query.emotionTrackingEntries.findFirst({
        where: (entries, { eq, and }) => 
          and(
            eq(entries.id, entryId),
            eq(entries.userId, req.user!.id)
          )
      });

      if (!existingEntry) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      // Validate request body
      const updateSchema = z.object({
        intensity: z.number().min(1).max(10).optional(),
        notes: z.string().optional(),
        triggers: z.array(z.string()).optional(),
        copingMechanisms: z.array(z.string()).optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Update entry in the database
      const updatedEntry = await db.update(schema.emotionTrackingEntries)
        .set({
          ...validatedData,
          // Ensure arrays are handled properly
          triggers: validatedData.triggers !== undefined 
            ? validatedData.triggers 
            : existingEntry.triggers,
          copingMechanisms: validatedData.copingMechanisms !== undefined 
            ? validatedData.copingMechanisms 
            : existingEntry.copingMechanisms
        })
        .where(eb => eb.and(
          eb.eq(db.schema.emotionTrackingEntries.id, entryId),
          eb.eq(db.schema.emotionTrackingEntries.userId, req.user!.id)
        ))
        .returning();

      if (!updatedEntry.length) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      res.json(updatedEntry[0]);
    } catch (error) {
      console.error(`Error updating emotion entry:`, error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Delete an emotion entry
  app.delete('/api/emotions/entries/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const entryId = req.params.id;
      
      // Delete entry from the database
      const result = await db.delete(db.schema.emotionTrackingEntries)
        .where(eb => eb.and(
          eb.eq(db.schema.emotionTrackingEntries.id, entryId),
          eb.eq(db.schema.emotionTrackingEntries.userId, req.user!.id)
        ))
        .returning();

      if (!result.length) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting emotion entry:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Analytics routes
  
  // Get emotion summary for a specific date
  app.get('/api/emotions/analytics/summary/:date', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const date = req.params.date;
      
      // Try to get entries for the requested date
      let entries = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and }) => 
          and(
            eq(entries.date, date),
            eq(entries.userId, req.user!.id)
          )
      });
      
      // If no entries for requested date, try previous day
      if (entries.length === 0) {
        const currentDate = new Date(date);
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateStr = prevDate.toISOString().split('T')[0];
        
        entries = await db.query.emotionTrackingEntries.findMany({
          where: (entries, { eq, and }) => 
            and(
              eq(entries.date, prevDateStr),
              eq(entries.userId, req.user!.id)
            )
        });
      }
      
      // If still no entries, return empty summary
      if (entries.length === 0) {
        return res.json({
          date,
          dominantEmotion: null,
          highestIntensity: null,
          averageIntensity: null,
          emotionCount: 0,
          entryIds: []
        });
      }
      
      // Process the entries to build the summary
      const emotionCounts: Record<string, number> = {};
      let totalIntensity = 0;
      let highestIntensityValue = 0;
      let highestIntensityEmotion = '';
      
      // Process each entry
      for (const entry of entries) {
        // Count emotions
        emotionCounts[entry.emotionName] = (emotionCounts[entry.emotionName] || 0) + 1;
        
        // Track intensity
        totalIntensity += entry.intensity;
        
        // Track highest intensity
        if (entry.intensity > highestIntensityValue) {
          highestIntensityValue = entry.intensity;
          highestIntensityEmotion = entry.emotionName;
        }
      }
      
      // Calculate averages and find dominant emotion
      const averageIntensity = totalIntensity / entries.length;
      
      // Find most frequent emotion
      let dominantEmotion = null;
      let maxCount = 0;
      for (const [emotion, count] of Object.entries(emotionCounts)) {
        if (count > maxCount) {
          maxCount = count;
          dominantEmotion = emotion;
        }
      }
      
      // Prepare the summary object
      const summary = {
        date,
        dominantEmotion,
        highestIntensity: highestIntensityValue || null,
        averageIntensity: entries.length > 0 ? averageIntensity : null,
        emotionCount: entries.length,
        entryIds: entries.map(entry => entry.id)
      };
      
      res.json(summary);
    } catch (error) {
      console.error(`Error generating emotion summary:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get emotion trends for a date range
  app.get('/api/emotions/analytics/trends', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const fromDate = req.query.from as string;
      const toDate = req.query.to as string;
      
      if (!fromDate || !toDate) {
        return res.status(400).json({ error: 'Missing from or to date parameters' });
      }
      
      // Get entries from the database
      const entries = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and, gte, lte }) => 
          and(
            gte(entries.date, fromDate),
            lte(entries.date, toDate),
            eq(entries.userId, req.user!.id)
          )
      });

      // Group entries by date
      const entriesByDate: Record<string, any[]> = {};
      
      for (const entry of entries) {
        if (!entriesByDate[entry.date]) {
          entriesByDate[entry.date] = [];
        }
        entriesByDate[entry.date].push(entry);
      }

      // Calculate daily trends
      const trends = Object.entries(entriesByDate).map(([date, dayEntries]) => {
        // Calculate average intensity for the day
        const totalIntensity = dayEntries.reduce((sum, entry) => sum + entry.intensity, 0);
        const averageIntensity = totalIntensity / dayEntries.length;
        
        // Count emotions by category
        const categoryCount = { positive: 0, negative: 0, neutral: 0 };
        for (const entry of dayEntries) {
          if (entry.categoryId === 'positive') categoryCount.positive++;
          else if (entry.categoryId === 'negative') categoryCount.negative++;
          else if (entry.categoryId === 'neutral') categoryCount.neutral++;
        }
        
        // Determine dominant category and overall mood
        let dominantCategory = 'neutral';
        let overallMood = 'neutral';
        
        if (categoryCount.positive > categoryCount.negative && 
            categoryCount.positive > categoryCount.neutral) {
          dominantCategory = 'positive';
          overallMood = 'positive';
        } else if (categoryCount.negative > categoryCount.positive && 
                  categoryCount.negative > categoryCount.neutral) {
          dominantCategory = 'negative';
          overallMood = 'negative';
        } else if (categoryCount.positive === categoryCount.negative && 
                  categoryCount.positive > 0) {
          // If there's an equal mix of positive and negative emotions
          overallMood = 'mixed';
        }
        
        // Find the dominant emotion (most frequent)
        const emotionCounts: {[emotion: string]: number} = {};
        for (const entry of dayEntries) {
          emotionCounts[entry.emotionName] = (emotionCounts[entry.emotionName] || 0) + 1;
        }
        
        let dominantEmotion = null;
        let maxCount = 0;
        for (const [emotion, count] of Object.entries(emotionCounts)) {
          if (count > maxCount) {
            maxCount = count;
            dominantEmotion = emotion;
          }
        }
        
        // Format emotions data
        const formattedEmotions: {[name: string]: {count: number, averageIntensity: number}} = {};
        
        for (const entry of dayEntries) {
          if (!formattedEmotions[entry.emotionName]) {
            formattedEmotions[entry.emotionName] = { count: 0, averageIntensity: 0 };
          }
          formattedEmotions[entry.emotionName].count += 1;
          formattedEmotions[entry.emotionName].averageIntensity += entry.intensity;
        }
        
        // Calculate average intensity for each emotion
        for (const emotion of Object.keys(formattedEmotions)) {
          formattedEmotions[emotion].averageIntensity /= formattedEmotions[emotion].count;
        }

        return {
          date,
          emotions: formattedEmotions,
          overallMood,
          dominantEmotion
        };
      });

      // Sort by date
      trends.sort((a, b) => a.date.localeCompare(b.date));

      res.json(trends);
    } catch (error) {
      console.error(`Error generating emotion trends:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get most frequent emotions
  app.get('/api/emotions/analytics/frequent', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const fromDate = req.query.from as string;
      const toDate = req.query.to as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      if (!fromDate || !toDate) {
        return res.status(400).json({ error: 'Missing from or to date parameters' });
      }
      
      // Get entries from the database
      const entries = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and, gte, lte }) => 
          and(
            gte(entries.date, fromDate),
            lte(entries.date, toDate),
            eq(entries.userId, req.user!.id)
          )
      });

      // Count occurrences of each emotion
      const emotionCounts: Record<string, number> = {};
      
      for (const entry of entries) {
        emotionCounts[entry.emotionName] = (emotionCounts[entry.emotionName] || 0) + 1;
      }

      // Convert to array for sorting
      const emotionCountArray = Object.entries(emotionCounts).map(([emotion, count]) => ({
        emotion,
        count
      }));

      // Sort by count (descending) and limit results
      emotionCountArray.sort((a, b) => b.count - a.count);
      const limitedResults = emotionCountArray.slice(0, limit);

      res.json(limitedResults);
    } catch (error) {
      console.error(`Error fetching most frequent emotions:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get highest intensity emotions
  app.get('/api/emotions/analytics/highest-intensity', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const fromDate = req.query.from as string;
      const toDate = req.query.to as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      if (!fromDate || !toDate) {
        return res.status(400).json({ error: 'Missing from or to date parameters' });
      }
      
      // Get entries from the database
      const entries = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and, gte, lte }) => 
          and(
            gte(entries.date, fromDate),
            lte(entries.date, toDate),
            eq(entries.userId, req.user!.id)
          )
      });

      // Calculate average intensity for each emotion
      const emotionIntensities: Record<string, { total: number, count: number }> = {};
      
      for (const entry of entries) {
        if (!emotionIntensities[entry.emotionName]) {
          emotionIntensities[entry.emotionName] = { total: 0, count: 0 };
        }
        emotionIntensities[entry.emotionName].total += entry.intensity;
        emotionIntensities[entry.emotionName].count += 1;
      }

      // Convert to array with average intensities
      const emotionIntensityArray = Object.entries(emotionIntensities).map(([emotion, { total, count }]) => ({
        emotion,
        intensity: total / count
      }));

      // Sort by intensity (descending) and limit results
      emotionIntensityArray.sort((a, b) => b.intensity - a.intensity);
      const limitedResults = emotionIntensityArray.slice(0, limit);

      res.json(limitedResults);
    } catch (error) {
      console.error(`Error fetching highest intensity emotions:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}