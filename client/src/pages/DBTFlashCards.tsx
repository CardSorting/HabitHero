import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Heart, Shield, Users, ChevronLeft, ChevronRight, RotateCcw, ArrowLeft, BookOpen, Play, List, Filter, Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DBTFlashCard {
  id: number;
  category: string;
  skill_name: string;
  question: string;
  answer: string;
  skill_description: string;
  skill_purpose: string;
  when_to_use: string;
  difficulty_level: string;
}

interface StudyProgress {
  category: string;
  total_cards: number;
  studied_cards: number;
  accuracy_percentage: number;
}

const categoryConfig = {
  mindfulness: {
    title: 'Mindfulness',
    icon: Brain,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    description: 'Being present and aware in the moment'
  },
  distress_tolerance: {
    title: 'Distress Tolerance',
    icon: Shield,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    description: 'Skills for surviving crisis situations'
  },
  emotion_regulation: {
    title: 'Emotion Regulation',
    icon: Heart,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    description: 'Managing and changing unwanted emotions'
  },
  interpersonal_effectiveness: {
    title: 'Interpersonal Effectiveness',
    icon: Users,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    description: 'Building healthy relationships and communication'
  }
};

const difficultyConfig = {
  easy: { label: 'Beginner', color: 'bg-green-100 text-green-800', icon: '⭐' },
  medium: { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800', icon: '⭐⭐' },
  advanced: { label: 'Advanced', color: 'bg-red-100 text-red-800', icon: '⭐⭐⭐' }
};

type ViewMode = 'categories' | 'skills-list' | 'study-mode';

export default function DBTFlashCards() {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const { data: flashCards = [], isLoading: cardsLoading } = useQuery<DBTFlashCard[]>({
    queryKey: ['/api/dbt-flashcards', selectedCategory],
    queryFn: () => selectedCategory ? 
      fetch(`/api/dbt-flashcards/category/${selectedCategory}`).then(res => res.json()) : 
      Promise.resolve([]),
    enabled: !!selectedCategory
  });

  const { data: progress = [] } = useQuery<StudyProgress[]>({
    queryKey: ['/api/dbt-flashcards/progress'],
  });

  // Filter cards by difficulty
  const filteredCards = useMemo(() => {
    if (difficultyFilter === 'all') return flashCards;
    return flashCards.filter(card => card.difficulty_level === difficultyFilter);
  }, [flashCards, difficultyFilter]);

  const currentCard = filteredCards[currentCardIndex];
  const categoryInfo = selectedCategory ? categoryConfig[selectedCategory as keyof typeof categoryConfig] : null;

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % filteredCards.length);
    setShowAnswer(false);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    setShowAnswer(false);
  };

  const resetCard = () => {
    setShowAnswer(false);
  };

  const goBackToCategories = () => {
    setViewMode('categories');
    setSelectedCategory(null);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setDifficultyFilter('all');
  };

  const goToSkillsList = () => {
    setViewMode('skills-list');
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const startStudying = () => {
    setViewMode('study-mode');
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const categoryProgress = progress.find(p => p.category === selectedCategory);

  // Category Selection View
  if (viewMode === 'categories') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className={`max-w-4xl mx-auto ${isMobile ? 'p-4' : 'p-8'}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-gray-900 mb-4`}>
              DBT Skills Library
            </h1>
            <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-600 max-w-2xl mx-auto`}>
              Learn and practice Dialectical Behavior Therapy skills. Choose a category to explore educational content.
            </p>
          </div>

          {/* Category Cards */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'}`}>
            {Object.entries(categoryConfig).map(([key, config]) => {
              const categoryProgress = progress.find(p => p.category === key);
              const IconComponent = config.icon;
              
              return (
                <Card 
                  key={key}
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${config.borderColor} border-2 hover:scale-105`}
                  onClick={() => {
                    setSelectedCategory(key);
                    setViewMode('skills-list');
                  }}
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
                    {categoryProgress ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-gray-700`}>
                            Progress
                          </span>
                          <span className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold ${config.textColor}`}>
                            {categoryProgress.studied_cards}/{categoryProgress.total_cards} skills
                          </span>
                        </div>
                        <Progress 
                          value={(categoryProgress.studied_cards / categoryProgress.total_cards) * 100} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>
                            {Math.round((categoryProgress.studied_cards / categoryProgress.total_cards) * 100)}% complete
                          </span>
                          {categoryProgress.accuracy_percentage && (
                            <span>
                              {categoryProgress.accuracy_percentage}% accuracy
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                          Tap to start learning
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Calculate skills by difficulty - moved outside conditional render to avoid hooks order issues
  const skillsByDifficulty = useMemo(() => {
    const grouped = {
      easy: flashCards.filter(card => card.difficulty_level === 'easy'),
      medium: flashCards.filter(card => card.difficulty_level === 'medium'),
      advanced: flashCards.filter(card => card.difficulty_level === 'advanced')
    };
    return grouped;
  }, [flashCards]);

  // Skills List View
  if (viewMode === 'skills-list') {

    if (cardsLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading skills...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className={`max-w-4xl mx-auto ${isMobile ? 'p-4' : 'p-8'}`}>
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={goBackToCategories}
              className={`mb-4 ${isMobile ? 'text-sm' : ''}`}
            >
              <ArrowLeft className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
              Back to Categories
            </Button>
            
            <div className="text-center mb-6">
              <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 mb-2`}>
                {categoryInfo?.title} Skills
              </h1>
              <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                {categoryInfo?.description}
              </p>
            </div>

            {/* Study Mode Buttons */}
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'} mb-6`}>
              <Button
                onClick={startStudying}
                className={`${isMobile ? 'py-4' : 'py-6'} bg-gradient-to-r ${categoryInfo?.color} hover:opacity-90`}
              >
                <Play className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
                Start Studying ({filteredCards.length} cards)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const randomIndex = Math.floor(Math.random() * filteredCards.length);
                  setCurrentCardIndex(randomIndex);
                  startStudying();
                }}
                className={`${isMobile ? 'py-4' : 'py-6'}`}
              >
                <BookOpen className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
                Random Practice
              </Button>
            </div>

            {/* Difficulty Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={difficultyFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDifficultyFilter('all')}
              >
                All Skills ({flashCards.length})
              </Button>
              {Object.entries(difficultyConfig).map(([level, config]) => (
                <Button
                  key={level}
                  variant={difficultyFilter === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficultyFilter(level)}
                  className={`${difficultyFilter === level ? config.color : ''}`}
                >
                  {config.icon} {config.label} ({skillsByDifficulty[level as keyof typeof skillsByDifficulty].length})
                </Button>
              ))}
            </div>
          </div>

          {/* Skills by Difficulty */}
          <div className="space-y-6">
            {Object.entries(difficultyConfig).map(([level, config]) => {
              const skills = skillsByDifficulty[level as keyof typeof skillsByDifficulty];
              if (skills.length === 0) return null;

              return (
                <div key={level} className="space-y-3">
                  <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 flex items-center gap-2`}>
                    <span className="text-lg">{config.icon}</span>
                    {config.label} Skills ({skills.length})
                  </h3>
                  
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
                    {skills.map((skill, index) => (
                      <Card 
                        key={skill.id}
                        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-102"
                        onClick={() => {
                          const skillIndex = filteredCards.findIndex(card => card.id === skill.id);
                          setCurrentCardIndex(skillIndex);
                          startStudying();
                        }}
                      >
                        <CardContent className={`${isMobile ? 'p-4' : 'p-5'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900`}>
                              {skill.skill_name}
                            </h4>
                            <Badge className={`${config.color} text-xs`}>
                              {config.label}
                            </Badge>
                          </div>
                          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 line-clamp-2`}>
                            {skill.skill_description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Study Mode View
  if (viewMode === 'study-mode') {
    if (cardsLoading || !currentCard) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading flash card...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className={`max-w-4xl mx-auto ${isMobile ? 'p-4' : 'p-8'}`}>
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={goToSkillsList}
              className={`mb-4 ${isMobile ? 'text-sm' : ''}`}
            >
              <ArrowLeft className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
              Back to Skills
            </Button>
            
            <div className="text-center">
              <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 mb-2`}>
                Study Mode
              </h1>
              <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                {categoryInfo?.description}
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-gray-700`}>
                Card {currentCardIndex + 1} of {filteredCards.length}
              </span>
              <Badge className={difficultyConfig[currentCard.difficulty_level as keyof typeof difficultyConfig].color}>
                {difficultyConfig[currentCard.difficulty_level as keyof typeof difficultyConfig].label}
              </Badge>
            </div>
            <Progress value={(currentCardIndex + 1) / filteredCards.length * 100} className="h-2" />
          </div>

          {/* Flash Card */}
          <Card className={`${isMobile ? 'min-h-[400px]' : 'min-h-[500px]'} relative overflow-hidden mb-6`}>
            <CardHeader className={`bg-gradient-to-r ${categoryInfo?.color} text-white`}>
              <CardTitle className={`${isMobile ? 'text-lg' : 'text-2xl'} mb-2`}>
                {currentCard.skill_name}
              </CardTitle>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 w-fit">
                {categoryInfo?.title}
              </Badge>
            </CardHeader>
            
            <CardContent className={`${isMobile ? 'p-4' : 'p-6'} flex-1`}>
              <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
                {!showAnswer ? (
                  <>
                    <div>
                      <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 mb-3`}>
                        {currentCard.question}
                      </h3>
                    </div>
                    <Button 
                      onClick={() => setShowAnswer(true)}
                      className={`w-full ${isMobile ? 'py-4 text-lg' : 'py-6 text-xl'} bg-gradient-to-r ${categoryInfo?.color} hover:opacity-90 transition-opacity`}
                    >
                      Show Answer
                    </Button>
                  </>
                ) : (
                  <div className={`space-y-${isMobile ? '4' : '6'}`}>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-green-800 mb-2`}>
                        Answer:
                      </h4>
                      <p className={`${isMobile ? 'text-sm' : 'text-base'} text-green-700`}>
                        {currentCard.answer}
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-blue-800 mb-2`}>
                        What This Skill Does:
                      </h4>
                      <p className={`${isMobile ? 'text-sm' : 'text-base'} text-blue-700`}>
                        {currentCard.skill_description}
                      </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-purple-800 mb-2`}>
                        Why It Works:
                      </h4>
                      <p className={`${isMobile ? 'text-sm' : 'text-base'} text-purple-700`}>
                        {currentCard.skill_purpose}
                      </p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-orange-800 mb-2`}>
                        When to Use It:
                      </h4>
                      <p className={`${isMobile ? 'text-sm' : 'text-base'} text-orange-700`}>
                        {currentCard.when_to_use}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            {/* Navigation Controls */}
            <div className={`border-t bg-gray-50 ${isMobile ? 'p-4' : 'p-6'}`}>
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={prevCard}
                  disabled={filteredCards.length <= 1}
                  className={isMobile ? 'px-4 py-3' : ''}
                >
                  <ChevronLeft className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${isMobile ? '' : 'mr-1'}`} />
                  {!isMobile && 'Previous'}
                </Button>

                {showAnswer && (
                  <Button
                    variant="outline"
                    onClick={resetCard}
                    className={isMobile ? 'px-4 py-3' : ''}
                  >
                    <RotateCcw className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${isMobile ? '' : 'mr-1'}`} />
                    {!isMobile && 'Reset'}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={nextCard}
                  disabled={filteredCards.length <= 1}
                  className={isMobile ? 'px-4 py-3' : ''}
                >
                  {!isMobile && 'Next'}
                  <ChevronRight className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${isMobile ? '' : 'ml-1'}`} />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}