import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function calculateStreak(completionRecords: { date: string; completed: boolean }[]): number {
  if (!completionRecords || completionRecords.length === 0) return 0;
  
  const sortedRecords = [...completionRecords]
    .filter(record => record.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (sortedRecords.length === 0) return 0;
  
  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const mostRecentDate = new Date(sortedRecords[0].date);
  mostRecentDate.setHours(0, 0, 0, 0);
  
  // If the most recent completion is not today or yesterday, streak is broken
  const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) return 0;
  
  // Count consecutive days
  for (let i = 0; i < sortedRecords.length - 1; i++) {
    const currentDate = new Date(sortedRecords[i].date);
    const nextDate = new Date(sortedRecords[i + 1].date);
    
    currentDate.setHours(0, 0, 0, 0);
    nextDate.setHours(0, 0, 0, 0);
    
    const diffTime = currentDate.getTime() - nextDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
