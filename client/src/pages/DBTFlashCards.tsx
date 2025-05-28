import React, { useState } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Brain,
  Heart,
  Users,
  Shield,
  Search,
  Shuffle,
  RotateCcw,
  BookOpen,
  Star
} from 'lucide-react';
import { FlashCardDeck } from '@/components/dbt/FlashCardDeck';
import { FlashCardCategory } from '@/components/dbt/FlashCardCategory';
import { StudyProgress } from '@/components/dbt/StudyProgress';

const DBTFlashCards: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isStudying, setIsStudying] = useState(false);

  const categories = [
    {
      id: 'mindfulness',
      title: 'Mindfulness',
      description: 'Core mindfulness skills for present-moment awareness',
      icon: <Brain className="h-6 w-6" />,
      color: 'bg-blue-500',
      cardCount: 24
    },
    {
      id: 'distress_tolerance',
      title: 'Distress Tolerance',
      description: 'Skills for surviving crisis situations',
      icon: <Shield className="h-6 w-6" />,
      color: 'bg-red-500',
      cardCount: 28
    },
    {
      id: 'emotion_regulation',
      title: 'Emotion Regulation',
      description: 'Skills for managing difficult emotions',
      icon: <Heart className="h-6 w-6" />,
      color: 'bg-green-500',
      cardCount: 32
    },
    {
      id: 'interpersonal_effectiveness',
      title: 'Interpersonal Effectiveness',
      description: 'Skills for healthy relationships',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-purple-500',
      cardCount: 26
    }
  ];

  if (isStudying && selectedCategory) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <FlashCardDeck 
            category={selectedCategory}
            onExit={() => {
              setIsStudying(false);
              setSelectedCategory(null);
            }}
          />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 min-h-screen">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            DBT Flash Cards Library
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Master DBT skills with interactive flash cards. Practice, review, and strengthen your emotional regulation toolkit.
          </p>
        </div>

        {/* Search and Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search flash cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 sm:flex-initial">
              <Shuffle className="mr-2 h-4 w-4" />
              Random Study
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-initial">
              <RotateCcw className="mr-2 h-4 w-4" />
              Review Missed
            </Button>
          </div>
        </div>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {categories.map((category) => (
                <FlashCardCategory
                  key={category.id}
                  category={category}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setIsStudying(true);
                  }}
                />
              ))}
            </div>

            {/* Quick Study Options */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" />
                  Quick Study Options
                </CardTitle>
                <CardDescription>
                  Start studying with these curated selections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => {
                      setSelectedCategory('daily_essentials');
                      setIsStudying(true);
                    }}
                  >
                    <Brain className="h-6 w-6 text-blue-500" />
                    <div className="text-center">
                      <div className="font-medium">Daily Essentials</div>
                      <div className="text-xs text-gray-500">Core skills for everyday use</div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => {
                      setSelectedCategory('crisis_survival');
                      setIsStudying(true);
                    }}
                  >
                    <Shield className="h-6 w-6 text-red-500" />
                    <div className="text-center">
                      <div className="font-medium">Crisis Survival</div>
                      <div className="text-xs text-gray-500">Emergency coping skills</div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => {
                      setSelectedCategory('relationship_skills');
                      setIsStudying(true);
                    }}
                  >
                    <Users className="h-6 w-6 text-purple-500" />
                    <div className="text-center">
                      <div className="font-medium">Relationship Skills</div>
                      <div className="text-xs text-gray-500">Communication & boundaries</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <StudyProgress />
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Flash Cards</CardTitle>
                <CardDescription>
                  Cards you've marked as favorites for quick access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No favorite cards yet</p>
                  <p className="text-sm">Star cards while studying to save them here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default DBTFlashCards;