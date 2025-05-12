import { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertHabitSchema, User as SelectUser } from "@shared/schema";
import { getTherapeuticResponse, getCopingStrategy, analyzeDailyReflection } from "./anthropicService";
import { HabitController } from "./interfaces/controllers/HabitController";
import { setupAuth } from "./auth";

// Reuse the AuthRequest type to match the existing User definition
type AuthRequest = Request & {
  user?: SelectUser;
}

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
}

export async function registerRoutes(app: Express): Promise<any> {
  const server = createServer(app);
  
  // Setup authentication routes and middleware
  setupAuth(app);
  
  // Initialize the habit controller
  const habitController = new HabitController();
  
  // Get authenticated user
  app.get("/api/user", (req: AuthRequest, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  // Get all habits for a user
  app.get("/api/habits", isAuthenticated, (req: AuthRequest, res) => {
    habitController.getUserHabits(req, res);
  });
  
  // Get a habit by ID
  app.get("/api/habits/:id", isAuthenticated, (req: AuthRequest, res) => {
    habitController.getHabitById(req, res);
  });
  
  // Create a new habit
  app.post("/api/habits", isAuthenticated, (req: AuthRequest, res) => {
    habitController.createHabit(req, res);
  });
  
  // Toggle habit completion for a specific date
  app.post("/api/habits/:id/toggle", isAuthenticated, (req: AuthRequest, res) => {
    habitController.toggleHabitCompletion(req, res);
  });
  
  // Delete a habit
  app.delete("/api/habits/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const habitId = parseInt(req.params.id);
      if (isNaN(habitId)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }

      const deleted = await storage.deleteHabit(habitId);
      if (!deleted) {
        return res.status(404).json({ message: "Habit not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Clear all habits (for testing)
  app.delete("/api/habits", isAuthenticated, async (req, res) => {
    try {
      await storage.clearAllHabits();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Clear habit completions for a specific date (for testing)
  app.delete("/api/completions", isAuthenticated, async (req, res) => {
    try {
      const { date } = req.query;
      if (!date || typeof date !== "string") {
        return res.status(400).json({ message: "Date is required" });
      }
      
      await storage.clearHabitCompletions(date);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get daily goals for a specific date
  app.get("/api/daily-goals/:date", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const date = req.params.date;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const dailyGoal = await storage.getDailyGoal(date, userId);
      res.json(dailyGoal || { date, userId });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Save daily goals for a specific date
  app.post("/api/daily-goals/:date", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const date = req.params.date;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const dailyGoal = await storage.saveDailyGoal(date, userId, req.body);
      res.json(dailyGoal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get DBT sleep data for a specific date
  app.get("/api/dbt/sleep/:date", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const date = req.params.date;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const sleepData = await storage.getDbtSleepData(date, userId);
      res.json(sleepData || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Save DBT sleep data for a specific date
  app.post("/api/dbt/sleep/:date", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const date = req.params.date;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const sleepData = await storage.saveDbtSleepData(date, userId, req.body);
      res.json(sleepData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get DBT emotions for a specific date
  app.get("/api/dbt/emotions/:date", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const date = req.params.date;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const emotions = await storage.getDbtEmotionsForDate(date, userId);
      res.json(emotions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Save DBT emotions for a specific date
  app.post("/api/dbt/emotions/:date", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const date = req.params.date;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { emotion, intensity } = req.body;
      if (!emotion || !intensity) {
        return res.status(400).json({ message: "Emotion and intensity are required" });
      }
      
      const emotionData = await storage.saveDbtEmotion(date, userId, emotion, intensity || "");
      res.json(emotionData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get DBT urges for a specific date
  app.get("/api/dbt/urges/:date", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const date = req.params.date;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const urges = await storage.getDbtUrgesForDate(date, userId);
      res.json(urges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Save DBT urges for a specific date
  app.post("/api/dbt/urges/:date", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const date = req.params.date;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { urgeType, level, action } = req.body;
      if (!urgeType || !level) {
        return res.status(400).json({ message: "Urge type and level are required" });
      }
      
      const urgeData = await storage.saveDbtUrge(date, userId, urgeType, level, action || "");
      res.json(urgeData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get DBT skills for a specific date
  app.get("/api/dbt/skills/:date", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const date = req.params.date;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const skills = await storage.getDbtSkillsForDate(date, userId);
      res.json(skills);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Toggle DBT skill for a specific date
  app.post("/api/dbt/skills/:date", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const date = req.params.date;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { category, skill, used } = req.body;
      if (!category || !skill || typeof used !== "boolean") {
        return res.status(400).json({ message: "Category, skill, and used status are required" });
      }
      
      const skillData = await storage.toggleDbtSkill(date, userId, category, skill, used);
      res.json(skillData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get DBT event for a specific date
  app.get("/api/dbt/events/:date", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const date = req.params.date;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const event = await storage.getDbtEventForDate(date, userId);
      res.json(event || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Save DBT event for a specific date
  app.post("/api/dbt/events/:date", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const date = req.params.date;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { eventDescription } = req.body;
      if (!eventDescription) {
        return res.status(400).json({ message: "Event description is required" });
      }
      
      const eventData = await storage.saveDbtEvent(date, userId, eventDescription);
      res.json(eventData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a therapeutic chat endpoint using Anthropic
  app.post("/api/therapy/chat", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const { message, history } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const response = await getTherapeuticResponse(message, history || []);
      res.json({ response });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get coping strategies for emotions
  app.post("/api/therapy/coping-strategy", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const { emotion, intensity } = req.body;
      
      if (!emotion || !intensity) {
        return res.status(400).json({ message: "Emotion and intensity are required" });
      }
      
      const strategy = await getCopingStrategy(emotion, intensity);
      res.json({ strategy });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get analysis of daily reflection
  app.post("/api/therapy/analyze-reflection", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const { 
        todayGoal, 
        todayHighlight, 
        tomorrowGoal, 
        gratitude,
        dbtSkillUsed 
      } = req.body;
      
      if (!todayGoal || !todayHighlight || !tomorrowGoal || !gratitude) {
        return res.status(400).json({ message: "All reflection fields are required" });
      }
      
      const analysis = await analyzeDailyReflection(
        todayGoal,
        todayHighlight,
        tomorrowGoal,
        gratitude,
        dbtSkillUsed || ""
      );
      
      res.json({ analysis });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get weekly habit insights
  app.get("/api/habits/insights/:habitId", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const habitId = parseInt(req.params.habitId);
      if (isNaN(habitId)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }
      
      const habit = await storage.getHabit(habitId);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      // Generate some basic insights
      const completions = habit.completionRecords;
      const totalDays = completions.length;
      const completedDays = completions.filter(c => c.completed).length;
      const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
      
      // Get the longest streak
      const longestStreak = habit.streak;
      
      // Determine if this is the best or worst habit
      const bestHabit = completionRate > 80;
      const worstHabit = completionRate < 30;
      
      // Generate performance rating
      let habitPerformance;
      if (completionRate > 80) habitPerformance = "excellent";
      else if (completionRate > 60) habitPerformance = "good";
      else if (completionRate > 40) habitPerformance = "average";
      else if (completionRate > 20) habitPerformance = "poor";
      else habitPerformance = "very poor";
      
      res.json({
        habitId,
        name: habit.name,
        totalDays,
        completedDays,
        completionRate: Math.round(completionRate * 10) / 10,
        longestStreak,
        bestHabit,
        worstHabit,
        habitPerformance
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return server;
}