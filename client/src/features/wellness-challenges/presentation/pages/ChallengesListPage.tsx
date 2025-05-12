import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { WellnessChallengesList } from '../components/WellnessChallengesList';
import { CreateChallengeForm } from '../components/CreateChallengeForm';
import { WellnessChallengeProvider } from '../components/WellnessChallengeProvider';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Filter, 
  Flag, 
  Plus, 
  Search,
  Trophy
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export const ChallengesListPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<number | null>(null);

  // Fetch current user ID
  // For demo, let's use a placeholder
  React.useEffect(() => {
    // In a real app, this would fetch the current user
    setActiveUser(2); // Using a placeholder user ID
  }, []);

  return (
    <WellnessChallengeProvider userId={activeUser || undefined}>
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Wellness Challenges</h1>
            <p className="text-gray-500 mt-1">
              Track your wellness goals and build healthy habits
            </p>
          </div>
          
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <Plus className="mr-2 h-4 w-4" />
                New Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Wellness Challenge</DialogTitle>
                <DialogDescription>
                  Set up your new wellness challenge and start tracking your progress
                </DialogDescription>
              </DialogHeader>
              <CreateChallengeForm 
                onSuccess={() => setCreateModalOpen(false)}
                onCancel={() => setCreateModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="mb-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <TabsList>
                <TabsTrigger value="all">All Challenges</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <div className="flex mt-4 sm:mt-0 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto mr-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search challenges" className="pl-8" />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs font-normal text-gray-500">Challenge Type</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem checked>All Types</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Emotions</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Meditation</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Journaling</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Activity</DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs font-normal text-gray-500">Frequency</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem checked>All Frequencies</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Daily</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Weekly</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Monthly</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[130px] ml-2">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="progress">Most Progress</SelectItem>
                    <SelectItem value="streak">Highest Streak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <WellnessChallengesList />
            </TabsContent>
            
            <TabsContent value="active" className="mt-0">
              {/* We would filter this in a real app */}
              <WellnessChallengesList />
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              {/* We would filter this in a real app */}
              <WellnessChallengesList />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Insights Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                Challenge Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm font-medium">Highest Streak</span>
                    </div>
                    <span className="text-sm font-bold">14 days</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm font-medium">Challenge Completion</span>
                    </div>
                    <span className="text-sm font-bold">73%</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Flag className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm font-medium">Active Challenges</span>
                    </div>
                    <span className="text-sm font-bold">5</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-purple-500 mr-2" />
                      <span className="text-sm font-medium">Total Days Tracked</span>
                    </div>
                    <span className="text-sm font-bold">87</span>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-4">
                View Detailed Insights
              </Button>
            </CardContent>
          </Card>
          
          {/* Challenge Templates Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Popular Challenge Templates</CardTitle>
              <CardDescription>
                Quick-start with these predefined challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                  <h3 className="font-medium">Daily Meditation</h3>
                  <p className="text-sm text-gray-500">
                    10 minutes of mindful meditation each day
                  </p>
                </div>
                
                <div className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                  <h3 className="font-medium">Emotion Tracking</h3>
                  <p className="text-sm text-gray-500">
                    Record your emotions and moods twice daily
                  </p>
                </div>
                
                <div className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                  <h3 className="font-medium">Gratitude Journal</h3>
                  <p className="text-sm text-gray-500">
                    Write down 3 things you're grateful for each day
                  </p>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => setCreateModalOpen(true)}
                >
                  View More Templates
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Tips Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Tips for Success</CardTitle>
              <CardDescription>
                How to make the most of your challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm">Start Small</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Begin with achievable goals to build consistent habits
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm">Track Daily</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Regular tracking helps maintain momentum and accountability
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm">Review Progress</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Analyze your patterns weekly to identify what's working
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm">Adjust As Needed</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Don't hesitate to modify challenges that aren't serving you
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </WellnessChallengeProvider>
  );
};