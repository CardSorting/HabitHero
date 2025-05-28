/**
 * API routes for the wellness challenge feature
 */
import { Express, Request, Response, NextFunction } from 'express';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db, pool } from './db';
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
   * Get all available challenge templates with user enrollment status
   */
  app.get('/api/wellness-challenges', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Get all challenge templates with user enrollment info
      const result = await pool.query(`
        SELECT 
          t.id,
          t.title,
          t.description,
          t.type,
          t.frequency,
          t.target_value,
          t.difficulty_level,
          COALESCE(e.status, 'active') as status,
          e.start_date,
          e.end_date,
          e.created_at,
          e.updated_at
        FROM challenge_templates t
        LEFT JOIN user_challenge_enrollments e ON t.id = e.template_id AND e.user_id = $1
        ORDER BY t.type, t.title
      `, [userId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting challenges:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Get challenges by status for current user
   */
  app.get('/api/wellness-challenges/status/:status', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { status } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const challenges = await storage.getWellnessChallengesByStatus(status, userId);
      
      res.json(challenges);
    } catch (error) {
      console.error('Error getting challenges by status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Get challenges by type for current user
   */
  app.get('/api/wellness-challenges/type/:type', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { type } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Filter by user when getting by type
      const allChallenges = await storage.getWellnessChallengesByType(type);
      const userChallenges = allChallenges.filter(challenge => challenge.userId === userId);
      
      res.json(userChallenges);
    } catch (error) {
      console.error('Error getting challenges by type:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * Get a specific challenge by ID (with user authorization check)
   */
  app.get('/api/wellness-challenges/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const challengeId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
      
      const challenge = await storage.getWellnessChallenge(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Ensure user can only access their own challenges
      if (challenge.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(challenge);
    } catch (error) {
      console.error('Error getting challenge:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * Create a new challenge for the current user
   */
  app.post('/api/wellness-challenges', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Validate request body
      const challengeData = insertWellnessChallengeSchema.parse({
        ...req.body,
        userId // Ensure userId is set to current user
      });
      
      const challenge = await storage.createWellnessChallenge(challengeData);
      
      res.status(201).json(challenge);
    } catch (error) {
      console.error('Error creating challenge:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid challenge data', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * Update a challenge (with user authorization check)
   */
  app.put('/api/wellness-challenges/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const challengeId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
      
      // Check if challenge exists and belongs to user
      const existingChallenge = await storage.getWellnessChallenge(challengeId);
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      if (existingChallenge.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Don't allow changing userId
      const updateData = { ...req.body };
      delete updateData.userId;
      
      const challenge = await storage.updateWellnessChallenge(challengeId, updateData);
      
      res.json(challenge);
    } catch (error) {
      console.error('Error updating challenge:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * Delete a challenge (with user authorization check)
   */
  app.delete('/api/wellness-challenges/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const challengeId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
      
      // Check if challenge exists and belongs to user
      const existingChallenge = await storage.getWellnessChallenge(challengeId);
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      if (existingChallenge.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const success = await storage.deleteWellnessChallenge(challengeId);
      
      if (success) {
        res.json({ message: 'Challenge deleted successfully' });
      } else {
        res.status(500).json({ message: 'Failed to delete challenge' });
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * Update challenge status (with user authorization check)
   */
  app.patch('/api/wellness-challenges/:id/status', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const challengeId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
      
      if (!status || !['active', 'completed', 'paused', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      // Check if challenge exists and belongs to user
      const existingChallenge = await storage.getWellnessChallenge(challengeId);
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      if (existingChallenge.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const challenge = await storage.updateWellnessChallengeStatus(challengeId, status);
      
      res.json(challenge);
    } catch (error) {
      console.error('Error updating challenge status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * Get challenge goals for a specific challenge (with user authorization check)
   */
  app.get('/api/wellness-challenges/:id/goals', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const challengeId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
      
      // Check if challenge exists and belongs to user
      const existingChallenge = await storage.getWellnessChallenge(challengeId);
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      if (existingChallenge.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const goals = await storage.getWellnessChallengeGoals(challengeId);
      
      res.json(goals);
    } catch (error) {
      console.error('Error getting challenge goals:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * Record progress for a challenge (with user authorization check)
   */
  app.post('/api/wellness-challenges/:id/progress', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const challengeId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: 'Invalid challenge ID' });
      }
      
      // Check if challenge exists and belongs to user
      const existingChallenge = await storage.getWellnessChallenge(challengeId);
      if (!existingChallenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      if (existingChallenge.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Validate progress data
      const progressData = insertWellnessChallengeProgressSchema.parse({
        ...req.body,
        challengeId
      });
      
      const progress = await storage.recordWellnessChallengeProgress(progressData);
      
      res.status(201).json(progress);
    } catch (error) {
      console.error('Error recording progress:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid progress data', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * Get challenge summary for the current user
   */
  app.get('/api/wellness-challenges/summary', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const summary = await storage.getChallengeSummary(userId);
      
      res.json(summary);
    } catch (error) {
      console.error('Error getting challenge summary:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}