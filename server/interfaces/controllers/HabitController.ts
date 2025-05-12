import { Request, Response } from "express";
import { CreateHabitCommand } from "../../../shared/application/habit/commands/CreateHabitCommand";
import { ToggleHabitCompletionCommand } from "../../../shared/application/habit/commands/ToggleHabitCompletionCommand";
import { GetHabitByIdQuery } from "../../../shared/application/habit/queries/GetHabitByIdQuery";
import { GetUserHabitsQuery } from "../../../shared/application/habit/queries/GetUserHabitsQuery";
import { CreateHabitCommandHandler } from "../../../shared/application/habit/commands/CreateHabitCommandHandler";
import { ToggleHabitCompletionCommandHandler } from "../../../shared/application/habit/commands/ToggleHabitCompletionCommandHandler";
import { GetHabitByIdQueryHandler } from "../../../shared/application/habit/queries/GetHabitByIdQueryHandler";
import { GetUserHabitsQueryHandler } from "../../../shared/application/habit/queries/GetUserHabitsQueryHandler";
import { DrizzleHabitRepository } from "../../infrastructure/repositories/DrizzleHabitRepository";
import { SimpleEventBus } from "../../infrastructure/event-bus/SimpleEventBus";
import { z } from "zod";
import { User as SelectUser } from "@shared/schema";

// Request with authenticated user (from auth middleware)
type AuthRequest = Request & {
  user?: SelectUser;
}

/**
 * Controller for all habit-related endpoints
 * Following Clean Architecture principles
 */
export class HabitController {
  private habitRepository: DrizzleHabitRepository;
  private eventBus: SimpleEventBus;
  
  // Command Handlers
  private createHabitCommandHandler: CreateHabitCommandHandler;
  private toggleHabitCompletionCommandHandler: ToggleHabitCompletionCommandHandler;
  
  // Query Handlers
  private getHabitByIdQueryHandler: GetHabitByIdQueryHandler;
  private getUserHabitsQueryHandler: GetUserHabitsQueryHandler;
  
  constructor() {
    // Initialize infrastructure
    this.habitRepository = new DrizzleHabitRepository();
    this.eventBus = new SimpleEventBus();
    
    // Initialize application services
    this.createHabitCommandHandler = new CreateHabitCommandHandler(
      this.habitRepository,
      this.eventBus
    );
    
    this.toggleHabitCompletionCommandHandler = new ToggleHabitCompletionCommandHandler(
      this.habitRepository,
      this.eventBus
    );
    
    this.getHabitByIdQueryHandler = new GetHabitByIdQueryHandler(
      this.habitRepository
    );
    
    this.getUserHabitsQueryHandler = new GetUserHabitsQueryHandler(
      this.habitRepository
    );
  }
  
  /**
   * Get all habits for a user
   */
  async getUserHabits(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      
      const query = GetUserHabitsQuery.create({ userId });
      const habits = await this.getUserHabitsQueryHandler.execute(query);
      
      res.status(200).json(habits);
    } catch (error) {
      console.error("Error getting user habits:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  }
  
  /**
   * Get a habit by ID
   */
  async getHabitById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const habitId = parseInt(req.params.id);
      if (isNaN(habitId)) {
        res.status(400).json({ message: "Invalid habit ID" });
        return;
      }
      
      const query = GetHabitByIdQuery.create({ habitId });
      const habit = await this.getHabitByIdQueryHandler.execute(query);
      
      if (!habit) {
        res.status(404).json({ message: "Habit not found" });
        return;
      }
      
      // Check if the habit belongs to the authenticated user
      if (habit.userId !== req.user?.id) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      
      res.status(200).json(habit);
    } catch (error) {
      console.error("Error getting habit by ID:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  }
  
  /**
   * Create a new habit
   */
  async createHabit(req: AuthRequest, res: Response): Promise<void> {
    try {
      console.log("POST /api/habits received with body:", req.body);
      
      const userId = req.user?.id;
      if (!userId) {
        console.log("Habit creation rejected: User not authenticated");
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      
      console.log("Creating habit for authenticated user:", userId);
      
      try {
        // Create command from request data
        const command = CreateHabitCommand.create({
          ...req.body,
          userId
        });
        
        console.log("Validated habit data:", command);
        
        // Execute command handler
        const newHabit = await this.createHabitCommandHandler.execute(command);
        
        console.log("Habit created successfully:", newHabit);
        res.status(201).json(newHabit);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          console.log("Validation error:", validationError.errors);
          res.status(400).json({ message: validationError.errors });
          return;
        }
        throw validationError;
      }
    } catch (error) {
      console.error("Error creating habit:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  }
  
  /**
   * Toggle habit completion for a specific date
   */
  async toggleHabitCompletion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const habitId = parseInt(req.params.id);
      if (isNaN(habitId)) {
        res.status(400).json({ message: "Invalid habit ID" });
        return;
      }
      
      const { date, completed } = req.body;
      if (!date || typeof completed !== "boolean") {
        res.status(400).json({ message: "Date and completed status are required" });
        return;
      }
      
      // Create command from request data
      const command = ToggleHabitCompletionCommand.create({
        habitId,
        date,
        completed
      });
      
      // Execute command handler
      const updatedHabit = await this.toggleHabitCompletionCommandHandler.execute(command);
      
      res.status(200).json(updatedHabit);
    } catch (error) {
      console.error("Error toggling habit completion:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  }
}