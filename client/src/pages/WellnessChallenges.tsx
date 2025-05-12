import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Target,
  Heart,
  Brain,
  BookOpen,
  Activity,
  ArrowRight,
  Feather,
  Shield,
  Gauge,
  Users,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Mobile-first implementation of the Wellness Challenges feature
 */
// Interface for tracking abandoned challenges
interface AbandonedChallenge {
  id: string;
  timestamp: number;
}

const WellnessChallenges: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [abandonedChallenges, setAbandonedChallenges] = useState<string[]>([]);
  const [showingMore, setShowingMore] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Fetch active challenges from API
  const { data: activeChallenges = [], isLoading: isLoadingChallenges } =
    useQuery<any[]>({
      queryKey: ["/api/wellness-challenges/status/active"],
      enabled: !!user,
    });

  // Load abandoned challenges from localStorage
  useEffect(() => {
    const storedAbandoned = localStorage.getItem("abandonedChallenges");
    if (storedAbandoned) {
      try {
        const parsed: AbandonedChallenge[] = JSON.parse(storedAbandoned);
        // Only consider challenges abandoned in the last 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const validAbandoned = parsed
          .filter((challenge) => challenge.timestamp > thirtyDaysAgo)
          .map((challenge) => challenge.id);

        setAbandonedChallenges(validAbandoned);
      } catch (e) {
        console.error("Error parsing abandoned challenges", e);
        setAbandonedChallenges([]);
      }
    }
  }, []);

  // Filter challenges based on category selection
  const filteredChallenges = useMemo(() => {
    if (categoryFilter === "all") return activeChallenges;
    return activeChallenges.filter(
      (challenge: any) => challenge.type === categoryFilter,
    );
  }, [activeChallenges, categoryFilter]);

  // Limit displayed challenges based on showingMore state
  const displayedChallenges = useMemo(() => {
    if (showingMore) return filteredChallenges;
    return filteredChallenges.slice(0, 3);
  }, [filteredChallenges, showingMore]);

  // Categories of wellness challenges
  const challengeTypes = [
    {
      name: "emotions",
      displayName: "Emotions",
      icon: <Heart className="h-6 w-6 text-red-500" />,
      color: "bg-red-100",
    },
    {
      name: "meditation",
      displayName: "Meditation",
      icon: <Brain className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-100",
    },
    {
      name: "journaling",
      displayName: "Journaling",
      icon: <BookOpen className="h-6 w-6 text-green-500" />,
      color: "bg-green-100",
    },
    {
      name: "activity",
      displayName: "Activity",
      icon: <Activity className="h-6 w-6 text-orange-500" />,
      color: "bg-orange-100",
    },
    // New DBT categories
    {
      name: "mindfulness",
      displayName: "Mindfulness",
      icon: <Feather className="h-6 w-6 text-teal-500" />,
      color: "bg-teal-100",
    },
    {
      name: "distress_tolerance",
      displayName: "Distress Tolerance",
      icon: <Shield className="h-6 w-6 text-red-500" />,
      color: "bg-red-100",
    },
    {
      name: "emotion_regulation",
      displayName: "Emotion Regulation",
      icon: <Gauge className="h-6 w-6 text-purple-500" />,
      color: "bg-purple-100",
    },
    {
      name: "interpersonal_effectiveness",
      displayName: "Interpersonal",
      icon: <Users className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-100",
    },
  ];

  // Helper function to get challenge icon and styling based on type
  const getChallengeStyle = (challenge: any) => {
    const defaultStyle = {
      icon: <Heart className="h-5 w-5 text-red-500" />,
      color: "bg-red-100",
      border: "border-l-red-400",
      progress: "bg-red-400",
    };

    const typeStyles: Record<string, any> = {
      emotions: defaultStyle,
      meditation: {
        icon: <Brain className="h-5 w-5 text-blue-500" />,
        color: "bg-blue-100",
        border: "border-l-blue-400",
        progress: "bg-blue-400",
      },
      journaling: {
        icon: <BookOpen className="h-5 w-5 text-green-500" />,
        color: "bg-green-100",
        border: "border-l-green-400",
        progress: "bg-green-400",
      },
      activity: {
        icon: <Activity className="h-5 w-5 text-orange-500" />,
        color: "bg-orange-100",
        border: "border-l-orange-400",
        progress: "bg-orange-400",
      },
      mindfulness: {
        icon: <Feather className="h-5 w-5 text-teal-500" />,
        color: "bg-teal-100",
        border: "border-l-teal-400",
        progress: "bg-teal-400",
      },
      distress_tolerance: {
        icon: <Shield className="h-5 w-5 text-red-500" />,
        color: "bg-red-100",
        border: "border-l-red-400",
        progress: "bg-red-400",
      },
      emotion_regulation: {
        icon: <Gauge className="h-5 w-5 text-purple-500" />,
        color: "bg-purple-100",
        border: "border-l-purple-400",
        progress: "bg-purple-400",
      },
      interpersonal_effectiveness: {
        icon: <Users className="h-5 w-5 text-blue-500" />,
        color: "bg-blue-100",
        border: "border-l-blue-400",
        progress: "bg-blue-400",
      },
    };

    return typeStyles[challenge.type] || defaultStyle;
  };

  return (
    <PageTransition>
      <div className="pb-16">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/10 to-background pt-6 pb-4 px-4">
          <h1 className="text-2xl font-bold">Wellness Challenges</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your wellness goals and build healthy habits
          </p>
        </div>

        {/* Main content */}
        <div className="p-4">
          {/* Active Challenges Section */}
          <div className="mb-6">
            {/* Title row */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Your Active Challenges</h2>

              {activeChallenges.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {filteredChallenges.length}{" "}
                  {filteredChallenges.length === 1 ? "challenge" : "challenges"}
                </div>
              )}
            </div>

            {/* Filter row - separate from title row */}
            {activeChallenges.length > 0 && (
              <div className="mb-4">
                {/* All button and scrollable filters */}
                <div className="flex overflow-hidden items-center">
                  <Button
                    variant={categoryFilter === "all" ? "default" : "outline"}
                    size="sm"
                    className={`h-8 rounded-full px-3 mr-2 text-xs font-medium transition-all shrink-0 ${
                      categoryFilter === "all"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setCategoryFilter("all")}
                  >
                    All
                  </Button>

                  <div className="overflow-x-auto hide-scrollbar pb-1 flex">
                    {challengeTypes.map((type) => (
                      <Button
                        key={type.name}
                        variant={
                          categoryFilter === type.name ? "default" : "outline"
                        }
                        size="sm"
                        className={`h-8 rounded-full mr-2 px-3 text-xs font-medium shrink-0 whitespace-nowrap transition-all flex items-center ${
                          categoryFilter === type.name
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-accent"
                        }`}
                        onClick={() => setCategoryFilter(type.name)}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mr-1.5 ${type.color.replace("bg-", "bg-")}`}
                        ></span>
                        {type.displayName}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Show management controls if there are enough challenges */}
            {filteredChallenges.length > 3 && (
              <div className="flex justify-between items-center mb-3 text-sm">
                <p className="text-muted-foreground">
                  {showingMore
                    ? `Showing all ${filteredChallenges.length} challenges`
                    : `Showing ${Math.min(3, filteredChallenges.length)} of ${filteredChallenges.length}`}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowingMore(!showingMore)}
                  className="flex items-center"
                >
                  {showingMore ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show More
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Challenge Cards */}
            <div className="space-y-3">
              {isLoadingChallenges ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-2 text-gray-600">Loading challenges...</p>
                  </CardContent>
                </Card>
              ) : filteredChallenges.length === 0 &&
                categoryFilter !== "all" ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-3">
                      No challenges found in this category
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setCategoryFilter("all")}
                    >
                      Show All Categories
                    </Button>
                  </CardContent>
                </Card>
              ) : activeChallenges.length === 0 ? (
                <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                  <CardContent className="pt-6 pb-8 px-5 text-center flex flex-col items-center">
                    <div className="p-4 rounded-full bg-primary/10 mb-4">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">
                      No Active Challenges
                    </h3>
                    <p className="text-muted-foreground text-sm mb-5 max-w-xs">
                      Get started by exploring our wellness challenges to
                      improve your mental health and wellbeing
                    </p>
                    <Button
                      className="rounded-full px-6 shadow-sm h-10"
                      onClick={() =>
                        navigate("/wellness-challenges/categories/emotions")
                      }
                    >
                      Browse Challenges
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {displayedChallenges.map((challenge: any) => {
                    const style = getChallengeStyle(challenge);
                    const progressValue = 33; // Sample progress value
                    const currentValue = Math.round(
                      (challenge.targetValue || 1) * (progressValue / 100),
                    );

                    return (
                      <Card
                        key={challenge.id}
                        className="overflow-hidden rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <CardContent className="p-0">
                          {/* Card Top Section - Health App Style Header with Icon */}
                          <div
                            className={`p-4 ${style.color} bg-opacity-20 border-b border-neutral-100`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div
                                  className={`${style.color} p-2 rounded-full mr-3 shadow-sm`}
                                >
                                  {style.icon}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-sm">
                                    {challenge.title}
                                  </h3>
                                  <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                                    <span
                                      className={`w-2 h-2 rounded-full mr-1.5 inline-block ${style.color}`}
                                    ></span>
                                    {challenge.type.charAt(0).toUpperCase() +
                                      challenge.type.slice(1)}
                                    <span className="mx-1">•</span>
                                    {challenge.frequency || "Daily"}
                                  </p>
                                </div>
                              </div>
                              <div className="bg-green-100 text-green-700 text-xs py-1 px-2.5 rounded-full font-medium">
                                Active
                              </div>
                            </div>
                          </div>

                          {/* Card Body - Progress Section */}
                          <div className="p-4">
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-2">
                                <span className="font-medium text-gray-500">
                                  Today's Progress
                                </span>
                                <span className="font-semibold">
                                  {currentValue}/{challenge.targetValue || 1}
                                </span>
                              </div>

                              {/* Apple Health Style Progress Bar */}
                              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ease-out`}
                                  style={{
                                    width: `${progressValue}%`,
                                    background: `linear-gradient(to right, ${
                                      style.color.includes("red")
                                        ? "#f87171"
                                        : style.color.includes("blue")
                                          ? "#60a5fa"
                                          : style.color.includes("green")
                                            ? "#4ade80"
                                            : style.color.includes("orange")
                                              ? "#fb923c"
                                              : style.color.includes("teal")
                                                ? "#2dd4bf"
                                                : style.color.includes("purple")
                                                  ? "#c084fc"
                                                  : "#c084fc"
                                    }, 
                                                ${
                                                  style.color.includes("red")
                                                    ? "#ef4444"
                                                    : style.color.includes(
                                                          "blue",
                                                        )
                                                      ? "#3b82f6"
                                                      : style.color.includes(
                                                            "green",
                                                          )
                                                        ? "#22c55e"
                                                        : style.color.includes(
                                                              "orange",
                                                            )
                                                          ? "#f97316"
                                                          : style.color.includes(
                                                                "teal",
                                                              )
                                                            ? "#14b8a6"
                                                            : style.color.includes(
                                                                  "purple",
                                                                )
                                                              ? "#a855f7"
                                                              : "#a855f7"
                                                })`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-primary font-medium hover:bg-primary/5 rounded-full h-9"
                              onClick={() =>
                                navigate(`/wellness-challenges/${challenge.id}`)
                              }
                            >
                              View Details
                              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Show More/Less button at the bottom if there are more challenges */}
                  {filteredChallenges.length > 3 && (
                    <div className="text-center pt-4 pb-2">
                      <Button
                        variant="ghost"
                        className="text-primary font-medium h-10 px-6 rounded-full border border-gray-200 shadow-sm hover:shadow"
                        onClick={() => setShowingMore(!showingMore)}
                      >
                        {showingMore ? (
                          <span className="flex items-center">
                            <ChevronUp className="h-4 w-4 mr-2 text-primary" />
                            Show Less
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <ChevronDown className="h-4 w-4 mr-2 text-primary" />
                            Show {filteredChallenges.length - 3} More Challenges
                          </span>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Challenge categories */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">
              Browse Challenge Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {challengeTypes.map((type) => (
                <Card
                  key={type.name}
                  className="cursor-pointer overflow-hidden rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-200"
                  onClick={() =>
                    navigate(`/wellness-challenges/categories/${type.name}`)
                  }
                >
                  <CardContent className="p-0">
                    <div
                      className={`h-3 ${type.color.replace("bg-", "bg-")} bg-opacity-70`}
                    ></div>
                    <div className="p-4 flex flex-col items-center text-center">
                      <div
                        className={`p-3 rounded-full ${type.color} mb-3 shadow-sm`}
                      >
                        {type.icon}
                      </div>
                      <span className="font-medium text-sm">
                        {type.displayName}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Floating action button for new challenge */}
        <div className="fixed bottom-20 right-4">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-primary to-primary/90 hover:shadow-xl transition-all duration-300 border-0"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Create New Challenge</span>
          </Button>
        </div>

        {/* New challenge dialog - Apple Health Style */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-xl border-0 shadow-lg overflow-hidden p-0">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-br from-primary/90 to-primary p-5 text-white">
              <DialogTitle className="text-xl font-semibold mb-1">
                Create Challenge
              </DialogTitle>
              <DialogDescription className="text-white/90 text-sm">
                Set up a new wellness challenge to track your progress
              </DialogDescription>
            </div>

            <div className="p-5">
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="challenge-name"
                    className="text-sm font-medium block mb-1.5"
                  >
                    Challenge Name
                  </label>
                  <input
                    id="challenge-name"
                    placeholder="Daily Meditation"
                    className="flex h-11 w-full rounded-xl border-0 bg-slate-100 px-4 py-2 text-sm shadow-inner focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1.5">
                    Challenge Type
                  </label>
                  <div className="grid grid-cols-2 gap-3 mt-1 max-h-56 overflow-y-auto pr-1 pb-1 hide-scrollbar">
                    {challengeTypes.map((type) => (
                      <div
                        key={type.name}
                        className="border-0 rounded-xl bg-slate-100 p-3 flex items-center cursor-pointer hover:bg-slate-200 transition-colors duration-200"
                      >
                        <div
                          className={`p-2 rounded-full ${type.color} mr-3 shadow-sm`}
                        >
                          {React.cloneElement(type.icon, {
                            className: "h-4 w-4",
                          })}
                        </div>
                        <span className="text-sm font-medium">
                          {type.displayName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="target"
                    className="text-sm font-medium block mb-1.5"
                  >
                    Daily Target
                  </label>
                  <input
                    id="target"
                    type="number"
                    min="1"
                    placeholder="10"
                    className="flex h-11 w-full rounded-xl border-0 bg-slate-100 px-4 py-2 text-sm shadow-inner focus:ring-1 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5 ml-1">
                    The number of times or minutes per day
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-7">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="rounded-xl border border-slate-200 h-11"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button className="rounded-xl h-11 px-6 shadow-sm">
                  Create Challenge
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default WellnessChallenges;
