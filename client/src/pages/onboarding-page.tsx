import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const onboardingScreens = [
  {
    title: "Welcome to Habit Builder",
    description: "Your personal habit tracking app that helps you build positive daily habits and improve your wellbeing.",
    icon: "👋",
  },
  {
    title: "Track Your Habits",
    description: "Build consistency by tracking your daily habits and watching your progress grow over time.",
    icon: "📈",
  },
  {
    title: "Log Your Emotions",
    description: "Use the DBT diary card to monitor your emotional wellbeing and practice healthy coping skills.",
    icon: "😌",
  },
  {
    title: "Set Meaningful Goals",
    description: "Create daily goals that align with your values and track your progress towards achieving them.",
    icon: "🎯",
  },
];

export default function OnboardingPage() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [, navigate] = useLocation();
  
  const handleNext = () => {
    if (currentScreen < onboardingScreens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      navigate("/auth");
    }
  };
  
  const handleSkip = () => {
    navigate("/auth");
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Progress indicator */}
        <div className="w-full max-w-xs mb-8 flex justify-center space-x-2">
          {onboardingScreens.map((_, index) => (
            <div 
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentScreen 
                  ? "w-8 bg-primary" 
                  : index < currentScreen 
                    ? "w-4 bg-primary/60" 
                    : "w-4 bg-primary/20"
              }`}
            />
          ))}
        </div>
        
        {/* Content */}
        <motion.div 
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          <Card className="p-8 border-none shadow-lg bg-card/95 backdrop-blur">
            <div className="flex flex-col items-center text-center">
              <div className="text-6xl mb-6">
                {onboardingScreens[currentScreen].icon}
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                {onboardingScreens[currentScreen].title}
              </h1>
              <p className="text-muted-foreground mb-8">
                {onboardingScreens[currentScreen].description}
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
      
      {/* Actions */}
      <div className="p-6 flex flex-col gap-2">
        <Button 
          size="lg" 
          className="w-full"
          onClick={handleNext}
        >
          {currentScreen < onboardingScreens.length - 1 ? "Next" : "Get Started"}
        </Button>
        
        {currentScreen < onboardingScreens.length - 1 && (
          <Button 
            variant="ghost" 
            size="lg" 
            className="w-full"
            onClick={handleSkip}
          >
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}