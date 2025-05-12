import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import AddHabitModal from "@/components/AddHabitModal";
import HabitsList from "@/components/HabitsList";
import DailyProgressSummary from "@/components/DailyProgressSummary";
import FloatingActionButton from "@/components/FloatingActionButton";
import DailySummary from "@/components/DailySummary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import HabitDetailModal from "@/components/HabitDetailModal";
import DailyGoalTracker from "@/components/DailyGoalTracker";
import { Progress } from "@/components/ui/progress";
import { useHabitService } from "@/hooks/useHabitService";
import { Habit } from "@/lib/types";

/**
 * Today page component
 * Refactored to use the new habit services following Clean Architecture
 */
const Today: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showHabitDetail, setShowHabitDetail] = useState(false);
  
  // Use our new habit service hook
  const { 
    habits, 
    isLoadingHabits, 
    toggleHabit, 
    createHabit,
    refetchHabits
  } = useHabitService();
  
  const { toast } = useToast();

  const handleToggleHabit = async (habitId: number, completed: boolean) => {
    try {
      await toggleHabit(habitId, completed);
      
      if (completed) {
        toast({
          title: "Habit completed!",
          description: "Keep up the good work!",
          variant: "default",
          className: "bg-success text-white",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update habit status",
        variant: "destructive",
      });
    }
  };

  const handleAddHabit = async (data: any) => {
    try {
      console.log("Attempting to create habit with data:", data);
      
      await createHabit(data);
      
      toast({
        title: "Habit created",
        description: "Your new habit has been added",
        variant: "default",
        className: "bg-success text-white",
      });
      
      // Make sure the habits list is refreshed
      refetchHabits();
    } catch (error) {
      console.error("Error creating habit:", error);
      toast({
        title: "Error",
        description: `Failed to create habit: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };
  
  const handleHabitClick = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowHabitDetail(true);
  };
  
  const handleUpdateHabit = (habit: Habit) => {
    // Just close the modal for now
    setShowHabitDetail(false);
  };

  // Calculate completion stats
  const completedHabits = habits.filter(habit => 
    habit.completionRecords.some(record => 
      record.date === new Date().toISOString().split('T')[0] && record.completed
    )
  ).length;
  
  const totalHabits = habits.length;
  const completionPercentage = totalHabits > 0 
    ? Math.round((completedHabits / totalHabits) * 100) 
    : 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-primary">Today</h1>
        <Badge variant="outline" className="text-sm">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })}
        </Badge>
      </div>
      
      <DailyProgressSummary 
        completedHabits={completedHabits} 
        totalHabits={totalHabits} 
      />
      
      <Card className="mb-6 shadow-sm border-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Daily Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={completionPercentage} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground">
            {completedHabits} of {totalHabits} habits completed
          </p>
        </CardContent>
      </Card>
      
      <DailySummary />
      
      <div className="mt-6 mb-4">
        <h2 className="text-xl font-semibold text-foreground">Your Habits</h2>
        <p className="text-sm text-muted-foreground">Track your daily habits below</p>
      </div>
      
      <HabitsList 
        habits={habits}
        onToggleHabit={handleToggleHabit}
        isLoading={isLoadingHabits}
      />
      
      <div className="mt-8 mb-20">
        <DailyGoalTracker />
      </div>
      
      <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />
      
      <AddHabitModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAddHabit={handleAddHabit}
      />
      
      <HabitDetailModal
        habit={selectedHabit}
        open={showHabitDetail}
        onOpenChange={setShowHabitDetail}
        onEditHabit={handleUpdateHabit}
      />
    </div>
  );
};

export default Today;