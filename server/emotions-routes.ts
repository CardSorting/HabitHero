import { Express, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { z } from 'zod';
import { getCopingStrategy } from './anthropicService';
import * as schema from '../shared/schema';
import { format } from 'date-fns';
import { getUserIdFromRequest } from './emotion-service-helper';

// Define a type for authenticated requests
type AuthRequest = Request & {
  user?: {
    id: number;
    username: string;
  }
}

// Middleware to ensure user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

export function registerEmotionsRoutes(app: Express) {
  // Get predefined emotions list
  app.get('/api/emotions/predefined', (req: Request, res: Response) => {
    // Return a hardcoded list of emotions with categories
    // For a production app, this would typically come from the database
    const predefinedEmotions = [
      {
        category: 'positive',
        emotions: ['Joy', 'Love', 'Gratitude', 'Hope', 'Pride', 'Serenity', 'Interest', 'Amusement', 'Awe', 'Inspiration', 'Excitement', 'Content', 'Proud', 'Satisfied']
      },
      {
        category: 'negative',
        emotions: ['Anger', 'Frustration', 'Sadness', 'Fear', 'Shame', 'Guilt', 'Disgust', 'Jealousy', 'Envy', 'Anxiety', 'Despair', 'Grief', 'Loneliness', 'Disappointment']
      },
      {
        category: 'neutral',
        emotions: ['Calm', 'Surprise', 'Confusion', 'Curiosity', 'Tired', 'Bored', 'Distracted', 'Nervous']
      }
    ];

    res.json({ message: 'Use client-side predefined emotions', data: predefinedEmotions });
  });

  // Get a specific emotion by ID
  app.get('/api/emotions/predefined/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const emotion = {
      id,
      name: 'Joy',
      category: 'positive'
    };
    res.json(emotion);
  });

  // Get all emotion entries for a user
  app.get('/api/emotions/entries', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get userId from request (allows therapist to view client data)
      const userId = getUserIdFromRequest(req);
      
      console.log(`Get all emotions - Fetching for userId: ${userId}`);
      
      // Get entries from the database
      const entries = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq }) => eq(entries.userId, userId)
      });

      res.json(entries);
    } catch (error) {
      console.error('Error getting emotion entries:', error);
      res.status(500).json({ error: 'Failed to get emotion entries' });
    }
  });

  // Get emotion entries by date range
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
      
      // Get userId from request (allows therapist to view client data)
      const userId = getUserIdFromRequest(req);
      
      console.log(`Get emotions by date range - Fetching for userId: ${userId}, from: ${fromDate}, to: ${toDate}`);
      
      // Get entries from the database
      const entries = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and, gte, lte }) => 
          and(
            gte(entries.date, fromDate),
            lte(entries.date, toDate),
            eq(entries.userId, userId)
          )
      });

      res.json(entries);
    } catch (error) {
      console.error('Error getting emotion entries by date range:', error);
      res.status(500).json({ error: 'Failed to get emotion entries by date range' });
    }
  });

  // Get emotion entries for a specific date
  app.get('/api/emotions/entries/date/:date', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const date = req.params.date;
      
      // Get userId from request (allows therapist to view client data)
      const userId = getUserIdFromRequest(req);
      
      console.log(`Get emotions for date - Fetching for userId: ${userId}, date: ${date}`);
      
      // Get entries from the database
      const entries = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and }) => 
          and(
            eq(entries.date, date),
            eq(entries.userId, userId)
          )
      });

      res.json(entries);
    } catch (error) {
      console.error('Error getting emotion entries for date:', error);
      res.status(500).json({ error: 'Failed to get emotion entries for date' });
    }
  });

  // Get a specific emotion entry by ID
  app.get('/api/emotions/entries/:id([0-9]+)', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const entryId = parseInt(req.params.id);
      
      // Get userId from request (allows therapist to view client data)
      const userId = getUserIdFromRequest(req);
      
      console.log(`Get emotion by ID - Fetching for userId: ${userId}, entryId: ${entryId}`);
      
      // Get the entry from the database
      const [entry] = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and }) => 
          and(
            eq(entries.id, entryId),
            eq(entries.userId, userId)
          )
      });

      if (!entry) {
        return res.status(404).json({ error: 'Emotion entry not found' });
      }

      res.json(entry);
    } catch (error) {
      console.error('Error getting emotion entry by ID:', error);
      res.status(500).json({ error: 'Failed to get emotion entry' });
    }
  });

  // Create a new emotion entry
  app.post('/api/emotions/entries', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const emotionSchema = z.object({
        date: z.string(),
        emotionName: z.string(),
        intensity: z.number().min(1).max(10),
        notes: z.string().optional(),
        category: z.string().optional()
      });

      const validationResult = emotionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Invalid emotion data', details: validationResult.error });
      }

      const emotionData = validationResult.data;
      
      // Insert into database
      const [entry] = await db.insert(schema.emotionTrackingEntries).values({
        ...emotionData,
        userId: req.user.id,
        createdAt: new Date().toISOString(),
      }).returning();

      res.status(201).json(entry);
    } catch (error) {
      console.error('Error creating emotion entry:', error);
      res.status(500).json({ error: 'Failed to create emotion entry' });
    }
  });

  // Update an emotion entry
  app.put('/api/emotions/entries/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const entryId = parseInt(req.params.id);
      
      const emotionSchema = z.object({
        date: z.string().optional(),
        emotionName: z.string().optional(),
        intensity: z.number().min(1).max(10).optional(),
        notes: z.string().optional(),
        category: z.string().optional()
      });

      const validationResult = emotionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Invalid emotion data', details: validationResult.error });
      }

      const emotionData = validationResult.data;
      
      // Get the entry to update
      const [existingEntry] = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and }) => 
          and(
            eq(entries.id, entryId),
            eq(entries.userId, req.user!.id)
          )
      });

      if (!existingEntry) {
        return res.status(404).json({ error: 'Emotion entry not found' });
      }

      // Update in database
      const [updatedEntry] = await db.update(schema.emotionTrackingEntries)
        .set(emotionData)
        .where((entries, { eq, and }) => 
          and(
            eq(entries.id, entryId),
            eq(entries.userId, req.user!.id)
          )
        )
        .returning();

      res.json(updatedEntry);
    } catch (error) {
      console.error('Error updating emotion entry:', error);
      res.status(500).json({ error: 'Failed to update emotion entry' });
    }
  });

  // Delete an emotion entry
  app.delete('/api/emotions/entries/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const entryId = parseInt(req.params.id);
      
      // Get the entry to delete
      const [existingEntry] = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and }) => 
          and(
            eq(entries.id, entryId),
            eq(entries.userId, req.user!.id)
          )
      });

      if (!existingEntry) {
        return res.status(404).json({ error: 'Emotion entry not found' });
      }

      // Delete from database
      await db.delete(schema.emotionTrackingEntries)
        .where((entries, { eq, and }) => 
          and(
            eq(entries.id, entryId),
            eq(entries.userId, req.user!.id)
          )
        );

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting emotion entry:', error);
      res.status(500).json({ error: 'Failed to delete emotion entry' });
    }
  });

  // Get daily emotion summary
  app.get('/api/emotions/analytics/summary/:date', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const date = req.params.date;
      
      // Get userId from request (allows therapist to view client data)
      const userId = getUserIdFromRequest(req);
      
      console.log(`Emotion summary - Fetching for userId: ${userId}, date: ${date}`);
      
      // Get entries for the current date
      const entries = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and }) => 
          and(
            eq(entries.date, date),
            eq(entries.userId, userId)
          )
      });

      // Get entries for the previous date for comparison
      const prevDate = new Date(date);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      
      const prevEntries = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and }) => 
          and(
            eq(entries.date, prevDateStr),
            eq(entries.userId, userId)
          )
      });

      // Calculate summary metrics
      const totalEntries = entries.length;
      const positiveEntries = entries.filter(e => e.category === 'positive').length;
      const negativeEntries = entries.filter(e => e.category === 'negative').length;
      const neutralEntries = entries.filter(e => e.category === 'neutral').length;
      
      const avgIntensity = entries.length > 0 
        ? entries.reduce((sum, entry) => sum + entry.intensity, 0) / entries.length 
        : 0;
      
      const prevAvgIntensity = prevEntries.length > 0 
        ? prevEntries.reduce((sum, entry) => sum + entry.intensity, 0) / prevEntries.length 
        : 0;
      
      const intensityChange = avgIntensity - prevAvgIntensity;
      
      // Find most frequent emotion
      const emotionCounts: Record<string, number> = {};
      for (const entry of entries) {
        emotionCounts[entry.emotionName] = (emotionCounts[entry.emotionName] || 0) + 1;
      }
      
      let dominantEmotion = '';
      let maxCount = 0;
      
      for (const [emotion, count] of Object.entries(emotionCounts)) {
        if (count > maxCount) {
          dominantEmotion = emotion;
          maxCount = count;
        }
      }

      // Determine overall mood based on positive vs negative entries
      let overallMood = 'neutral';
      if (positiveEntries > negativeEntries + neutralEntries) {
        overallMood = 'positive';
      } else if (negativeEntries > positiveEntries + neutralEntries) {
        overallMood = 'negative';
      }

      const summary = {
        date,
        totalEntries,
        positiveEntries,
        negativeEntries,
        neutralEntries,
        avgIntensity,
        intensityChange,
        dominantEmotion,
        overallMood
      };

      res.json(summary);
    } catch (error) {
      console.error('Error generating emotion summary:', error);
      res.status(500).json({ error: 'Failed to generate emotion summary' });
    }
  });

  // Get emotion trends
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
      
      // Get userId from request (allows therapist to view client data)
      const userId = getUserIdFromRequest(req);
      
      console.log(`Emotion trends - Fetching for userId: ${userId}, from: ${fromDate}, to: ${toDate}`);
      
      // Get entries from the database
      const entries = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and, gte, lte }) => 
          and(
            gte(entries.date, fromDate),
            lte(entries.date, toDate),
            eq(entries.userId, userId)
          )
      });

      // Group entries by date
      const entriesByDate: Record<string, typeof entries> = {};
      
      for (const entry of entries) {
        if (!entriesByDate[entry.date]) {
          entriesByDate[entry.date] = [];
        }
        entriesByDate[entry.date].push(entry);
      }

      // Calculate trends for each date
      const trends = Object.entries(entriesByDate).map(([date, dateEntries]) => {
        // Count emotions and calculate average intensity
        const emotions: Record<string, { count: number, averageIntensity: number }> = {};
        
        for (const entry of dateEntries) {
          if (!emotions[entry.emotionName]) {
            emotions[entry.emotionName] = { count: 0, averageIntensity: 0 };
          }
          
          emotions[entry.emotionName].count++;
          emotions[entry.emotionName].averageIntensity += entry.intensity;
        }
        
        // Calculate averages
        for (const emotion in emotions) {
          emotions[emotion].averageIntensity /= emotions[emotion].count;
        }

        // Find dominant emotion
        let dominantEmotion = '';
        let maxCount = 0;
        
        for (const [emotion, data] of Object.entries(emotions)) {
          if (data.count > maxCount) {
            dominantEmotion = emotion;
            maxCount = data.count;
          }
        }

        // Determine overall mood
        const positiveEntries = dateEntries.filter(e => e.category === 'positive').length;
        const negativeEntries = dateEntries.filter(e => e.category === 'negative').length;
        const neutralEntries = dateEntries.filter(e => e.category === 'neutral').length;
        
        let overallMood = 'neutral';
        if (positiveEntries > negativeEntries + neutralEntries) {
          overallMood = 'positive';
        } else if (negativeEntries > positiveEntries + neutralEntries) {
          overallMood = 'negative';
        }

        return {
          date,
          emotions,
          overallMood,
          dominantEmotion
        };
      });

      // Sort by date
      trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      res.json(trends);
    } catch (error) {
      console.error('Error generating emotion trends:', error);
      res.status(500).json({ error: 'Failed to generate emotion trends' });
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
      
      // Get userId from request (allows therapist to view client data)
      const userId = getUserIdFromRequest(req);
      
      console.log(`Frequent emotions API - Fetching for userId: ${userId}, from: ${fromDate}, to: ${toDate}`);
      
      // Get entries from the database
      const entries = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and, gte, lte }) => 
          and(
            gte(entries.date, fromDate),
            lte(entries.date, toDate),
            eq(entries.userId, userId)
          )
      });

      // Count each emotion
      const emotionCounts: Record<string, number> = {};
      for (const entry of entries) {
        emotionCounts[entry.emotionName] = (emotionCounts[entry.emotionName] || 0) + 1;
      }

      // Convert to array for sorting
      const emotionCountArray = Object.entries(emotionCounts).map(([emotion, count]) => ({
        emotion,
        count
      }));

      // Sort by count descending and limit
      emotionCountArray.sort((a, b) => b.count - a.count);
      const topEmotions = emotionCountArray.slice(0, limit);

      res.json(topEmotions);
    } catch (error) {
      console.error('Error in frequent emotions endpoint:', error);
      res.status(500).json({ error: 'Failed to fetch frequent emotions' });
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
      
      // Get userId from request (allows therapist to view client data)
      const userId = getUserIdFromRequest(req);
      
      console.log(`Highest intensity emotions - Fetching for userId: ${userId}, from: ${fromDate}, to: ${toDate}`);
      
      // Get entries from the database
      const entries = await db.query.emotionTrackingEntries.findMany({
        where: (entries, { eq, and, gte, lte }) => 
          and(
            gte(entries.date, fromDate),
            lte(entries.date, toDate),
            eq(entries.userId, userId)
          )
      });

      // Calculate average intensity for each emotion
      const emotionIntensities: Record<string, { sum: number; count: number }> = {};
      
      for (const entry of entries) {
        if (!emotionIntensities[entry.emotionName]) {
          emotionIntensities[entry.emotionName] = { sum: 0, count: 0 };
        }
        
        emotionIntensities[entry.emotionName].sum += entry.intensity;
        emotionIntensities[entry.emotionName].count++;
      }

      // Convert to array with average intensity
      const emotionIntensityArray = Object.entries(emotionIntensities).map(([emotion, data]) => ({
        emotion,
        intensity: data.sum / data.count
      }));

      // Sort by intensity (descending) and limit results
      emotionIntensityArray.sort((a, b) => b.intensity - a.intensity);
      const highestIntensities = emotionIntensityArray.slice(0, limit);

      res.json(highestIntensities);
    } catch (error) {
      console.error('Error in highest intensity emotions endpoint:', error);
      res.status(500).json({ error: 'Failed to fetch highest intensity emotions' });
    }
  });

  // Get coping strategies for emotions
  app.get('/api/emotions/coping-strategies', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const emotion = req.query.emotion as string;
      const intensity = req.query.intensity as string;
      
      if (!emotion || !intensity) {
        return res.status(400).json({ error: 'Missing emotion or intensity parameters' });
      }
      
      // Get coping strategy from Anthropic API or preset database
      const strategy = await getCopingStrategy(emotion, intensity);
      
      res.json({ emotion, intensity, strategy });
    } catch (error) {
      console.error('Error fetching coping strategy:', error);
      res.status(500).json({ error: 'Failed to fetch coping strategy' });
    }
  });
}