/**
 * API routes for the wellness challenge feature
 */
import { Express, Request, Response, NextFunction } from 'express';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  wellnessChallenges, 
  wellnessChallengeGoals, 
  wellnessChallengeProgress,
  insertWellnessChallengeSchema,
  insertWellnessChallengeGoalSchema,
  insertWellnessChallengeProgressSchema
} from '../shared/schema';

// Type for authenticated request
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
  return res.status(401).json({ error: 'You must be logged in to access this resource' });
}

export function registerWellnessChallengeRoutes(app: Express) {
  /**
   * Get all challenges for the current user
   */
  app.get('/api/wellness-challenges', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const challenges = await db.query.wellnessChallenges.findMany({
        where: eq(wellnessChallenges.userId, userId),
        orderBy: (challenges) => [challenges.createdAt],
      });
      
      res.json(challenges);
    } catch (error) {
      console.error('Error getting challenges:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Get challenges by status
   */
  app.get('/api/wellness-challenges/status/:status', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { status } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const challenges = await db.query.wellnessChallenges.findMany({
        where: and(
          eq(wellnessChallenges.userId, userId),
          eq(wellnessChallenges.status, status)
        ),
        orderBy: (challenges) => [challenges.createdAt],
      });
      
      res.json(challenges);
    } catch (error) {
      console.error('Error getting challenges by status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Get challenges by type
   */
  app.get('/api/wellness-challenges/type/:type', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { type } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const challenges = await db.query.wellnessChallenges.findMany({
        where: and(
          eq(wellnessChallenges.userId, userId),
          eq(wellnessChallenges.type, type)
        ),
        orderBy: (challenges) => [challenges.createdAt],
      });
      
      res.json(challenges);
    } catch (error) {
      console.error('Error getting challenges by type:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Get a challenge by ID with its goals and progress
   */
  app.get('/api/wellness-challenges/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const challengeId = parseInt(id, 10);
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
      
      // Get the challenge
      const challenge = await db.query.wellnessChallenges.findFirst({
        where: and(
          eq(wellnessChallenges.id, challengeId),
          eq(wellnessChallenges.userId, userId)
        ),
      });
      
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Get the goals
      const goals = await db.query.wellnessChallengeGoals.findMany({
        where: eq(wellnessChallengeGoals.challengeId, challengeId),
      });
      
      // Get the progress entries
      const progressEntries = await db.query.wellnessChallengeProgress.findMany({
        where: eq(wellnessChallengeProgress.challengeId, challengeId),
        orderBy: (progress) => [progress.date],
      });
      
      // Combine into a single response
      const response = {
        ...challenge,
        goals,
        progressEntries,
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error getting challenge details:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Create a new challenge
   */
  app.post('/api/wellness-challenges', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Validate request body using zod schema
      const parsedBody = insertWellnessChallengeSchema.safeParse({
        ...req.body,
        userId,
      });
      
      if (!parsedBody.success) {
        return res.status(400).json({ 
          message: 'Invalid challenge data', 
          errors: parsedBody.error.errors 
        });
      }
      
      // Insert the challenge
      const inserted = await db.insert(wellnessChallenges).values(parsedBody.data).returning();
      
      res.status(201).json(inserted[0]);
    } catch (error) {
      console.error('Error creating challenge:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Update a challenge
   */
  app.put('/api/wellness-challenges/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const challengeId = parseInt(id, 10);
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
      
      // Check if challenge exists and belongs to the user
      const existingChallenge = await db.query.wellnessChallenges.findFirst({
        where: and(
          eq(wellnessChallenges.id, challengeId),
          eq(wellnessChallenges.userId, userId)
        ),
      });
      
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Update the challenge
      const updatedChallenge = await db
        .update(wellnessChallenges)
        .set({
          ...req.body,
          updatedAt: new Date(),
        })
        .where(eq(wellnessChallenges.id, challengeId))
        .returning();
      
      res.json(updatedChallenge[0]);
    } catch (error) {
      console.error('Error updating challenge:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Delete a challenge
   */
  app.delete('/api/wellness-challenges/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const challengeId = parseInt(id, 10);
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
      
      // Check if challenge exists and belongs to the user
      const existingChallenge = await db.query.wellnessChallenges.findFirst({
        where: and(
          eq(wellnessChallenges.id, challengeId),
          eq(wellnessChallenges.userId, userId)
        ),
      });
      
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Delete associated progress entries
      await db
        .delete(wellnessChallengeProgress)
        .where(eq(wellnessChallengeProgress.challengeId, challengeId));
      
      // Delete associated goals
      await db
        .delete(wellnessChallengeGoals)
        .where(eq(wellnessChallengeGoals.challengeId, challengeId));
      
      // Delete the challenge
      await db
        .delete(wellnessChallenges)
        .where(eq(wellnessChallenges.id, challengeId));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting challenge:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Update challenge status
   */
  app.patch('/api/wellness-challenges/:id/status', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { status } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
      
      const challengeId = parseInt(id, 10);
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
      
      // Check if challenge exists and belongs to the user
      const existingChallenge = await db.query.wellnessChallenges.findFirst({
        where: and(
          eq(wellnessChallenges.id, challengeId),
          eq(wellnessChallenges.userId, userId)
        ),
      });
      
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Update the challenge status
      const updatedChallenge = await db
        .update(wellnessChallenges)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(wellnessChallenges.id, challengeId))
        .returning();
      
      res.json(updatedChallenge[0]);
    } catch (error) {
      console.error('Error updating challenge status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Create a new goal for a challenge
   */
  app.post('/api/wellness-challenges/goals', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const { challengeId } = req.body;
      if (!challengeId) {
        return res.status(400).json({ message: 'Challenge ID is required' });
      }
      
      // Check if challenge exists and belongs to the user
      const existingChallenge = await db.query.wellnessChallenges.findFirst({
        where: and(
          eq(wellnessChallenges.id, challengeId),
          eq(wellnessChallenges.userId, userId)
        ),
      });
      
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Validate request body using zod schema
      const parsedBody = insertWellnessChallengeGoalSchema.safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({ 
          message: 'Invalid goal data', 
          errors: parsedBody.error.errors 
        });
      }
      
      // Insert the goal
      const inserted = await db.insert(wellnessChallengeGoals).values(parsedBody.data).returning();
      
      res.status(201).json(inserted[0]);
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Get goals for a challenge
   */
  app.get('/api/wellness-challenges/:challengeId/goals', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { challengeId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const parsedChallengeId = parseInt(challengeId, 10);
      if (isNaN(parsedChallengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
      
      // Check if challenge exists and belongs to the user
      const existingChallenge = await db.query.wellnessChallenges.findFirst({
        where: and(
          eq(wellnessChallenges.id, parsedChallengeId),
          eq(wellnessChallenges.userId, userId)
        ),
      });
      
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Get the goals
      const goals = await db.query.wellnessChallengeGoals.findMany({
        where: eq(wellnessChallengeGoals.challengeId, parsedChallengeId),
      });
      
      res.json(goals);
    } catch (error) {
      console.error('Error getting goals:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Record progress for a challenge
   */
  app.post('/api/wellness-challenges/progress', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const { challengeId } = req.body;
      if (!challengeId) {
        return res.status(400).json({ message: 'Challenge ID is required' });
      }
      
      // Check if challenge exists and belongs to the user
      const existingChallenge = await db.query.wellnessChallenges.findFirst({
        where: and(
          eq(wellnessChallenges.id, challengeId),
          eq(wellnessChallenges.userId, userId)
        ),
      });
      
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Validate request body using zod schema
      const parsedBody = insertWellnessChallengeProgressSchema.safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({ 
          message: 'Invalid progress data', 
          errors: parsedBody.error.errors 
        });
      }
      
      // Check if progress entry for the same date already exists
      const existingProgress = await db.query.wellnessChallengeProgress.findFirst({
        where: and(
          eq(wellnessChallengeProgress.challengeId, challengeId),
          eq(wellnessChallengeProgress.date, parsedBody.data.date)
        ),
      });
      
      if (existingProgress) {
        // Update existing progress
        const updated = await db
          .update(wellnessChallengeProgress)
          .set({
            value: parsedBody.data.value,
            notes: parsedBody.data.notes,
            updatedAt: new Date(),
          })
          .where(eq(wellnessChallengeProgress.id, existingProgress.id))
          .returning();
        
        res.json(updated[0]);
      } else {
        // Insert new progress
        const inserted = await db.insert(wellnessChallengeProgress).values(parsedBody.data).returning();
        
        res.status(201).json(inserted[0]);
      }
    } catch (error) {
      console.error('Error recording progress:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Get progress entries for a challenge
   */
  app.get('/api/wellness-challenges/:challengeId/progress', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { challengeId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const parsedChallengeId = parseInt(challengeId, 10);
      if (isNaN(parsedChallengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
      
      // Check if challenge exists and belongs to the user
      const existingChallenge = await db.query.wellnessChallenges.findFirst({
        where: and(
          eq(wellnessChallenges.id, parsedChallengeId),
          eq(wellnessChallenges.userId, userId)
        ),
      });
      
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Get the progress entries
      const progress = await db.query.wellnessChallengeProgress.findMany({
        where: eq(wellnessChallengeProgress.challengeId, parsedChallengeId),
        orderBy: (progress) => [progress.date],
      });
      
      res.json(progress);
    } catch (error) {
      console.error('Error getting progress:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Get progress entries for a specific date range
   */
  app.get('/api/wellness-challenges/:challengeId/progress/range', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { challengeId } = req.params;
      const { from, to } = req.query;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const parsedChallengeId = parseInt(challengeId, 10);
      if (isNaN(parsedChallengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
      
      if (!from || !to) {
        return res.status(400).json({ message: 'From and to dates are required' });
      }
      
      // Check if challenge exists and belongs to the user
      const existingChallenge = await db.query.wellnessChallenges.findFirst({
        where: and(
          eq(wellnessChallenges.id, parsedChallengeId),
          eq(wellnessChallenges.userId, userId)
        ),
      });
      
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Get the progress entries for the date range
      const progress = await db.query.wellnessChallengeProgress.findMany({
        where: and(
          eq(wellnessChallengeProgress.challengeId, parsedChallengeId),
          gte(wellnessChallengeProgress.date, from as string),
          lte(wellnessChallengeProgress.date, to as string)
        ),
        orderBy: (progress) => [progress.date],
      });
      
      res.json(progress);
    } catch (error) {
      console.error('Error getting progress for date range:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Get challenge summary statistics
   */
  app.get('/api/wellness-challenges/summary/:userId', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const currentUserId = req.user?.id;
      const { userId } = req.params;
      
      if (!currentUserId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const parsedUserId = parseInt(userId, 10);
      if (isNaN(parsedUserId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      // Only allow users to see their own summary
      if (currentUserId !== parsedUserId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      // Get counts of challenges by status
      const totalChallenges = await db.query.wellnessChallenges.findMany({
        where: eq(wellnessChallenges.userId, parsedUserId),
      });
      
      const activeChallenges = totalChallenges.filter(c => c.status === 'active').length;
      const completedChallenges = totalChallenges.filter(c => c.status === 'completed').length;
      const abandonedChallenges = totalChallenges.filter(c => c.status === 'abandoned').length;
      
      // Calculate average completion rate
      let averageCompletionRate = 0;
      
      if (completedChallenges > 0) {
        averageCompletionRate = (completedChallenges / (completedChallenges + abandonedChallenges)) * 100;
      }
      
      const summary = {
        totalChallenges: totalChallenges.length,
        activeChallenges,
        completedChallenges,
        abandonedChallenges,
        averageCompletionRate,
      };
      
      res.json(summary);
    } catch (error) {
      console.error('Error getting challenge summary:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Get streak information for a challenge
   */
  app.get('/api/wellness-challenges/:id/streak', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const challengeId = parseInt(id, 10);
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
      
      // Check if challenge exists and belongs to the user
      const existingChallenge = await db.query.wellnessChallenges.findFirst({
        where: and(
          eq(wellnessChallenges.id, challengeId),
          eq(wellnessChallenges.userId, userId)
        ),
      });
      
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Get all progress entries for the challenge
      const progress = await db.query.wellnessChallengeProgress.findMany({
        where: eq(wellnessChallengeProgress.challengeId, challengeId),
        orderBy: (progress) => [progress.date],
      });
      
      // Calculate current streak
      let currentStreak = 0;
      let longestStreak = 0;
      
      if (progress.length > 0) {
        // Sort by date in descending order (newest first)
        const sortedProgress = [...progress].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // Calculate current streak (consecutive days with progress)
        const today = new Date();
        let lastDate = new Date(today);
        
        for (const entry of sortedProgress) {
          const entryDate = new Date(entry.date);
          const dayDiff = Math.floor((lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1 || 
             (dayDiff === 0 && 
              lastDate.toISOString().split('T')[0] === today.toISOString().split('T')[0])) {
            currentStreak++;
            lastDate = entryDate;
          } else {
            break;
          }
        }
        
        // Calculate longest streak
        let tempStreak = 1;
        
        // Sort by date in ascending order (oldest first)
        const chronologicalProgress = [...progress].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        for (let i = 1; i < chronologicalProgress.length; i++) {
          const prevDate = new Date(chronologicalProgress[i - 1].date);
          const currDate = new Date(chronologicalProgress[i].date);
          
          const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            if (tempStreak > longestStreak) {
              longestStreak = tempStreak;
            }
            tempStreak = 1;
          }
        }
        
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      }
      
      res.json({
        challengeId,
        currentStreak,
        longestStreak,
      });
    } catch (error) {
      console.error('Error getting streak information:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}