/**
 * ChallengesList component displays a grid of challenge cards
 * with filtering and sorting options
 */
import React, { useState, useEffect } from 'react';
import { useWellnessChallenge } from '../context/WellnessChallengeContext';
import { ChallengeCard } from './ChallengeCard';
import { 
  ChallengeStatus, 
  ChallengeType, 
  ChallengeFrequency 
} from '../../../domain/models';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, FilterX } from 'lucide-react';

// Prop for the component
interface ChallengesListProps {
  userId?: number;
  onCreateNew?: () => void;
}

// Sorting options
type SortOption = 'date-new' | 'date-old' | 'progress-high' | 'progress-low';

export const ChallengesList: React.FC<ChallengesListProps> = ({ userId, onCreateNew }) => {
  // Get data and methods from context
  const { 
    challenges, 
    loading, 
    error, 
    refreshChallenges, 
    updateChallengeStatus 
  } = useWellnessChallenge();
  
  // Filter and sort state
  const [activeFilter, setActiveFilter] = useState<ChallengeStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ChallengeType | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-new');
  
  // Apply filters to challenges
  const filteredChallenges = challenges.filter(challenge => {
    // Filter by status
    if (activeFilter !== 'all' && challenge.status !== activeFilter) {
      return false;
    }
    
    // Filter by type
    if (typeFilter !== 'all' && challenge.challengeType !== typeFilter) {
      return false;
    }
    
    return true;
  });
  
  // Sort challenges
  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    switch (sortBy) {
      case 'date-new':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case 'date-old':
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case 'progress-high':
        // Assuming challenges have a progress field (would come from service)
        const progressA = Math.random() * 100; // This would be replaced with actual data
        const progressB = Math.random() * 100; // This would be replaced with actual data
        return progressB - progressA;
      case 'progress-low':
        // Assuming challenges have a progress field (would come from service)
        const progressC = Math.random() * 100; // This would be replaced with actual data
        const progressD = Math.random() * 100; // This would be replaced with actual data
        return progressC - progressD;
      default:
        return 0;
    }
  });
  
  // Handle status change
  const handleStatusChange = async (id: number, status: ChallengeStatus) => {
    try {
      await updateChallengeStatus(id, status);
      await refreshChallenges();
    } catch (err) {
      console.error('Error updating challenge status:', err);
    }
  };
  
  // Handle create new challenge
  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setActiveFilter('all');
    setTypeFilter('all');
    setSortBy('date-new');
  };
  
  // Load challenges on mount
  useEffect(() => {
    refreshChallenges();
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Your Wellness Challenges</h2>
        <Button onClick={handleCreateNew} className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          Create New
        </Button>
      </div>
      
      {/* Status filter tabs */}
      <Tabs defaultValue="all" value={activeFilter} onValueChange={(value) => setActiveFilter(value as ChallengeStatus | 'all')}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value={ChallengeStatus.ACTIVE}>Active</TabsTrigger>
          <TabsTrigger value={ChallengeStatus.COMPLETED}>Completed</TabsTrigger>
          <TabsTrigger value={ChallengeStatus.ABANDONED}>Abandoned</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Filters and sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ChallengeType | 'all')}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={ChallengeType.EMOTIONS}>Emotions</SelectItem>
              <SelectItem value={ChallengeType.MEDITATION}>Meditation</SelectItem>
              <SelectItem value={ChallengeType.JOURNALING}>Journaling</SelectItem>
              <SelectItem value={ChallengeType.ACTIVITY}>Activity</SelectItem>
              <SelectItem value={ChallengeType.CUSTOM}>Custom</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-new">Newest First</SelectItem>
              <SelectItem value="date-old">Oldest First</SelectItem>
              <SelectItem value="progress-high">Progress (High to Low)</SelectItem>
              <SelectItem value="progress-low">Progress (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="ghost" size="sm" onClick={resetFilters} className="flex items-center gap-1">
          <FilterX className="h-4 w-4" />
          Reset Filters
        </Button>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading challenges...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="text-center py-8 text-destructive">
          <p>Error loading challenges: {error.message}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => refreshChallenges()}
          >
            Try Again
          </Button>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && sortedChallenges.length === 0 && (
        <div className="text-center py-12 bg-muted rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No challenges found</h3>
          {activeFilter !== 'all' || typeFilter !== 'all' ? (
            <>
              <p className="text-muted-foreground mb-6">Try changing your filters or create a new challenge</p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
                <Button onClick={handleCreateNew}>
                  Create Challenge
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-6">Get started by creating your first wellness challenge</p>
              <Button onClick={handleCreateNew}>
                Create Your First Challenge
              </Button>
            </>
          )}
        </div>
      )}
      
      {/* Challenge grid */}
      {!loading && !error && sortedChallenges.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedChallenges.map(challenge => (
            <ChallengeCard 
              key={challenge.id} 
              challenge={challenge} 
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};