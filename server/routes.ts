import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHabitSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all habits
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getHabits();
      res.json(habits);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get a specific habit
  app.get("/api/habits/:id", async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      if (isNaN(habitId)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }

      const habit = await storage.getHabit(habitId);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }

      res.json(habit);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a new habit
  app.post("/api/habits", async (req, res) => {
    try {
      const habitData = insertHabitSchema.parse(req.body);
      const newHabit = await storage.createHabit(habitData);
      res.status(201).json(newHabit);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
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

  const httpServer = createServer(app);
  return httpServer;
}
