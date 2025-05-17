import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const onboardingScreens = [
  {
    title: "Welcome to GALX",
    description: "Your comprehensive mental health tracking app that helps you monitor emotions and build positive habits.",
    icon: "👋",
  },
  {
    title: "Track Your Emotions",
    description: "Log and visualize your emotions with intensity tracking to identify patterns and reduce ineffective reactions.",
    icon: "😌",
  },
  {
    title: "Build Positive Habits",
    description: "Create and maintain healthy daily habits with streak tracking and insightful progress analytics.",
    icon: "📈",
  },
  {
    title: "Therapy Integration",
    description: "Share insights with your therapist to improve session outcomes and track progress between appointments.",
    icon: "🧠",
  },
  {
    title: "DBT Skills Practice",
    description: "Use the digital DBT diary card to practice skills, track urges, and monitor emotional wellness daily.",
    icon: "🛠️",
  },
];

export default function OnboardingPage() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [, navigate] = useLocation();
  
  const handleNext = () => {
    if (currentScreen < onboardingScreens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      // Show options for client or therapist instead of navigating directly
      setShowUserTypeOptions(true);
    }
  };
  
  const handleSkip = () => {
    // Show options for client or therapist instead of navigating directly
    setShowUserTypeOptions(true);
  };
  
  const [showUserTypeOptions, setShowUserTypeOptions] = useState(false);
  
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
        {!showUserTypeOptions ? (
          <>
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
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <Card className="p-6 border shadow-md bg-background">
              <h2 className="text-xl font-semibold text-center mb-4">I am a...</h2>
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => navigate("/auth")}
                >
                  Client seeking therapy support
                </Button>
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => navigate("/therapist-auth")}
                >
                  Therapist providing treatment
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => setShowUserTypeOptions(false)}
                >
                  Go back
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}