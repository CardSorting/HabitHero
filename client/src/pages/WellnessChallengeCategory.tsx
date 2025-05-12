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
  Clock,
  Feather,
  Shield,
  Gauge,
  Users
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Format the category name for display
  const formatCategoryName = (categoryName: string) => {
    if (categoryName === 'distress_tolerance') return 'Distress Tolerance';
    if (categoryName === 'emotion_regulation') return 'Emotion Regulation';
    if (categoryName === 'interpersonal_effectiveness') return 'Interpersonal Effectiveness';
    return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  };
  
  const displayCategory = formatCategoryName(category);
  
  // Icon and style mapping based on category
  const getCategoryStyles = () => {
    switch (category.toLowerCase()) {
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
          borderColor: "border-green-400" 
        };
      case "activity":
        return { 
          icon: <Activity className="h-6 w-6 text-orange-500" />, 
          color: "bg-orange-100",
          textColor: "text-orange-500",
          borderColor: "border-orange-400" 
        };
      case "mindfulness":
        return { 
          icon: <Feather className="h-6 w-6 text-teal-500" />, 
          color: "bg-teal-100",
          textColor: "text-teal-500",
          borderColor: "border-teal-400" 
        };
      case "distress_tolerance":
        return { 
          icon: <Shield className="h-6 w-6 text-red-500" />, 
          color: "bg-red-100",
          textColor: "text-red-500",
          borderColor: "border-red-400" 
        };
      case "emotion_regulation":
        return { 
          icon: <Gauge className="h-6 w-6 text-purple-500" />, 
          color: "bg-purple-100",
          textColor: "text-purple-500",
          borderColor: "border-purple-400" 
        };
      case "interpersonal_effectiveness":
        return { 
          icon: <Users className="h-6 w-6 text-blue-500" />, 
          color: "bg-blue-100",
          textColor: "text-blue-500",
          borderColor: "border-blue-400" 
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
  
  // Fetch challenges from the API for the selected category
  const { data: apiChallenges = [], isLoading: isLoadingChallenges, error: challengesError } = useQuery({
    queryKey: [`/api/wellness-challenges/type/${category}`],
    enabled: !!category && !!user,
  });
  
  // Get the challenges to display
  const allChallenges = apiChallenges || [];
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentChallenges = allChallenges.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allChallenges.length / itemsPerPage);
  
  // Handle challenge selection
  const handleChallengeSelect = (challenge: any) => {
    setSelectedChallenge(challenge);
    setAcceptDialogOpen(true);
  };
  
  // Handle accepting a challenge
  const handleAcceptChallenge = async () => {
    if (!selectedChallenge) return;
    
    try {
      // Here you would update the challenge status using an API call
      // This is a placeholder for the actual implementation
      console.log(`Accepting challenge: ${selectedChallenge.id}`);
      
      setAcceptDialogOpen(false);
      // Optionally redirect to challenge details page
      navigate(`/wellness-challenges/${selectedChallenge.id}`);
    } catch (error) {
      console.error("Error accepting challenge:", error);
    }
  };
  
  // Return to challenges list
  const handleBackClick = () => {
    navigate("/wellness-challenges");
  };

  return (
    <PageTransition>
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Header section */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackClick} 
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className={`p-2 rounded-full ${categoryStyles.color} mr-3`}>
            {categoryStyles.icon}
          </div>
          <h1 className="text-2xl font-bold">{displayCategory} Challenges</h1>
        </div>
        
        {/* Filter and search (placeholder for future implementation) */}
        <div className="mb-6">
          {/* This would be where filters and search functionality could go */}
        </div>
        
        {/* Challenges list */}
        <div className="space-y-4">
          {isLoadingChallenges ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-gray-600">Loading challenges...</p>
            </div>
          ) : challengesError ? (
            <div className="text-center py-10">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <p className="text-lg font-semibold text-red-500">Failed to load challenges</p>
              <p className="text-gray-600">Please try again later or select a different category.</p>
            </div>
          ) : allChallenges.length === 0 ? (
            <div className="text-center py-10">
              <div className="p-3 rounded-full bg-gray-100 inline-block mb-2">
                <Heart className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-semibold">No challenges found</p>
              <p className="text-gray-600">There are no challenges in this category yet.</p>
            </div>
          ) : (
            currentChallenges.map((challenge) => (
              <Card 
                key={challenge.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer border-l-4 ${categoryStyles.borderColor}`}
                onClick={() => handleChallengeSelect(challenge)}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    {challenge.title}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`text-sm px-2 py-1 rounded-full ${challenge.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                            {challenge.status === 'active' ? (
                              <span className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Available
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {challenge.status === 'active' 
                            ? "You're currently working on this challenge" 
                            : "Click to start this challenge"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-gray-600 mb-3">{challenge.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      {challenge.frequency || "Daily"}
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                      {challenge.difficulty || "Medium"} difficulty
                    </span>
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                      {challenge.duration || "10 minutes"}
                    </span>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      Target: {challenge.targetValue || challenge.target || 1}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-2 flex justify-end">
                  <Button size="sm" variant="ghost" className={`${categoryStyles.textColor} flex items-center`}>
                    View Details <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
        
        {/* Pagination controls */}
        {!isLoadingChallenges && !challengesError && allChallenges.length > 0 && (
          <div className="flex justify-center mt-6 space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center px-3 text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
      
      {/* Challenge acceptance dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Challenge</DialogTitle>
            <DialogDescription>
              Are you ready to start this challenge? It will be added to your active challenges.
            </DialogDescription>
          </DialogHeader>
          
          {selectedChallenge && (
            <div className="py-4">
              <h3 className="font-semibold mb-2">{selectedChallenge.title}</h3>
              <p className="text-gray-600 mb-4">{selectedChallenge.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  {selectedChallenge.frequency || "Daily"}
                </span>
                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                  {selectedChallenge.difficulty || "Medium"} difficulty
                </span>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                  {selectedChallenge.duration || "10 minutes"}
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAcceptChallenge}>
              Accept Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default WellnessChallengeCategory;