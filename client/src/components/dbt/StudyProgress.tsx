import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Heart,
  Users,
  Shield,
  Calendar,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';

export const StudyProgress: React.FC = () => {
  const categoryProgress = [
    {
      id: 'mindfulness',
      title: 'Mindfulness',
      icon: <Brain className="h-5 w-5" />,
      color: 'bg-blue-500',
      studied: 18,
      total: 24,
      accuracy: 85
    },
    {
      id: 'distress_tolerance',
      title: 'Distress Tolerance',
      icon: <Shield className="h-5 w-5" />,
      color: 'bg-red-500',
      studied: 12,
      total: 28,
      accuracy: 78
    },
    {
      id: 'emotion_regulation',
      title: 'Emotion Regulation',
      icon: <Heart className="h-5 w-5" />,
      color: 'bg-green-500',
      studied: 8,
      total: 32,
      accuracy: 92
    },
    {
      id: 'interpersonal_effectiveness',
      title: 'Interpersonal Effectiveness',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-purple-500',
      studied: 5,
      total: 26,
      accuracy: 88
    }
  ];

  const totalStudied = categoryProgress.reduce((sum, cat) => sum + cat.studied, 0);
  const totalCards = categoryProgress.reduce((sum, cat) => sum + cat.total, 0);
  const overallProgress = (totalStudied / totalCards) * 100;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
            Overall Progress
          </CardTitle>
          <CardDescription>
            Your DBT flash card study progress across all modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cards Studied</span>
              <span className="text-2xl font-bold">{totalStudied}/{totalCards}</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{Math.round(overallProgress)}% Complete</span>
              <span>{totalCards - totalStudied} cards remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryProgress.map((category) => {
          const progress = (category.studied / category.total) * 100;
          return (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${category.color} text-white mr-3`}>
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {category.studied}/{category.total} cards
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category.accuracy}% accuracy
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="mb-3" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{Math.round(progress)}% studied</span>
                  <span>{category.total - category.studied} left</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Study Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">7</div>
            <div className="text-sm text-gray-600">Study Streak</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">86%</div>
            <div className="text-sm text-gray-600">Avg Accuracy</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">43</div>
            <div className="text-sm text-gray-600">Cards Mastered</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Study Sessions</CardTitle>
          <CardDescription>
            Your last few flash card study sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="bg-blue-500 p-2 rounded-lg text-white mr-3">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">Mindfulness Cards</div>
                  <div className="text-sm text-gray-600">Today, 2:30 PM</div>
                </div>
              </div>
              <Badge variant="secondary">6 cards</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="bg-red-500 p-2 rounded-lg text-white mr-3">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">Distress Tolerance</div>
                  <div className="text-sm text-gray-600">Yesterday, 7:15 PM</div>
                </div>
              </div>
              <Badge variant="secondary">4 cards</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="bg-green-500 p-2 rounded-lg text-white mr-3">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">Emotion Regulation</div>
                  <div className="text-sm text-gray-600">2 days ago, 1:45 PM</div>
                </div>
              </div>
              <Badge variant="secondary">8 cards</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};