export interface DayRecord {
  date: string; // ISO string
  completed: boolean;
}

export interface Habit {
  id: number;
  name: string;
  description: string;
  frequency: string;
  reminder: string;
  streak: number;
  completionRecords: DayRecord[];
}

export type InsertHabit = Omit<Habit, "id" | "streak" | "completionRecords">;
