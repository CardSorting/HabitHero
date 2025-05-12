import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PageTransition } from "@/components/page-transition";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Heart, 
  Brain, 
  BookOpen, 
  Activity,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

/**
 * Page to browse challenges within a specific category
 */
const WellnessChallengeCategory: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/wellness-challenges/categories/:category");
  const category = params?.category || "";
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  
  // Format the category name for display
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
  
  // Icon and style mapping based on category
  const getCategoryStyles = () => {
    switch (category) {
      case "emotions":
        return { 
          icon: <Heart className="h-6 w-6 text-red-500" />, 
          color: "bg-red-100",
          textColor: "text-red-500",
          borderColor: "border-red-400" 
        };
      case "meditation":
        return { 
          icon: <Brain className="h-6 w-6 text-blue-500" />, 
          color: "bg-blue-100",
          textColor: "text-blue-500",
          borderColor: "border-blue-400" 
        };
      case "journaling":
        return { 
          icon: <BookOpen className="h-6 w-6 text-green-500" />, 
          color: "bg-green-100",
          textColor: "text-green-500",
          borderColor: "border-blue-400" 
        };
      case "activity":
        return { 
          icon: <Activity className="h-6 w-6 text-orange-500" />, 
          color: "bg-orange-100",
          textColor: "text-orange-500",
          borderColor: "border-orange-400" 
        };
      default:
        return { 
          icon: <Heart className="h-6 w-6 text-gray-500" />, 
          color: "bg-gray-100",
          textColor: "text-gray-500",
          borderColor: "border-gray-400" 
        };
    }
  };
  
  const categoryStyles = getCategoryStyles();
  
  // Get challenges for the category
  const getChallenges = () => {
    switch (category) {
      case "emotions":
        return [
          {
            id: 1,
            title: "Daily Gratitude Practice",
            description: "Write down three things you are grateful for each day to build a positive mindset",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 3,
            active: false
          },
          {
            id: 2,
            title: "Emotion Tracking",
            description: "Record your emotions throughout the day and identify patterns in your mood",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "2 minutes",
            target: 5,
            active: true
          }
        ];
      case "meditation":
        return [
          {
            id: 3,
            title: "Morning Mindfulness",
            description: "Start your day with 10 minutes of mindful breathing to set a calm intention",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 4,
            title: "Breath Awareness",
            description: "Practice focusing on your breath for 5 minutes to reduce stress and anxiety",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 5,
            active: true
          }
        ];
      case "journaling":
        return [
          {
            id: 5,
            title: "Evening Reflection",
            description: "Write about your day, focusing on what went well and what you learned",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 6,
            title: "Thought Reframing",
            description: "Identify negative thoughts and practice reframing them in a more balanced way",
            frequency: "Daily",
            difficulty: "Hard",
            duration: "15 minutes",
            target: 3,
            active: false
          }
        ];
      case "activity":
        return [
          {
            id: 7,
            title: "Daily Movement",
            description: "Engage in 30 minutes of physical activity to boost mood and energy",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 30,
            active: true
          },
          {
            id: 8,
            title: "Hydration Habit",
            description: "Drink 8 glasses of water throughout the day to stay properly hydrated",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "All day",
            target: 8,
            active: false
          }
        ];
      default:
        return [];
    }
  };
  
  const challenges = getChallenges();
  
  const handleChallengeSelect = (challenge: any) => {
    if (challenge.active) {
      // If already active, go to the challenge details
      navigate(`/wellness-challenges/${challenge.id}`);
    } else {
      // If not active, open the accept dialog
      setSelectedChallenge(challenge);
      setAcceptDialogOpen(true);
    }
  };
  
  const handleAcceptChallenge = () => {
    // Here we would make an API call to accept the challenge
    setAcceptDialogOpen(false);
    
    // Redirect to the challenge details page
    if (selectedChallenge) {
      navigate(`/wellness-challenges/${selectedChallenge.id}`);
    }
  };
  
  return (
    <PageTransition>
      <div className="pb-16">
        {/* Header with gradient background */}
        <div className={`${categoryStyles.color} pt-6 pb-8 px-4`}>
          <Button 
            variant="ghost" 
            className="flex items-center gap-1 mb-2 text-foreground" 
            onClick={() => navigate("/wellness-challenges")}
          >
            <ArrowLeft size={16} />
            Back to Categories
          </Button>
          
          <div className="flex items-center">
            <div className="bg-white/80 p-3 rounded-full mr-3">
              {categoryStyles.icon}
            </div>
            <h1 className="text-2xl font-bold">{displayCategory} Challenges</h1>
          </div>
        </div>
        
        {/* Challenge list */}
        <div className="p-4 space-y-5">
          {challenges.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No challenges available in this category</p>
            </div>
          ) : (
            challenges.map(challenge => (
              <Card 
                key={challenge.id} 
                className={`overflow-hidden cursor-pointer hover:border-primary transition-colors ${challenge.active ? `border-2 ${categoryStyles.borderColor}` : ""}`}
                onClick={() => handleChallengeSelect(challenge)}
              >
                <CardContent className="p-4 pt-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-1">
                        <h3 className="font-medium mr-2">{challenge.title}</h3>
                        {challenge.active && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">Active</div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>You are currently doing this challenge</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                      
                      <div className="flex flex-wrap gap-2 text-xs">
                        <div className="flex items-center bg-secondary/50 px-2 py-1 rounded-full">
                          <Clock className="h-3 w-3 mr-1" />
                          {challenge.duration}
                        </div>
                        <div className="bg-secondary/50 px-2 py-1 rounded-full">
                          {challenge.frequency}
                        </div>
                        <div className="bg-secondary/50 px-2 py-1 rounded-full">
                          {challenge.difficulty}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {/* Accept challenge dialog */}
        <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accept Challenge</DialogTitle>
              <DialogDescription>
                Are you ready to start this wellness challenge?
              </DialogDescription>
            </DialogHeader>
            
            {selectedChallenge && (
              <div className="py-4">
                <h3 className="font-medium text-lg">{selectedChallenge.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">{selectedChallenge.description}</p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-medium">{selectedChallenge.frequency}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Time required:</span>
                    <span className="font-medium">{selectedChallenge.duration}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <span className="font-medium">{selectedChallenge.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily target:</span>
                    <span className="font-medium">{selectedChallenge.target} per day</span>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex space-x-2 sm:space-x-0">
              <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAcceptChallenge}>Accept Challenge</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default WellnessChallengeCategory;