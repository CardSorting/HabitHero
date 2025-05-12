/**
 * Routes for the Wellness Challenge system
 */
import { Request, Response, NextFunction, Express } from 'express';
import { eq, and, desc, sql, between } from 'drizzle-orm';
import { db } from './db';

import {
  wellnessChallenges,
  wellnessChallengeGoals,
  wellnessChallengeProgress,
  emotionCategories,
  emotions,
  userEmotions,
  WellnessChallenge,
  WellnessChallengeGoal,
  WellnessChallengeProgress,
  EmotionCategory,
  Emotion,
  UserEmotion,
  insertWellnessChallengeSchema,
  insertWellnessChallengeGoalSchema,
  insertWellnessChallengeProgressSchema,
  insertEmotionCategorySchema,
  insertEmotionSchema,
  insertUserEmotionSchema
} from '@shared/schema';

import { z } from 'zod';

// Auth request type
type AuthRequest = Request & {
  user?: {
    id: number;
    username: string;
  }
}

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthRequest;
  if (authReq.user) {
    next();
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
}

export function registerWellnessChallengeRoutes(app: Express) {
  
  //===================================================
  // Wellness Challenges
  //===================================================
  
  // Get all challenges for user
  app.get('/api/wellness-challenges', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      let query = eq(wellnessChallenges.userId, userId);
      
      // Optional filters
      if (req.query.status) {
        query = and(query, eq(wellnessChallenges.status, req.query.status as string));
      }
      
      if (req.query.type) {
        query = and(query, eq(wellnessChallenges.type, req.query.type as string));
      }
      
      if (req.query.frequency) {
        query = and(query, eq(wellnessChallenges.frequency, req.query.frequency as string));
      }
      
      const challenges = await db
        .select()
        .from(wellnessChallenges)
        .where(query)
        .orderBy(desc(wellnessChallenges.createdAt));
        
      res.json(challenges);
    } catch (error) {
      console.error('Error fetching wellness challenges:', error);
      res.status(500).json({ message: 'Failed to fetch challenges' });
    }
  });
  
  // Get a specific challenge by ID
  app.get('/api/wellness-challenges/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const challengeId = parseInt(req.params.id);
      
      const [challenge] = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.id, challengeId),
            eq(wellnessChallenges.userId, userId)
          )
        );
      
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      res.json(challenge);
    } catch (error) {
      console.error('Error fetching wellness challenge:', error);
      res.status(500).json({ message: 'Failed to fetch challenge' });
    }
  });
  
  // Get challenge with full details
  app.get('/api/wellness-challenges/:id/details', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const challengeId = parseInt(req.params.id);
      
      const [challenge] = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.id, challengeId),
            eq(wellnessChallenges.userId, userId)
          )
        );
      
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Get goals
      const goals = await db
        .select()
        .from(wellnessChallengeGoals)
        .where(eq(wellnessChallengeGoals.challengeId, challengeId));
      
      // Get progress
      const progressEntries = await db
        .select()
        .from(wellnessChallengeProgress)
        .where(eq(wellnessChallengeProgress.challengeId, challengeId))
        .orderBy(desc(wellnessChallengeProgress.date));
      
      res.json({
        ...challenge,
        goals,
        progressEntries
      });
    } catch (error) {
      console.error('Error fetching challenge details:', error);
      res.status(500).json({ message: 'Failed to fetch challenge details' });
    }
  });
  
  // Get challenges by date range
  app.get('/api/wellness-challenges/date-range', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      const challenges = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.userId, userId),
            sql`${wellnessChallenges.startDate} <= ${endDate as string} AND ${wellnessChallenges.endDate} >= ${startDate as string}`
          )
        )
        .orderBy(desc(wellnessChallenges.createdAt));
      
      res.json(challenges);
    } catch (error) {
      console.error('Error fetching challenges by date range:', error);
      res.status(500).json({ message: 'Failed to fetch challenges by date range' });
    }
  });
  
  // Get challenges by status
  app.get('/api/wellness-challenges/status/:status', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const status = req.params.status;
      
      const challenges = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.userId, userId),
            eq(wellnessChallenges.status, status)
          )
        )
        .orderBy(desc(wellnessChallenges.createdAt));
      
      res.json(challenges);
    } catch (error) {
      console.error('Error fetching challenges by status:', error);
      res.status(500).json({ message: 'Failed to fetch challenges by status' });
    }
  });
  
  // Get challenges by type
  app.get('/api/wellness-challenges/type/:type', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const type = req.params.type;
      
      const challenges = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.userId, userId),
            eq(wellnessChallenges.type, type)
          )
        )
        .orderBy(desc(wellnessChallenges.createdAt));
      
      res.json(challenges);
    } catch (error) {
      console.error('Error fetching challenges by type:', error);
      res.status(500).json({ message: 'Failed to fetch challenges by type' });
    }
  });
  
  // Get challenges by frequency
  app.get('/api/wellness-challenges/frequency/:frequency', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const frequency = req.params.frequency;
      
      const challenges = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.userId, userId),
            eq(wellnessChallenges.frequency, frequency)
          )
        )
        .orderBy(desc(wellnessChallenges.createdAt));
      
      res.json(challenges);
    } catch (error) {
      console.error('Error fetching challenges by frequency:', error);
      res.status(500).json({ message: 'Failed to fetch challenges by frequency' });
    }
  });
  
  // Get challenge summary
  app.get('/api/wellness-challenges/summary', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Get all challenges for the user
      const challenges = await db
        .select()
        .from(wellnessChallenges)
        .where(eq(wellnessChallenges.userId, userId));
      
      const totalChallenges = challenges.length;
      const activeChallenges = challenges.filter(c => c.status === 'active').length;
      const completedChallenges = challenges.filter(c => c.status === 'completed').length;
      const abandonedChallenges = challenges.filter(c => c.status === 'abandoned').length;
      
      // Calculate average completion rate
      let averageCompletionRate = 0;
      if (completedChallenges > 0) {
        const completedChallengeIds = challenges
          .filter(c => c.status === 'completed')
          .map(c => c.id);
        
        // This is a simplification - in a real system, this would be a more complex calculation
        // based on the actual progress records
        averageCompletionRate = 100; // Completed challenges are 100% complete by definition
      }
      
      res.json({
        totalChallenges,
        activeChallenges,
        completedChallenges,
        abandonedChallenges,
        averageCompletionRate
      });
    } catch (error) {
      console.error('Error fetching challenge summary:', error);
      res.status(500).json({ message: 'Failed to fetch challenge summary' });
    }
  });
  
  // Create a new challenge
  app.post('/api/wellness-challenges', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Validate request body
      const parsedData = insertWellnessChallengeSchema.parse({
        ...req.body,
        userId
      });
      
      // Create the challenge
      const [challenge] = await db
        .insert(wellnessChallenges)
        .values(parsedData)
        .returning();
      
      res.status(201).json(challenge);
    } catch (error) {
      console.error('Error creating wellness challenge:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid challenge data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create challenge' });
      }
    }
  });
  
  // Update a challenge
  app.patch('/api/wellness-challenges/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const challengeId = parseInt(req.params.id);
      
      // Check if challenge exists and belongs to user
      const [existingChallenge] = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.id, challengeId),
            eq(wellnessChallenges.userId, userId)
          )
        );
      
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Update the challenge
      const [updatedChallenge] = await db
        .update(wellnessChallenges)
        .set({
          ...req.body,
          updatedAt: new Date()
        })
        .where(eq(wellnessChallenges.id, challengeId))
        .returning();
      
      res.json(updatedChallenge);
    } catch (error) {
      console.error('Error updating wellness challenge:', error);
      res.status(500).json({ message: 'Failed to update challenge' });
    }
  });
  
  // Update challenge status
  app.post('/api/wellness-challenges/:id/status', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const challengeId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['active', 'completed', 'abandoned'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      // Check if challenge exists and belongs to user
      const [existingChallenge] = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.id, challengeId),
            eq(wellnessChallenges.userId, userId)
          )
        );
      
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Update the status
      const [updatedChallenge] = await db
        .update(wellnessChallenges)
        .set({
          status,
          updatedAt: new Date()
        })
        .where(eq(wellnessChallenges.id, challengeId))
        .returning();
      
      res.json(updatedChallenge);
    } catch (error) {
      console.error('Error updating challenge status:', error);
      res.status(500).json({ message: 'Failed to update challenge status' });
    }
  });
  
  // Delete a challenge
  app.delete('/api/wellness-challenges/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const challengeId = parseInt(req.params.id);
      
      // Check if challenge exists and belongs to user
      const [existingChallenge] = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.id, challengeId),
            eq(wellnessChallenges.userId, userId)
          )
        );
      
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Delete all related goals and progress entries
      await db
        .delete(wellnessChallengeGoals)
        .where(eq(wellnessChallengeGoals.challengeId, challengeId));
      
      await db
        .delete(wellnessChallengeProgress)
        .where(eq(wellnessChallengeProgress.challengeId, challengeId));
      
      // Delete the challenge
      await db
        .delete(wellnessChallenges)
        .where(eq(wellnessChallenges.id, challengeId));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting wellness challenge:', error);
      res.status(500).json({ message: 'Failed to delete challenge' });
    }
  });
  
  //===================================================
  // Challenge Goals
  //===================================================
  
  // Get goals for a challenge
  app.get('/api/wellness-challenges/goals', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const challengeId = parseInt(req.query.challengeId as string);
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: 'Challenge ID is required' });
      }
      
      // Check if challenge belongs to user
      const [challenge] = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.id, challengeId),
            eq(wellnessChallenges.userId, userId)
          )
        );
      
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Get goals
      const goals = await db
        .select()
        .from(wellnessChallengeGoals)
        .where(eq(wellnessChallengeGoals.challengeId, challengeId));
      
      res.json(goals);
    } catch (error) {
      console.error('Error fetching challenge goals:', error);
      res.status(500).json({ message: 'Failed to fetch goals' });
    }
  });
  
  // Get a specific goal
  app.get('/api/wellness-challenges/goals/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const goalId = parseInt(req.params.id);
      
      const [goal] = await db
        .select()
        .from(wellnessChallengeGoals)
        .where(eq(wellnessChallengeGoals.id, goalId));
      
      if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
      }
      
      // Check if the goal belongs to a challenge owned by the user
      const [challenge] = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.id, goal.challengeId),
            eq(wellnessChallenges.userId, userId)
          )
        );
      
      if (!challenge) {
        return res.status(403).json({ message: 'Not authorized to view this goal' });
      }
      
      res.json(goal);
    } catch (error) {
      console.error('Error fetching challenge goal:', error);
      res.status(500).json({ message: 'Failed to fetch goal' });
    }
  });
  
  // Create a new goal
  app.post('/api/wellness-challenges/goals', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { challengeId } = req.body;
      
      // Check if challenge belongs to user
      const [challenge] = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.id, challengeId),
            eq(wellnessChallenges.userId, userId)
          )
        );
      
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Validate request body
      const parsedData = insertWellnessChallengeGoalSchema.parse(req.body);
      
      // Create the goal
      const [goal] = await db
        .insert(wellnessChallengeGoals)
        .values(parsedData)
        .returning();
      
      res.status(201).json(goal);
    } catch (error) {
      console.error('Error creating challenge goal:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid goal data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create goal' });
      }
    }
  });
  
  // Update a goal
  app.patch('/api/wellness-challenges/goals/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const goalId = parseInt(req.params.id);
      
      // Check if goal exists
      const [goal] = await db
        .select()
        .from(wellnessChallengeGoals)
        .where(eq(wellnessChallengeGoals.id, goalId));
      
      if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
      }
      
      // Check if the goal belongs to a challenge owned by the user
      const [challenge] = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.id, goal.challengeId),
            eq(wellnessChallenges.userId, userId)
          )
        );
      
      if (!challenge) {
        return res.status(403).json({ message: 'Not authorized to update this goal' });
      }
      
      // Update the goal
      const [updatedGoal] = await db
        .update(wellnessChallengeGoals)
        .set(req.body)
        .where(eq(wellnessChallengeGoals.id, goalId))
        .returning();
      
      res.json(updatedGoal);
    } catch (error) {
      console.error('Error updating challenge goal:', error);
      res.status(500).json({ message: 'Failed to update goal' });
    }
  });
  
  // Delete a goal
  app.delete('/api/wellness-challenges/goals/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const goalId = parseInt(req.params.id);
      
      // Check if goal exists
      const [goal] = await db
        .select()
        .from(wellnessChallengeGoals)
        .where(eq(wellnessChallengeGoals.id, goalId));
      
      if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
      }
      
      // Check if the goal belongs to a challenge owned by the user
      const [challenge] = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.id, goal.challengeId),
            eq(wellnessChallenges.userId, userId)
          )
        );
      
      if (!challenge) {
        return res.status(403).json({ message: 'Not authorized to delete this goal' });
      }
      
      // Delete the goal
      await db
        .delete(wellnessChallengeGoals)
        .where(eq(wellnessChallengeGoals.id, goalId));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting challenge goal:', error);
      res.status(500).json({ message: 'Failed to delete goal' });
    }
  });
  
  //===================================================
  // Challenge Progress
  //===================================================
  
  // Get progress for a challenge
  app.get('/api/wellness-challenges/progress', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const challengeId = parseInt(req.query.challengeId as string);
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: 'Challenge ID is required' });
      }
      
      // Check if challenge belongs to user
      const [challenge] = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.id, challengeId),
            eq(wellnessChallenges.userId, userId)
          )
        );
      
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Get progress
      const progress = await db
        .select()
        .from(wellnessChallengeProgress)
        .where(eq(wellnessChallengeProgress.challengeId, challengeId))
        .orderBy(desc(wellnessChallengeProgress.date));
      
      res.json(progress);
    } catch (error) {
      console.error('Error fetching challenge progress:', error);
      res.status(500).json({ message: 'Failed to fetch progress' });
    }
  });
  
  // Get progress for a specific date
  app.get('/api/wellness-challenges/progress/date', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const challengeId = parseInt(req.query.challengeId as string);
      const date = req.query.date as string;
      
      if (isNaN(challengeId) || !date) {
        return res.status(400).json({ message: 'Challenge ID and date are required' });
      }
      
      // Check if challenge belongs to user
      const [challenge] = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.id, challengeId),
            eq(wellnessChallenges.userId, userId)
          )
        );
      
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Get progress for the date
      const [progress] = await db
        .select()
        .from(wellnessChallengeProgress)
        .where(
          and(
            eq(wellnessChallengeProgress.challengeId, challengeId),
            eq(wellnessChallengeProgress.date, date)
          )
        );
      
      if (!progress) {
        return res.status(404).json({ message: 'No progress found for this date' });
      }
      
      res.json(progress);
    } catch (error) {
      console.error('Error fetching challenge progress for date:', error);
      res.status(500).json({ message: 'Failed to fetch progress for date' });
    }
  });
  
  // Get progress for a date range
  app.get('/api/wellness-challenges/progress/date-range', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const challengeId = parseInt(req.query.challengeId as string);
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      if (isNaN(challengeId) || !startDate || !endDate) {
        return res.status(400).json({ 
          message: 'Challenge ID, start date, and end date are required' 
        });
      }
      
      // Check if challenge belongs to user
      const [challenge] = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.id, challengeId),
            eq(wellnessChallenges.userId, userId)
          )
        );
      
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Get progress for the date range
      const progress = await db
        .select()
        .from(wellnessChallengeProgress)
        .where(
          and(
            eq(wellnessChallengeProgress.challengeId, challengeId),
            between(wellnessChallengeProgress.date, startDate, endDate)
          )
        )
        .orderBy(wellnessChallengeProgress.date);
      
      res.json(progress);
    } catch (error) {
      console.error('Error fetching challenge progress for date range:', error);
      res.status(500).json({ message: 'Failed to fetch progress for date range' });
    }
  });
  
  // Record progress
  app.post('/api/wellness-challenges/progress/upsert', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { challengeId, date, value, notes } = req.body;
      
      if (!challengeId || !date || value === undefined) {
        return res.status(400).json({ 
          message: 'Challenge ID, date, and value are required' 
        });
      }
      
      // Check if challenge belongs to user
      const [challenge] = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.id, challengeId),
            eq(wellnessChallenges.userId, userId)
          )
        );
      
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Check if there's already progress for this date
      const [existingProgress] = await db
        .select()
        .from(wellnessChallengeProgress)
        .where(
          and(
            eq(wellnessChallengeProgress.challengeId, challengeId),
            eq(wellnessChallengeProgress.date, date)
          )
        );
      
      let progress;
      
      if (existingProgress) {
        // Update existing progress
        [progress] = await db
          .update(wellnessChallengeProgress)
          .set({
            value,
            notes,
            updatedAt: new Date()
          })
          .where(eq(wellnessChallengeProgress.id, existingProgress.id))
          .returning();
      } else {
        // Create new progress
        const progressData = {
          challengeId,
          date,
          value,
          notes: notes || null
        };
        
        [progress] = await db
          .insert(wellnessChallengeProgress)
          .values(progressData)
          .returning();
      }
      
      res.json(progress);
    } catch (error) {
      console.error('Error recording challenge progress:', error);
      res.status(500).json({ message: 'Failed to record progress' });
    }
  });
  
  // Delete progress
  app.delete('/api/wellness-challenges/progress/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const progressId = parseInt(req.params.id);
      
      // Get the progress entry
      const [progress] = await db
        .select()
        .from(wellnessChallengeProgress)
        .where(eq(wellnessChallengeProgress.id, progressId));
      
      if (!progress) {
        return res.status(404).json({ message: 'Progress entry not found' });
      }
      
      // Check if the progress entry belongs to a challenge owned by the user
      const [challenge] = await db
        .select()
        .from(wellnessChallenges)
        .where(
          and(
            eq(wellnessChallenges.id, progress.challengeId),
            eq(wellnessChallenges.userId, userId)
          )
        );
      
      if (!challenge) {
        return res.status(403).json({ message: 'Not authorized to delete this progress entry' });
      }
      
      // Delete the progress entry
      await db
        .delete(wellnessChallengeProgress)
        .where(eq(wellnessChallengeProgress.id, progressId));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting challenge progress:', error);
      res.status(500).json({ message: 'Failed to delete progress' });
    }
  });
  
  //===================================================
  // Emotion Categories
  //===================================================
  
  // Get all emotion categories
  app.get('/api/emotion-categories', async (req: Request, res: Response) => {
    try {
      const categories = await db
        .select()
        .from(emotionCategories)
        .orderBy(emotionCategories.name);
      
      res.json(categories);
    } catch (error) {
      console.error('Error fetching emotion categories:', error);
      res.status(500).json({ message: 'Failed to fetch emotion categories' });
    }
  });
  
  // Get a specific category
  app.get('/api/emotion-categories/:id', async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      
      const [category] = await db
        .select()
        .from(emotionCategories)
        .where(eq(emotionCategories.id, categoryId));
      
      if (!category) {
        return res.status(404).json({ message: 'Emotion category not found' });
      }
      
      res.json(category);
    } catch (error) {
      console.error('Error fetching emotion category:', error);
      res.status(500).json({ message: 'Failed to fetch emotion category' });
    }
  });
  
  //===================================================
  // Emotions
  //===================================================
  
  // Get all emotions
  app.get('/api/emotions', async (req: Request, res: Response) => {
    try {
      let query = sql`1=1`;
      
      if (req.query.categoryId) {
        const categoryId = parseInt(req.query.categoryId as string);
        query = eq(emotions.categoryId, categoryId);
      }
      
      const allEmotions = await db
        .select()
        .from(emotions)
        .where(query)
        .orderBy(emotions.name);
      
      res.json(allEmotions);
    } catch (error) {
      console.error('Error fetching emotions:', error);
      res.status(500).json({ message: 'Failed to fetch emotions' });
    }
  });
  
  // Get emotions with their categories
  app.get('/api/emotions/with-categories', async (req: Request, res: Response) => {
    try {
      const allEmotions = await db
        .select({
          ...emotions,
          category: emotionCategories
        })
        .from(emotions)
        .leftJoin(emotionCategories, eq(emotions.categoryId, emotionCategories.id))
        .orderBy(emotions.name);
      
      res.json(allEmotions);
    } catch (error) {
      console.error('Error fetching emotions with categories:', error);
      res.status(500).json({ message: 'Failed to fetch emotions with categories' });
    }
  });
  
  // Get a specific emotion
  app.get('/api/emotions/:id', async (req: Request, res: Response) => {
    try {
      const emotionId = parseInt(req.params.id);
      
      const [emotion] = await db
        .select({
          ...emotions,
          category: emotionCategories
        })
        .from(emotions)
        .where(eq(emotions.id, emotionId))
        .leftJoin(emotionCategories, eq(emotions.categoryId, emotionCategories.id));
      
      if (!emotion) {
        return res.status(404).json({ message: 'Emotion not found' });
      }
      
      res.json(emotion);
    } catch (error) {
      console.error('Error fetching emotion:', error);
      res.status(500).json({ message: 'Failed to fetch emotion' });
    }
  });
  
  //===================================================
  // User Emotions
  //===================================================
  
  // Get all user emotions
  app.get('/api/user-emotions', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      let query = eq(userEmotions.userId, userId);
      
      if (req.query.categoryId) {
        const categoryId = parseInt(req.query.categoryId as string);
        query = and(query, eq(userEmotions.categoryId, categoryId));
      }
      
      const userEmotionsList = await db
        .select()
        .from(userEmotions)
        .where(query)
        .orderBy(userEmotions.name);
      
      res.json(userEmotionsList);
    } catch (error) {
      console.error('Error fetching user emotions:', error);
      res.status(500).json({ message: 'Failed to fetch user emotions' });
    }
  });
  
  // Get user emotions with their categories
  app.get('/api/user-emotions/with-categories', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      
      const userEmotionsList = await db
        .select({
          ...userEmotions,
          category: emotionCategories
        })
        .from(userEmotions)
        .where(eq(userEmotions.userId, userId))
        .leftJoin(emotionCategories, eq(userEmotions.categoryId, emotionCategories.id))
        .orderBy(userEmotions.name);
      
      res.json(userEmotionsList);
    } catch (error) {
      console.error('Error fetching user emotions with categories:', error);
      res.status(500).json({ message: 'Failed to fetch user emotions with categories' });
    }
  });
  
  // Get a specific user emotion
  app.get('/api/user-emotions/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const emotionId = parseInt(req.params.id);
      
      const [userEmotion] = await db
        .select({
          ...userEmotions,
          category: emotionCategories
        })
        .from(userEmotions)
        .where(
          and(
            eq(userEmotions.id, emotionId),
            eq(userEmotions.userId, userId)
          )
        )
        .leftJoin(emotionCategories, eq(userEmotions.categoryId, emotionCategories.id));
      
      if (!userEmotion) {
        return res.status(404).json({ message: 'User emotion not found' });
      }
      
      res.json(userEmotion);
    } catch (error) {
      console.error('Error fetching user emotion:', error);
      res.status(500).json({ message: 'Failed to fetch user emotion' });
    }
  });
  
  // Create a user emotion
  app.post('/api/user-emotions', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Validate request body
      const parsedData = insertUserEmotionSchema.parse({
        ...req.body,
        userId
      });
      
      // Create the user emotion
      const [userEmotion] = await db
        .insert(userEmotions)
        .values(parsedData)
        .returning();
      
      res.status(201).json(userEmotion);
    } catch (error) {
      console.error('Error creating user emotion:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid user emotion data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create user emotion' });
      }
    }
  });
  
  // Update a user emotion
  app.patch('/api/user-emotions/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const emotionId = parseInt(req.params.id);
      
      // Check if user emotion exists and belongs to user
      const [existingEmotion] = await db
        .select()
        .from(userEmotions)
        .where(
          and(
            eq(userEmotions.id, emotionId),
            eq(userEmotions.userId, userId)
          )
        );
      
      if (!existingEmotion) {
        return res.status(404).json({ message: 'User emotion not found' });
      }
      
      // Update the user emotion
      const [updatedEmotion] = await db
        .update(userEmotions)
        .set(req.body)
        .where(eq(userEmotions.id, emotionId))
        .returning();
      
      res.json(updatedEmotion);
    } catch (error) {
      console.error('Error updating user emotion:', error);
      res.status(500).json({ message: 'Failed to update user emotion' });
    }
  });
  
  // Delete a user emotion
  app.delete('/api/user-emotions/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const emotionId = parseInt(req.params.id);
      
      // Check if user emotion exists and belongs to user
      const [existingEmotion] = await db
        .select()
        .from(userEmotions)
        .where(
          and(
            eq(userEmotions.id, emotionId),
            eq(userEmotions.userId, userId)
          )
        );
      
      if (!existingEmotion) {
        return res.status(404).json({ message: 'User emotion not found' });
      }
      
      // Delete the user emotion
      await db
        .delete(userEmotions)
        .where(eq(userEmotions.id, emotionId));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting user emotion:', error);
      res.status(500).json({ message: 'Failed to delete user emotion' });
    }
  });
}