import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHabitSchema, 
  insertDailyGoalSchema,
  insertDbtSleepSchema,
  insertDbtEmotionSchema,
  insertDbtUrgeSchema,
  insertDbtSkillSchema,
  insertDbtEventSchema,
  insertUserSchema
} from "@shared/schema";
import { setupAuth } from "./auth";
import { z } from "zod";
import { getTherapeuticResponse, getCopingStrategy, analyzeDailyReflection } from "./anthropicService";

// Extend Request type with authenticated user
interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  }
}

// Middleware to check if user is authenticated
function isAuthenticated(req: AuthRequest, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and middleware
  setupAuth(app);
  // Get all habits
  app.get("/api/habits", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const habits = await storage.getHabits(userId);
      res.json(habits);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get a specific habit
  app.get("/api/habits/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const habitId = parseInt(req.params.id);
      if (isNaN(habitId)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }

      const habit = await storage.getHabit(habitId);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      // Ensure the habit belongs to the authenticated user
      if (habit.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(habit);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a new habit
  app.post("/api/habits", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      console.log("POST /api/habits received with body:", req.body);
      
      const userId = req.user?.id;
      if (!userId) {
        console.log("Habit creation rejected: User not authenticated");
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      console.log("Creating habit for authenticated user:", userId);
      
      try {
        const habitData = insertHabitSchema.parse({
          ...req.body,
          userId
        });
        
        console.log("Parsed habit data:", habitData);
        
        const newHabit = await storage.createHabit(habitData);
        console.log("Habit created successfully:", newHabit);
        
        res.status(201).json(newHabit);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          console.log("Validation error:", validationError.errors);
          return res.status(400).json({ message: validationError.errors });
        }
        throw validationError;
      }
    } catch (error: any) {
      console.error("Error creating habit:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Toggle habit completion for a specific date
  app.post("/api/habits/:id/toggle", async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      if (isNaN(habitId)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }

      const { date, completed } = req.body;
      if (!date || typeof completed !== "boolean") {
        return res.status(400).json({ message: "Date and completed status are required" });
      }

      const habit = await storage.toggleHabitCompletion(habitId, date, completed);
      res.json(habit);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update a habit
  app.patch("/api/habits/:id", async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      if (isNaN(habitId)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }

      const updatedHabit = await storage.updateHabit(habitId, req.body);
      res.json(updatedHabit);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete a habit
  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      if (isNaN(habitId)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }

      const deleted = await storage.deleteHabit(habitId);
      if (!deleted) {
        return res.status(404).json({ message: "Habit not found" });
      }

      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Clear all habits (for reset functionality)
  app.delete("/api/habits", async (req, res) => {
    try {
      await storage.clearAllHabits();
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reset habit statuses for a particular day
  app.post("/api/habits/reset", async (req, res) => {
    try {
      const { date } = req.body;
      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }

      await storage.clearHabitCompletions(date);
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get analytics data
  app.get("/api/analytics", async (req, res) => {
    try {
      const habits = await storage.getHabits();
      
      // Calculate overall completion rate
      const totalCompletions = habits.reduce((sum, habit) => {
        return sum + habit.completionRecords.filter(r => r.completed).length;
      }, 0);
      
      const totalPossible = habits.length * 30; // Assuming 30 days per month
      const completionRate = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;
      
      // Find best performing habit
      const habitPerformance = habits.map(habit => {
        const completions = habit.completionRecords.filter(r => r.completed).length;
        return {
          id: habit.id,
          name: habit.name,
          completionRate: completions / 30 * 100,
          streak: habit.streak
        };
      });
      
      const bestHabit = habitPerformance.length > 0 
        ? habitPerformance.reduce((prev, current) => 
            (prev.completionRate > current.completionRate) ? prev : current
          )
        : null;
      
      const worstHabit = habitPerformance.length > 0 
        ? habitPerformance.reduce((prev, current) => 
            (prev.completionRate < current.completionRate) ? prev : current
          )
        : null;
      
      // Calculate longest streak
      const longestStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
      
      res.json({
        totalHabits: habits.length,
        totalCompletions,
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

  // Daily Goals API Routes
  // Get a daily goal for a specific date
  app.get("/api/daily-goals/:date", async (req, res) => {
    try {
      const dateStr = req.params.date;
      const dailyGoal = await storage.getDailyGoal(dateStr);
      
      if (!dailyGoal) {
        return res.status(404).json({ message: "No daily goal found for this date" });
      }
      
      res.json(dailyGoal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Save a daily goal for a specific date
  app.post("/api/daily-goals/:date", async (req, res) => {
    try {
      const dateStr = req.params.date;
      const goalData = insertDailyGoalSchema.parse({
        ...req.body,
        date: dateStr
      });
      
      const savedGoal = await storage.saveDailyGoal(dateStr, {
        todayGoal: goalData.todayGoal,
        tomorrowGoal: goalData.tomorrowGoal,
        todayHighlight: goalData.todayHighlight,
        gratitude: goalData.gratitude,
        dbtSkillUsed: goalData.dbtSkillUsed
      });
      
      res.status(201).json(savedGoal);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // DBT Diary Card - Sleep API Routes
  // Get sleep data for a specific date
  app.get("/api/dbt/sleep/:date", async (req, res) => {
    try {
      const dateStr = req.params.date;
      const sleepData = await storage.getDbtSleepData(dateStr);
      
      if (!sleepData) {
        return res.json({});
      }
      
      res.json(sleepData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Save sleep data for a specific date
  app.post("/api/dbt/sleep/:date", async (req, res) => {
    try {
      const dateStr = req.params.date;
      const sleepData = insertDbtSleepSchema.parse({
        ...req.body,
        date: dateStr
      });
      
      const savedData = await storage.saveDbtSleepData(dateStr, {
        hoursSlept: sleepData.hoursSlept || "",
        troubleFalling: sleepData.troubleFalling || "",
        troubleStaying: sleepData.troubleStaying || "",
        troubleWaking: sleepData.troubleWaking || ""
      });
      
      res.json(savedData);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // DBT Diary Card - Emotions API Routes
  // Get emotions for a specific date
  app.get("/api/dbt/emotions/:date", async (req, res) => {
    try {
      const dateStr = req.params.date;
      const emotions = await storage.getDbtEmotionsForDate(dateStr);
      res.json(emotions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Save an emotion for a specific date
  app.post("/api/dbt/emotions/:date", async (req, res) => {
    try {
      const dateStr = req.params.date;
      const { emotion, intensity } = req.body;
      
      if (!emotion) {
        return res.status(400).json({ message: "Emotion name is required" });
      }
      
      const savedEmotion = await storage.saveDbtEmotion(dateStr, emotion, intensity || "");
      res.status(201).json(savedEmotion);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // DBT Diary Card - Urges API Routes
  // Get urges for a specific date
  app.get("/api/dbt/urges/:date", async (req, res) => {
    try {
      const dateStr = req.params.date;
      const urges = await storage.getDbtUrgesForDate(dateStr);
      res.json(urges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Save an urge for a specific date
  app.post("/api/dbt/urges/:date", async (req, res) => {
    try {
      const dateStr = req.params.date;
      const { urgeType, level, action } = req.body;
      
      if (!urgeType) {
        return res.status(400).json({ message: "Urge type is required" });
      }
      
      const savedUrge = await storage.saveDbtUrge(dateStr, urgeType, level || "", action || "");
      res.status(201).json(savedUrge);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // DBT Diary Card - Skills API Routes
  // Get skills for a specific date
  app.get("/api/dbt/skills/:date", async (req, res) => {
    try {
      const dateStr = req.params.date;
      const skills = await storage.getDbtSkillsForDate(dateStr);
      res.json(skills);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Toggle a skill for a specific date
  app.post("/api/dbt/skills/:date", async (req, res) => {
    try {
      const dateStr = req.params.date;
      const { category, skill, used } = req.body;
      
      if (!category || !skill) {
        return res.status(400).json({ message: "Category and skill name are required" });
      }
      
      const savedSkill = await storage.toggleDbtSkill(dateStr, category, skill, !!used);
      res.status(201).json(savedSkill);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // DBT Diary Card - Events API Routes
  // Get event for a specific date
  app.get("/api/dbt/events/:date", async (req, res) => {
    try {
      const dateStr = req.params.date;
      const event = await storage.getDbtEventForDate(dateStr);
      
      if (!event) {
        return res.json({});
      }
      
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Save an event for a specific date
  app.post("/api/dbt/events/:date", async (req, res) => {
    try {
      const dateStr = req.params.date;
      const { eventDescription } = req.body;
      
      if (!eventDescription) {
        return res.status(400).json({ message: "Event description is required" });
      }
      
      const savedEvent = await storage.saveDbtEvent(dateStr, eventDescription);
      res.status(201).json(savedEvent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Therapy Companion Routes
  
  // Get therapeutic response from Claude
  app.post("/api/therapy/chat", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { message, conversationHistory = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const response = await getTherapeuticResponse(message, conversationHistory);
      res.json({ response });
    } catch (error: any) {
      console.error("Error in therapy chat:", error);
      res.status(500).json({ message: "Failed to get therapeutic response" });
    }
  });

  // Get coping strategy for specific emotion
  app.post("/api/therapy/coping-strategy", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { emotion, intensity } = req.body;
      
      if (!emotion) {
        return res.status(400).json({ message: "Emotion is required" });
      }
      
      const copingStrategy = await getCopingStrategy(emotion, intensity || "5");
      res.json({ copingStrategy });
    } catch (error: any) {
      console.error("Error getting coping strategy:", error);
      res.status(500).json({ message: "Failed to get coping strategy" });
    }
  });

  // Analyze daily reflection
  app.post("/api/therapy/analyze-reflection", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { reflection } = req.body;
      
      if (!reflection || !reflection.todayGoal) {
        return res.status(400).json({ message: "Reflection data is required" });
      }
      
      const analysis = await analyzeDailyReflection(reflection);
      res.json({ analysis });
    } catch (error: any) {
      console.error("Error analyzing reflection:", error);
      res.status(500).json({ message: "Failed to analyze reflection" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
