import React from "react";
import { Habit } from "@/lib/types";
import HabitCard from "./HabitCard";
import { AnimatePresence, motion } from "framer-motion";

interface HabitsListProps {
  habits: Habit[];
  onToggleHabit: (habitId: number, completed: boolean) => void;
  isLoading?: boolean;
}

const HabitsList: React.FC<HabitsListProps> = ({
  habits,
  onToggleHabit,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="rounded-[12px] bg-muted h-32 w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="rounded-full bg-muted p-3 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">No habits yet</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Create your first habit to start tracking your progress
        </p>
      </motion.div>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-medium">Your Habits</h2>
        <button className="text-sm text-primary font-medium">Edit</button>
      </div>

      <AnimatePresence>
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggleCompletion={onToggleHabit}
          />
        ))}
      </AnimatePresence>
    </section>
  );
};

export default HabitsList;
