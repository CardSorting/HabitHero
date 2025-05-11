import React from "react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/lib/useHabits";
import { Bell, Moon, Smartphone, Trash2 } from "lucide-react";

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { clearAllHabits, clearHabitsInProgress } = useHabits();

  const handleResetHabits = async () => {
    if (window.confirm("Are you sure you want to reset all habits? This action cannot be undone.")) {
      try {
        await clearAllHabits();
        toast({
          title: "Success",
          description: "All habits have been reset",
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reset habits",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <Header title="Settings" />
      <motion.main 
        className="flex-1 px-6 py-6 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="rounded-[12px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-reminders" className="flex flex-col gap-1">
                  <span>Daily Reminders</span>
                  <span className="text-xs text-muted-foreground">Get notified about uncompleted habits</span>
                </Label>
                <Switch id="daily-reminders" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="streak-alerts" className="flex flex-col gap-1">
                  <span>Streak Alerts</span>
                  <span className="text-xs text-muted-foreground">Get notified about streak achievements</span>
                </Label>
                <Switch id="streak-alerts" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[12px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="flex flex-col gap-1">
                  <span>Dark Mode</span>
                  <span className="text-xs text-muted-foreground">Use dark theme</span>
                </Label>
                <Switch id="dark-mode" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="animations" className="flex flex-col gap-1">
                  <span>Animations</span>
                  <span className="text-xs text-muted-foreground">Enable animations and transitions</span>
                </Label>
                <Switch id="animations" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[12px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                <span>Danger Zone</span>
              </CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="destructive" 
                className="w-full rounded-[12px]"
                onClick={handleResetHabits}
              >
                Reset All Habits
              </Button>
              <p className="text-xs text-muted-foreground">
                This will permanently delete all your habits and progress. This action cannot be undone.
              </p>
            </CardContent>
          </Card>

          <div className="py-4 text-center text-xs text-muted-foreground">
            <p>Habit Tracker v1.0.0</p>
          </div>
        </motion.div>
      </motion.main>
    </>
  );
};

export default Settings;
