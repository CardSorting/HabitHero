import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Brain, Heart, Shield, Users, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
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

const categoryIcons = {
  mindfulness: Brain,
  distress_tolerance: Shield,
  emotion_regulation: Heart,
  interpersonal_effectiveness: Users,
};

const categoryColors = {
  mindfulness: 'bg-blue-100 text-blue-800 border-blue-200',
  distress_tolerance: 'bg-green-100 text-green-800 border-green-200',
  emotion_regulation: 'bg-purple-100 text-purple-800 border-purple-200',
  interpersonal_effectiveness: 'bg-orange-100 text-orange-800 border-orange-200',
};

const categoryTitles = {
  mindfulness: 'Mindfulness',
  distress_tolerance: 'Distress Tolerance',
  emotion_regulation: 'Emotion Regulation',
  interpersonal_effectiveness: 'Interpersonal Effectiveness',
};

export default function DBTFlashCards() {
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string>('mindfulness');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const { data: flashCards = [], isLoading: cardsLoading } = useQuery<DBTFlashCard[]>({
    queryKey: ['/api/dbt-flashcards', selectedCategory],
    queryFn: () => fetch(`/api/dbt-flashcards/category/${selectedCategory}`).then(res => res.json()),
  });

  const { data: progress = [], isLoading: progressLoading } = useQuery<StudyProgress[]>({
    queryKey: ['/api/dbt-flashcards/progress'],
  });

  const currentCard = flashCards[currentCardIndex];

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % flashCards.length);
    setShowAnswer(false);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + flashCards.length) % flashCards.length);
    setShowAnswer(false);
  };

  const resetCard = () => {
    setShowAnswer(false);
  };

  const categoryProgress = progress.find(p => p.category === selectedCategory);

  if (cardsLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading DBT Flash Cards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className={`max-w-6xl mx-auto ${isMobile ? 'p-4' : 'p-8'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-gray-900 mb-4`}>
            DBT Skills Library
          </h1>
          <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-600 max-w-2xl mx-auto`}>
            Learn and practice Dialectical Behavior Therapy skills with interactive flash cards. 
            Each card explains what the skill is, why it works, and when to use it.
          </p>
        </div>

        {/* Category Selection */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4'}`}>
            {Object.entries(categoryTitles).map(([key, title]) => {
              const IconComponent = categoryIcons[key as keyof typeof categoryIcons];
              return (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className={`${isMobile ? 'flex-col gap-1 p-3' : 'flex items-center gap-2'}`}
                >
                  <IconComponent className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  <span className={isMobile ? 'text-xs' : 'text-sm'}>{title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(categoryTitles).map(([key, title]) => (
            <TabsContent key={key} value={key} className="mt-6">
              {/* Progress Summary */}
              {categoryProgress && (
                <Card className="mb-6">
                  <CardHeader className={isMobile ? 'pb-4' : ''}>
                    <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} flex items-center gap-2`}>
                      Your Progress in {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-3 gap-6'}`}>
                      <div className="text-center">
                        <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-indigo-600`}>
                          {categoryProgress.studied_cards}/{categoryProgress.total_cards}
                        </div>
                        <div className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>Cards Studied</div>
                      </div>
                      <div className="text-center">
                        <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-green-600`}>
                          {Math.round((categoryProgress.studied_cards / categoryProgress.total_cards) * 100)}%
                        </div>
                        <div className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>Complete</div>
                      </div>
                      <div className="text-center">
                        <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-purple-600`}>
                          {categoryProgress.accuracy_percentage || 0}%
                        </div>
                        <div className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>Accuracy</div>
                      </div>
                    </div>
                    <Progress 
                      value={(categoryProgress.studied_cards / categoryProgress.total_cards) * 100} 
                      className="mt-4"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Flash Card */}
              {currentCard && (
                <div className="mb-6">
                  <Card className={`${isMobile ? 'min-h-[400px]' : 'min-h-[500px]'} relative overflow-hidden`}>
                    <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className={`${isMobile ? 'text-lg' : 'text-2xl'} mb-2`}>
                            {currentCard.skill_name}
                          </CardTitle>
                          <Badge 
                            variant="secondary" 
                            className={`${categoryColors[selectedCategory as keyof typeof categoryColors]} ${isMobile ? 'text-xs' : ''}`}
                          >
                            {categoryTitles[selectedCategory as keyof typeof categoryTitles]}
                          </Badge>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`bg-white/20 text-white border-white/30 ${isMobile ? 'text-xs' : ''}`}
                        >
                          {currentCardIndex + 1} of {flashCards.length}
                        </Badge>
                      </div>
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
                              className={`w-full ${isMobile ? 'py-3' : 'py-4'} bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700`}
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
                          disabled={flashCards.length <= 1}
                          className={isMobile ? 'px-3' : ''}
                        >
                          <ChevronLeft className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-1`} />
                          {isMobile ? '' : 'Previous'}
                        </Button>

                        {showAnswer && (
                          <Button
                            variant="outline"
                            onClick={resetCard}
                            className={isMobile ? 'px-3' : ''}
                          >
                            <RotateCcw className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-1`} />
                            {isMobile ? '' : 'Reset'}
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          onClick={nextCard}
                          disabled={flashCards.length <= 1}
                          className={isMobile ? 'px-3' : ''}
                        >
                          {isMobile ? '' : 'Next'}
                          <ChevronRight className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ml-1`} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Skills List for This Category */}
              <Card>
                <CardHeader>
                  <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
                    All {title} Skills
                  </CardTitle>
                  <CardDescription>
                    Browse all available skills in this category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
                    {flashCards.map((card, index) => (
                      <Button
                        key={card.id}
                        variant={index === currentCardIndex ? "default" : "outline"}
                        onClick={() => {
                          setCurrentCardIndex(index);
                          setShowAnswer(false);
                        }}
                        className={`${isMobile ? 'text-left p-3 h-auto' : 'text-left p-4 h-auto'} justify-start`}
                      >
                        <div>
                          <div className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                            {card.skill_name}
                          </div>
                          <div className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-70`}>
                            {card.difficulty_level} level
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}