/**
 * Routes for Therapist API
 * Implements RBAC for therapist-specific endpoints
 */
import { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { 
  insertTherapistClientSchema, 
  insertTherapistNoteSchema,
  insertTreatmentPlanSchema, 
  userRoleEnum
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Define the authenticated request type with user role
type AuthRequest = Request & {
  user?: {
    id: number;
    username: string;
    role?: "client" | "therapist" | "admin";
  }
}

/**
 * Middleware to check if user is authenticated
 */
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

/**
 * Middleware to check if user is a therapist
 */
function isTherapist(req: AuthRequest, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user || (user.role !== 'therapist' && user.role !== 'admin')) {
    return res.status(403).json({ message: "Forbidden: Therapist access required" });
  }
  next();
}

/**
 * Register therapist routes with Express application
 */
export function registerTherapistRoutes(app: Express) {
  // Therapist-Client relationship routes
  
  // Get all clients for the therapist
  app.get('/api/therapist/clients', isAuthenticated, isTherapist, async (req: AuthRequest, res: Response) => {
    try {
      const therapistId = req.user!.id;
      const clients = await req.app.locals.storage.getTherapistClients(therapistId);
      res.json(clients);
    } catch (error) {
      console.error('Error fetching therapist clients:', error);
      res.status(500).json({ message: 'Error fetching therapist clients' });
    }
  });
  
  // Get a specific client by ID
  app.get('/api/therapist/clients/:clientId', isAuthenticated, isTherapist, async (req: AuthRequest, res: Response) => {
    try {
      const therapistId = req.user!.id;
      const clientId = parseInt(req.params.clientId);
      
      // First, check if therapist is authorized for this client
      const isAuthorized = await req.app.locals.storage.isTherapistForClient(therapistId, clientId);
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Forbidden: This client is not assigned to you' });
      }
      
      const client = await req.app.locals.storage.getUser(clientId);
      
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      
      // Don't expose password
      const { password, ...clientWithoutPassword } = client;
      
      res.json(clientWithoutPassword);
    } catch (error) {
      console.error('Error fetching client:', error);
      res.status(500).json({ message: 'Error fetching client' });
    }
  });
  
  // Search for clients by username
  app.get('/api/therapist/clients/search', isAuthenticated, isTherapist, async (req: AuthRequest, res: Response) => {
    try {
      const query = req.query.query as string;
      
      if (!query || query.length < 2) {
        return res.status(400).json({ message: 'Query must be at least 2 characters' });
      }
      
      // Search for clients with role 'client'
      const clients = await req.app.locals.db.query.users.findMany({
        where: (users, { like, eq }) => and(
          like(users.username, `%${query}%`),
          eq(users.role, 'client')
        ),
        // Limit results and exclude password
        columns: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true
        }
      });
      
      res.json(clients);
    } catch (error) {
      console.error('Error searching clients:', error);
      res.status(500).json({ message: 'Error searching clients' });
    }
  });
  
  // Assign a client to the therapist
  app.post('/api/therapist/clients', isAuthenticated, isTherapist, async (req: AuthRequest, res: Response) => {
    try {
      const therapistId = req.user!.id;
      
      // Validate request
      const { clientUsername, startDate, notes } = req.body;
      
      if (!clientUsername) {
        return res.status(400).json({ message: 'Client username is required' });
      }
      
      // Find the client by username
      const client = await req.app.locals.storage.getUserByUsername(clientUsername);
      
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      
      // Check if client has role 'client'
      if (client.role !== 'client') {
        return res.status(400).json({ message: 'User is not a client' });
      }
      
      // Check if the client is already assigned to this therapist
      const isAlreadyAssigned = await req.app.locals.storage.isTherapistForClient(therapistId, client.id);
      
      if (isAlreadyAssigned) {
        return res.status(400).json({ message: 'Client is already assigned to you' });
      }
      
      // Create the therapist-client relationship
      const data = {
        therapistId,
        clientId: client.id,
        startDate: startDate || new Date().toISOString().split('T')[0],
        notes
      };
      
      const relationship = await req.app.locals.storage.assignClientToTherapist(
        therapistId, 
        client.id, 
        data
      );
      
      res.status(201).json(relationship);
    } catch (error) {
      console.error('Error assigning client to therapist:', error);
      res.status(500).json({ message: 'Error assigning client to therapist' });
    }
  });
  
  // Update a therapist-client relationship
  app.put('/api/therapist/clients/:id', isAuthenticated, isTherapist, async (req: AuthRequest, res: Response) => {
    try {
      const therapistId = req.user!.id;
      const relationshipId = parseInt(req.params.id);
      
      // Get the relationship
      const relationship = await req.app.locals.db.query.therapistClients.findFirst({
        where: (tc, { eq, and }) => and(
          eq(tc.id, relationshipId),
          eq(tc.therapistId, therapistId)
        )
      });
      
      if (!relationship) {
        return res.status(404).json({ message: 'Relationship not found' });
      }
      
      // Update the relationship
      const updates = {
        status: req.body.status,
        endDate: req.body.endDate,
        notes: req.body.notes
      };
      
      const updatedRelationship = await req.app.locals.storage.updateClientTherapistRelationship(
        relationshipId, 
        updates
      );
      
      res.json(updatedRelationship);
    } catch (error) {
      console.error('Error updating client relationship:', error);
      res.status(500).json({ message: 'Error updating client relationship' });
    }
  });
  
  // Remove a client from the therapist
  app.delete('/api/therapist/clients/:clientId', isAuthenticated, isTherapist, async (req: AuthRequest, res: Response) => {
    try {
      const therapistId = req.user!.id;
      const clientId = parseInt(req.params.clientId);
      
      // Check if the client is assigned to this therapist
      const isAssigned = await req.app.locals.storage.isTherapistForClient(therapistId, clientId);
      
      if (!isAssigned) {
        return res.status(404).json({ message: 'Client is not assigned to you' });
      }
      
      // Remove the client from the therapist
      await req.app.locals.storage.removeClientFromTherapist(therapistId, clientId);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing client from therapist:', error);
      res.status(500).json({ message: 'Error removing client from therapist' });
    }
  });
  
  // Therapist Notes routes
  
  // Get all notes for a client
  app.get('/api/therapist/clients/:clientId/notes', isAuthenticated, isTherapist, async (req: AuthRequest, res: Response) => {
    try {
      const therapistId = req.user!.id;
      const clientId = parseInt(req.params.clientId);
      
      // Check if the client is assigned to this therapist
      const isAuthorized = await req.app.locals.storage.isTherapistForClient(therapistId, clientId);
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Forbidden: This client is not assigned to you' });
      }
      
      const notes = await req.app.locals.storage.getTherapistNotes(therapistId, clientId);
      res.json(notes);
    } catch (error) {
      console.error('Error fetching therapist notes:', error);
      res.status(500).json({ message: 'Error fetching therapist notes' });
    }
  });
  
  // Get a specific note by ID
  app.get('/api/therapist/notes/:id', isAuthenticated, isTherapist, async (req: AuthRequest, res: Response) => {
    try {
      const therapistId = req.user!.id;
      const noteId = parseInt(req.params.id);
      
      const note = await req.app.locals.storage.getTherapistNoteById(noteId);
      
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      // Check if the note belongs to this therapist
      if (note.therapistId !== therapistId) {
        return res.status(403).json({ message: 'Forbidden: This note does not belong to you' });
      }
      
      res.json(note);
    } catch (error) {
      console.error('Error fetching therapist note:', error);
      res.status(500).json({ message: 'Error fetching therapist note' });
    }
  });
  
  // Create a new note
  app.post('/api/therapist/notes', isAuthenticated, isTherapist, async (req: AuthRequest, res: Response) => {
    try {
      const therapistId = req.user!.id;
      const { clientId, sessionDate, content, mood, progress, goalCompletion, isPrivate } = req.body;
      
      if (!clientId || !sessionDate || !content) {
        return res.status(400).json({ message: 'Client ID, session date, and content are required' });
      }
      
      // Check if the client is assigned to this therapist
      const isAuthorized = await req.app.locals.storage.isTherapistForClient(therapistId, clientId);
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Forbidden: This client is not assigned to you' });
      }
      
      // Create the note
      const note = await req.app.locals.storage.createTherapistNote({
        therapistId,
        clientId,
        sessionDate,
        content,
        mood,
        progress,
        goalCompletion,
        isPrivate: isPrivate !== undefined ? isPrivate : true
      });
      
      res.status(201).json(note);
    } catch (error) {
      console.error('Error creating therapist note:', error);
      res.status(500).json({ message: 'Error creating therapist note' });
    }
  });
  
  // Update a note
  app.put('/api/therapist/notes/:id', isAuthenticated, isTherapist, async (req: AuthRequest, res: Response) => {
    try {
      const therapistId = req.user!.id;
      const noteId = parseInt(req.params.id);
      
      // Get the note
      const note = await req.app.locals.storage.getTherapistNoteById(noteId);
      
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      // Check if the note belongs to this therapist
      if (note.therapistId !== therapistId) {
        return res.status(403).json({ message: 'Forbidden: This note does not belong to you' });
      }
      
      // Update the note
      const updates = {
        content: req.body.content,
        mood: req.body.mood,
        progress: req.body.progress,
        goalCompletion: req.body.goalCompletion,
        isPrivate: req.body.isPrivate
      };
      
      const updatedNote = await req.app.locals.storage.updateTherapistNote(noteId, updates);
      
      res.json(updatedNote);
    } catch (error) {
      console.error('Error updating therapist note:', error);
      res.status(500).json({ message: 'Error updating therapist note' });
    }
  });
  
  // Delete a note
  app.delete('/api/therapist/notes/:id', isAuthenticated, isTherapist, async (req: AuthRequest, res: Response) => {
    try {
      const therapistId = req.user!.id;
      const noteId = parseInt(req.params.id);
      
      // Get the note
      const note = await req.app.locals.storage.getTherapistNoteById(noteId);
      
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      // Check if the note belongs to this therapist
      if (note.therapistId !== therapistId) {
        return res.status(403).json({ message: 'Forbidden: This note does not belong to you' });
      }
      
      // Delete the note
      await req.app.locals.storage.deleteTherapistNote(noteId);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting therapist note:', error);
      res.status(500).json({ message: 'Error deleting therapist note' });
    }
  });
  
  // Client Analytics routes
  
  // Get analytics data for a client
  app.get('/api/therapist/clients/:clientId/analytics', isAuthenticated, isTherapist, async (req: AuthRequest, res: Response) => {
    try {
      const therapistId = req.user!.id;
      const clientId = parseInt(req.params.clientId);
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      // Check if the client is assigned to this therapist
      const isAuthorized = await req.app.locals.storage.isTherapistForClient(therapistId, clientId);
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Forbidden: This client is not assigned to you' });
      }
      
      // Get analytics data
      const analytics = await req.app.locals.storage.getClientAnalytics(
        therapistId, 
        clientId,
        startDate,
        endDate
      );
      
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching client analytics:', error);
      res.status(500).json({ message: 'Error fetching client analytics' });
    }
  });
  
  // Get emotion analytics for a client
  app.get('/api/therapist/clients/:clientId/analytics/emotions', isAuthenticated, isTherapist, async (req: AuthRequest, res: Response) => {
    try {
      const therapistId = req.user!.id;
      const clientId = parseInt(req.params.clientId);
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      // Check if the client is assigned to this therapist
      const isAuthorized = await req.app.locals.storage.isTherapistForClient(therapistId, clientId);
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Forbidden: This client is not assigned to you' });
      }
      
      // Get emotion tracking entries for the client
      const entries = await req.app.locals.db.query.emotionTrackingEntries.findMany({
        where: (e, { eq, and, gte, lte }) => {
          const conditions = [eq(e.userId, clientId)];
          
          if (startDate) {
            conditions.push(gte(e.date, startDate));
          }
          
          if (endDate) {
            conditions.push(lte(e.date, endDate));
          }
          
          return and(...conditions);
        },
        orderBy: (e, { desc }) => [desc(e.date)]
      });
      
      // Process and group entries by date
      const entriesByDate: Record<string, any[]> = {};
      
      for (const entry of entries) {
        if (!entriesByDate[entry.date]) {
          entriesByDate[entry.date] = [];
        }
        entriesByDate[entry.date].push(entry);
      }
      
      // Calculate average intensity and format results
      const emotionTrends = Object.entries(entriesByDate).map(([date, dateEntries]) => {
        const totalIntensity = dateEntries.reduce((sum, entry) => sum + entry.intensity, 0);
        const averageIntensity = totalIntensity / dateEntries.length;
        
        return {
          date,
          emotions: dateEntries.map(entry => ({
            name: entry.emotionName,
            intensity: entry.intensity,
            categoryId: entry.categoryId
          })),
          averageIntensity
        };
      });
      
      // Sort by date
      emotionTrends.sort((a, b) => a.date.localeCompare(b.date));
      
      res.json({
        emotionTrends
      });
    } catch (error) {
      console.error('Error fetching client emotion analytics:', error);
      res.status(500).json({ message: 'Error fetching client emotion analytics' });
    }
  });
  
  // Get crisis analytics for a client
  app.get('/api/therapist/clients/:clientId/analytics/crisis', isAuthenticated, isTherapist, async (req: AuthRequest, res: Response) => {
    try {
      const therapistId = req.user!.id;
      const clientId = parseInt(req.params.clientId);
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      // Check if the client is assigned to this therapist
      const isAuthorized = await req.app.locals.storage.isTherapistForClient(therapistId, clientId);
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Forbidden: This client is not assigned to you' });
      }
      
      // Get crisis analytics
      const analytics = await req.app.locals.storage.getCrisisAnalytics(
        clientId,
        startDate,
        endDate
      );
      
      res.json({
        crisisEvents: {
          count: analytics.totalEvents,
          byType: analytics.byType,
          byIntensity: analytics.byIntensity,
          recentEvents: [], // Would be populated with recent events
          trend: 'stable' // Sample trend, would be calculated based on data
        }
      });
    } catch (error) {
      console.error('Error fetching client crisis analytics:', error);
      res.status(500).json({ message: 'Error fetching client crisis analytics' });
    }
  });
}