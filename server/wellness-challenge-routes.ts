/**
 * API routes for the wellness challenge feature
 */
import { Express, Request, Response, NextFunction } from 'express';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from './db';
import { storage } from './storage';
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
      
      const challenges = await storage.getWellnessChallenges(userId);
      
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
      
      const challenges = await storage.getWellnessChallengesByStatus(status);
      
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
      
      const challenges = await storage.getWellnessChallengesByType(type);
      
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
      
      // Get the challenge with goals and progress
      const challenge = await storage.getWellnessChallenge(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Verify that the challenge belongs to the user
      if (challenge.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to access this challenge' });
      }
      
      // Use the challenge as the response
      const response = challenge;
      
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
      
      // Create the challenge using the storage interface
      const challenge = await storage.createWellnessChallenge(parsedBody.data);
      
      res.status(201).json(challenge);
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
      
      // Update the challenge using the storage interface
      const updatedChallenge = await storage.updateWellnessChallenge(challengeId, {
        ...req.body,
        updatedAt: new Date(),
      });
      
      res.json(updatedChallenge);
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
      
      // Delete the challenge and all associated data
      const success = await storage.deleteWellnessChallenge(challengeId);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ message: 'Failed to delete challenge' });
      }
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
      
      // Update the challenge status using the storage interface
      const updatedChallenge = await storage.updateWellnessChallengeStatus(challengeId, status);
      
      res.json(updatedChallenge);
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
      
      // Create the goal using the storage interface
      const goal = await storage.createWellnessChallengeGoal(parsedBody.data);
      
      res.status(201).json(goal);
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
      
      // Get the goals using the storage interface
      const goals = await storage.getWellnessChallengeGoals(parsedChallengeId);
      
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
      
      // Use the storage interface to record progress
      // This will handle checking if progress exists and either updating or creating it
      const progress = await storage.recordWellnessChallengeProgress(parsedBody.data);
      
      res.status(201).json(progress);
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
      
      // Get the progress entries using the storage interface
      const progress = await storage.getWellnessChallengeProgress(parsedChallengeId);
      
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
      
      // Get the progress entries for a specific date
      // Note: The storage interface doesn't have a specific method for date ranges yet,
      // but we can use the getWellnessChallengeProgressForDate method and filter in-memory
      // or extend the storage interface in the future
      const progress = await storage.getWellnessChallengeProgress(parsedChallengeId);
      
      // Filter by date range client-side (until we add a dedicated method to the storage interface)
      const filteredProgress = progress.filter(entry => {
        return entry.date >= (from as string) && entry.date <= (to as string);
      });
      
      res.json(filteredProgress);
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
      
      // Get challenge summary using the storage interface
      const summary = await storage.getChallengeSummary(parsedUserId);
      
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
      
      // Get streak information using the storage interface
      const streak = await storage.getChallengeStreak(challengeId);
      
      res.json(streak);
    } catch (error) {
      console.error('Error getting streak information:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}