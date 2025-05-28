import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Plus,
  Target,
  Heart,
  Brain,
  BookOpen,
  Activity,
  ArrowRight,
  ArrowLeft,
  Users,
  Shield,
  Feather,
} from "lucide-react";

interface WellnessChallenge {
  id: number;
  userId: number;
  title: string;
  description: string;
  type: string;
  frequency: string;
  startDate: string;
  endDate: string;
  targetValue: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const categoryConfig = {
  emotions: {
    title: 'Emotions',
    icon: Heart,
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-800',
    description: 'Track and understand your emotional patterns'
  },
  meditation: {
    title: 'Meditation',
    icon: Brain,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    description: 'Mindfulness and meditation practices'
  },
  journaling: {
    title: 'Journaling',
    icon: BookOpen,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    description: 'Reflect through writing and self-expression'
  },
  activity: {
    title: 'Activity',
    icon: Activity,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    description: 'Physical wellness and movement challenges'
  },
  mindfulness: {
    title: 'Mindfulness',
    icon: Feather,
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-800',
    description: 'Present moment awareness and grounding'
  },
  distress_tolerance: {
    title: 'Distress Tolerance',
    icon: Shield,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    description: 'Skills for managing difficult emotions'
  },
  emotion_regulation: {
    title: 'Emotion Regulation',
    icon: Target,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    description: 'Tools for emotional balance and control'
  },
  interpersonal_effectiveness: {
    title: 'Interpersonal Skills',
    icon: Users,
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-800',
    description: 'Building healthy relationships and communication'
  }
};

export default function WellnessChallenges() {
  const isMobile = useIsMobile();
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { user } = useAuth();

  const { data: allChallenges = [], isLoading } = useQuery<WellnessChallenge[]>({
    queryKey: ['/api/wellness-challenges'],
  });

  // Filter challenges by status from the single data source
  const challenges = React.useMemo(() => {
    return allChallenges.filter(challenge => challenge.status === 'active');
  }, [allChallenges]);

  // Group challenges by category
  const challengesByCategory = React.useMemo(() => {
    const grouped: Record<string, WellnessChallenge[]> = {};
    allChallenges.forEach(challenge => {
      if (!grouped[challenge.type]) {
        grouped[challenge.type] = [];
      }
      grouped[challenge.type].push(challenge);
    });
    return grouped;
  }, [allChallenges]);

  // Get category statistics
  const getCategoryStats = (categoryType: string) => {
    const categoryData = challengesByCategory[categoryType] || [];
    const activeCount = categoryData.filter(c => c.status === 'active').length;
    const totalCount = categoryData.length;
    const completedCount = categoryData.filter(c => c.status === 'completed').length;
    
    return {
      active: activeCount,
      total: totalCount,
      completed: completedCount,
      completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
    };
  };

  const goBackToCategories = () => {
    setSelectedCategory(null);
  };

  const filteredChallenges = selectedCategory 
    ? challenges.filter(challenge => challenge.type === selectedCategory)
    : challenges;

  const categoryInfo = selectedCategory ? categoryConfig[selectedCategory as keyof typeof categoryConfig] : null;

  // Category Selection View
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className={`max-w-4xl mx-auto ${isMobile ? 'p-4' : 'p-8'}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-gray-900 mb-4`}>
              Wellness Challenges
            </h1>
            <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-600 max-w-2xl mx-auto`}>
              Choose a wellness category to explore challenges that will help you build healthy habits and improve your wellbeing.
            </p>
          </div>

          {/* Quick Stats */}
          <Card className="mb-8">
            <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
              <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-6'}`}>
                <div className="text-center">
                  <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-green-600`}>
                    {challenges.filter(c => c.status === 'active').length}
                  </div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Active</div>
                </div>
                <div className="text-center">
                  <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-blue-600`}>
                    {allChallenges.filter(c => c.status === 'completed').length}
                  </div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Completed</div>
                </div>
                {!isMobile && (
                  <>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {allChallenges.length}
                      </div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {Object.keys(challengesByCategory).length}
                      </div>
                      <div className="text-sm text-gray-600">Categories</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Cards - Only show categories with challenges */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'}`}>
            {Object.entries(categoryConfig)
              .filter(([key]) => challengesByCategory[key] && challengesByCategory[key].length > 0)
              .map(([key, config]) => {
              const stats = getCategoryStats(key);
              const IconComponent = config.icon;
              
              return (
                <Card 
                  key={key}
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${config.borderColor} border-2 hover:scale-105`}
                  onClick={() => navigate(`/wellness-challenges/categories/${key}`)}
                >
                  <CardHeader className={`bg-gradient-to-r ${config.color} text-white ${isMobile ? 'p-4' : 'p-6'}`}>
                    <div className="flex items-center gap-3">
                      <IconComponent className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
                      <div>
                        <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
                          {config.title}
                        </CardTitle>
                        <CardDescription className={`text-white/80 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {config.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-gray-700`}>
                          Challenges
                        </span>
                        <span className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold ${config.textColor}`}>
                          {stats.active} active • {stats.total} total
                        </span>
                      </div>
                      
                      {stats.total > 0 && (
                        <>
                          <Progress 
                            value={stats.completionRate} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{stats.completionRate}% completion rate</span>
                            <span>{stats.completed} completed</span>
                          </div>
                        </>
                      )}
                      
                      {stats.total === 0 && (
                        <div className="text-center py-2">
                          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                            Tap to explore challenges
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Challenges List View
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading challenges...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className={`max-w-4xl mx-auto ${isMobile ? 'p-4' : 'p-8'}`}>
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={goBackToCategories}
            className={`mb-4 ${isMobile ? 'text-sm' : ''}`}
          >
            <ArrowLeft className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
            Back to Categories
          </Button>
          
          <div className="text-center">
            <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 mb-2`}>
              {categoryInfo?.title} Challenges
            </h1>
            <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
              {categoryInfo?.description}
            </p>
          </div>
        </div>

        {/* Category Stats */}
        {(() => {
          const stats = getCategoryStats(selectedCategory);
          return (
            <Card className="mb-6">
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <div className={`grid ${isMobile ? 'grid-cols-3 gap-2' : 'grid-cols-3 gap-6'}`}>
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-600`}>
                      {stats.active}
                    </div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Active</div>
                  </div>
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-600`}>
                      {stats.completed}
                    </div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Completed</div>
                  </div>
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-purple-600`}>
                      {stats.completionRate}%
                    </div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Success Rate</div>
                  </div>
                </div>
                {stats.total > 0 && (
                  <Progress 
                    value={stats.completionRate} 
                    className="mt-4"
                  />
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* Challenges List */}
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 gap-6'}`}>
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map((challenge) => (
              <Card 
                key={challenge.id} 
                className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${categoryInfo?.borderColor} border hover:scale-105`}
                onClick={() => navigate(`/wellness-challenges/${challenge.id}`)}
              >
                <CardHeader className={`${isMobile ? 'pb-3' : 'pb-4'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} mb-2`}>
                        {challenge.title}
                      </CardTitle>
                      <CardDescription className={`${isMobile ? 'text-sm' : 'text-base'}`}>
                        {challenge.description}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={challenge.status === 'active' ? 'default' : 'secondary'}
                      className={`ml-4 ${isMobile ? 'text-xs' : ''}`}
                    >
                      {challenge.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className={`${isMobile ? 'pt-0 pb-4' : 'pt-0 pb-6'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                        <strong>Target:</strong> {challenge.targetValue}
                      </span>
                      <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                        <strong>Frequency:</strong> {challenge.frequency}
                      </span>
                    </div>
                    <ArrowRight className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400`} />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className={`${categoryInfo?.textColor} mb-4`}>
                  {categoryInfo && React.createElement(categoryInfo.icon, { 
                    className: `${isMobile ? 'h-12 w-12' : 'h-16 w-16'} mx-auto mb-4` 
                  })}
                </div>
                <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 mb-2`}>
                  No {categoryInfo?.title} challenges yet
                </h3>
                <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600 mb-4`}>
                  Start your {categoryInfo?.title.toLowerCase()} journey by creating your first challenge.
                </p>
                <Button
                  onClick={() => navigate('/wellness-challenges/new')}
                  className={`${isMobile ? 'text-sm' : ''}`}
                >
                  <Plus className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
                  Create Challenge
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}