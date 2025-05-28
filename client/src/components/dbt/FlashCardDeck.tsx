import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Check, 
  X, 
  Star,
  Volume2,
  BookOpen
} from 'lucide-react';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isFavorite?: boolean;
}

interface FlashCardDeckProps {
  category: string;
  onExit: () => void;
}

export const FlashCardDeck: React.FC<FlashCardDeckProps> = ({ category, onExit }) => {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set());
  const [correctCards, setCorrectCards] = useState<Set<string>>(new Set());

  // Comprehensive DBT skills flash cards
  useEffect(() => {
    const getCardsForCategory = (cat: string): FlashCard[] => {
      const cardSets: Record<string, FlashCard[]> = {
        mindfulness: [
          {
            id: '1',
            front: 'What does OBSERVE mean in mindfulness?',
            back: 'Notice what is happening right now. Pay attention to your thoughts, feelings, and sensations without trying to change them. Just notice without getting caught up in them.',
            category: 'mindfulness',
            difficulty: 'easy'
          },
          {
            id: '2',
            front: 'What does DESCRIBE mean in mindfulness?',
            back: 'Put words on your experience. Describe what you observe without judgments or interpretations. Stick to the facts - what, when, where.',
            category: 'mindfulness',
            difficulty: 'easy'
          },
          {
            id: '3',
            front: 'What does PARTICIPATE mean in mindfulness?',
            back: 'Throw yourself completely into activities. Be one with whatever you are doing. Don\'t hold back - become the activity.',
            category: 'mindfulness',
            difficulty: 'medium'
          },
          {
            id: '4',
            front: 'What does NON-JUDGMENTALLY mean?',
            back: 'See but don\'t evaluate. Take a non-judgmental stance. Accept each moment without evaluating it as good or bad.',
            category: 'mindfulness',
            difficulty: 'medium'
          },
          {
            id: '5',
            front: 'What does ONE-MINDFULLY mean?',
            back: 'Do one thing at a time. Focus your attention on the present moment and current activity. When you are eating, eat. When walking, walk.',
            category: 'mindfulness',
            difficulty: 'medium'
          },
          {
            id: '6',
            front: 'What does EFFECTIVELY mean in mindfulness?',
            back: 'Focus on what works. Do what needs to be done in each situation. Keep your eyes on your goals.',
            category: 'mindfulness',
            difficulty: 'hard'
          },
          {
            id: '7',
            front: 'What is Wise Mind?',
            back: 'The integration of emotional mind and reasonable mind. It\'s the part of you that knows what is true and effective. It sees the whole picture.',
            category: 'mindfulness',
            difficulty: 'medium'
          },
          {
            id: '8',
            front: 'What is Emotional Mind?',
            back: 'When emotions control your thinking and behavior. Facts are irrelevant, and you act based on how you feel in the moment.',
            category: 'mindfulness',
            difficulty: 'easy'
          },
          {
            id: '9',
            front: 'What is Reasonable Mind?',
            back: 'When you are thinking logically and focusing on facts. Emotions are irrelevant, and you approach things intellectually.',
            category: 'mindfulness',
            difficulty: 'easy'
          },
          {
            id: '10',
            front: 'Name a mindfulness breathing technique',
            back: 'Box breathing: Breathe in for 4 counts, hold for 4, breathe out for 4, hold for 4. Or simply focus on the sensation of breath entering and leaving your nostrils.',
            category: 'mindfulness',
            difficulty: 'easy'
          }
        ],
        distress_tolerance: [
          {
            id: '11',
            front: 'What does the T in TIPP stand for?',
            back: 'Temperature - Change your body temperature quickly (cold water on face/hands, ice cubes, hot shower). This activates the dive response to quickly calm intense emotions.',
            category: 'distress_tolerance',
            difficulty: 'easy'
          },
          {
            id: '12',
            front: 'What does the I in TIPP stand for?',
            back: 'Intense Exercise - Do intense exercise for a short period (10-15 minutes). This burns off stress chemicals and changes body chemistry.',
            category: 'distress_tolerance',
            difficulty: 'easy'
          },
          {
            id: '13',
            front: 'What does the first P in TIPP stand for?',
            back: 'Paced Breathing - Breathe out longer than you breathe in. Try breathing in for 4 counts, out for 6 counts.',
            category: 'distress_tolerance',
            difficulty: 'medium'
          },
          {
            id: '14',
            front: 'What does the second P in TIPP stand for?',
            back: 'Paired Muscle Relaxation - Tense and relax different muscle groups, starting with toes and working up to head.',
            category: 'distress_tolerance',
            difficulty: 'medium'
          },
          {
            id: '15',
            front: 'What does ACCEPTS stand for?',
            back: 'Activities, Contributing, Comparisons, Emotions (opposite), Push away, Thoughts (other), Sensations. These are distracting techniques for crisis situations.',
            category: 'distress_tolerance',
            difficulty: 'hard'
          },
          {
            id: '16',
            front: 'What does the A in ACCEPTS mean?',
            back: 'Activities - Engage in activities that require thought and attention to distract from distressing emotions.',
            category: 'distress_tolerance',
            difficulty: 'easy'
          },
          {
            id: '17',
            front: 'What does IMPROVE stand for?',
            back: 'Imagery, Meaning, Prayer, Relaxation, One thing at a time, Vacation, Encouragement. These help improve the moment during distress.',
            category: 'distress_tolerance',
            difficulty: 'hard'
          },
          {
            id: '18',
            front: 'What is Radical Acceptance?',
            back: 'Completely accepting reality as it is, without fighting it. Accepting doesn\'t mean approving - it means stopping the struggle against what you cannot change.',
            category: 'distress_tolerance',
            difficulty: 'hard'
          },
          {
            id: '19',
            front: 'What is Distress Tolerance?',
            back: 'The ability to survive crisis situations without making them worse through impulsive actions. It\'s about getting through the moment safely.',
            category: 'distress_tolerance',
            difficulty: 'medium'
          },
          {
            id: '20',
            front: 'Name three self-soothing techniques using senses',
            back: 'Vision: Look at beautiful images. Hearing: Listen to soothing music. Touch: Take a warm bath, pet an animal. Smell: Light a candle. Taste: Drink tea, eat something comforting.',
            category: 'distress_tolerance',
            difficulty: 'easy'
          }
        ],
        emotion_regulation: [
          {
            id: '21',
            front: 'What does PLEASE stand for in emotion regulation?',
            back: 'PL: Treat Physical illness, E: Balance Eating, A: Avoid mood-Altering substances, S: Balance Sleep, E: Get Exercise. This helps reduce vulnerability to intense emotions.',
            category: 'emotion_regulation',
            difficulty: 'hard'
          },
          {
            id: '22',
            front: 'What is opposite action?',
            back: 'Act opposite to your emotion\'s action urge when the emotion doesn\'t fit the facts or is unhelpful. If you feel like isolating when sad, reach out to others instead.',
            category: 'emotion_regulation',
            difficulty: 'medium'
          },
          {
            id: '23',
            front: 'What are the functions of emotions?',
            back: 'Emotions communicate to others, motivate behavior, give us information about situations, and can influence/control others\' behavior.',
            category: 'emotion_regulation',
            difficulty: 'medium'
          },
          {
            id: '24',
            front: 'What is emotion surfing?',
            back: 'Riding out an emotional wave without acting on it. Emotions naturally rise, peak, and fall - like waves in the ocean.',
            category: 'emotion_regulation',
            difficulty: 'easy'
          },
          {
            id: '25',
            front: 'What does TIPP stand for when managing intense emotions?',
            back: 'Temperature, Intense exercise, Paced breathing, Paired muscle relaxation. These quickly change your body chemistry to reduce emotional intensity.',
            category: 'emotion_regulation',
            difficulty: 'medium'
          },
          {
            id: '26',
            front: 'What is emotional validation?',
            back: 'Acknowledging and accepting emotions as valid responses, even if you don\'t like them. "It makes sense that I feel this way given the situation."',
            category: 'emotion_regulation',
            difficulty: 'easy'
          },
          {
            id: '27',
            front: 'When should you use opposite action?',
            back: 'When the emotion doesn\'t fit the facts, when acting on the emotion would be ineffective, or when the intensity is too high for the situation.',
            category: 'emotion_regulation',
            difficulty: 'hard'
          },
          {
            id: '28',
            front: 'What is the goal of emotion regulation?',
            back: 'Not to eliminate emotions, but to reduce emotional suffering and increase emotional choices. You want to be able to experience emotions without being controlled by them.',
            category: 'emotion_regulation',
            difficulty: 'medium'
          }
        ],
        interpersonal_effectiveness: [
          {
            id: '29',
            front: 'What does DEAR MAN help with?',
            back: 'Getting what you want from others - asking for something or saying no effectively while maintaining relationships and self-respect.',
            category: 'interpersonal_effectiveness',
            difficulty: 'medium'
          },
          {
            id: '30',
            front: 'What does the D in DEAR MAN stand for?',
            back: 'Describe - Describe the situation using facts, not interpretations. Stick to what happened without adding your opinions.',
            category: 'interpersonal_effectiveness',
            difficulty: 'easy'
          },
          {
            id: '31',
            front: 'What does the E in DEAR MAN stand for?',
            back: 'Express - Express your feelings and opinions about the situation. Use "I" statements.',
            category: 'interpersonal_effectiveness',
            difficulty: 'easy'
          },
          {
            id: '32',
            front: 'What does the A in DEAR MAN stand for?',
            back: 'Assert - Ask for what you want or say no clearly. Don\'t assume others know what you want.',
            category: 'interpersonal_effectiveness',
            difficulty: 'medium'
          },
          {
            id: '33',
            front: 'What does the R in DEAR MAN stand for?',
            back: 'Reinforce - Explain the positive consequences of getting what you want or the negative consequences of not getting it.',
            category: 'interpersonal_effectiveness',
            difficulty: 'medium'
          },
          {
            id: '34',
            front: 'What does GIVE stand for?',
            back: 'Gentle, Interested, Validate, Easy manner. These help maintain relationships while being assertive.',
            category: 'interpersonal_effectiveness',
            difficulty: 'hard'
          },
          {
            id: '35',
            front: 'What does FAST stand for?',
            back: 'Fair, no Apologies, Stick to values, Truthful. These help maintain self-respect in interactions.',
            category: 'interpersonal_effectiveness',
            difficulty: 'hard'
          },
          {
            id: '36',
            front: 'What are the three goals of interpersonal effectiveness?',
            back: '1. Get what you want (objective effectiveness), 2. Maintain the relationship, 3. Maintain self-respect.',
            category: 'interpersonal_effectiveness',
            difficulty: 'medium'
          },
          {
            id: '37',
            front: 'What does "Mindful" mean in DEAR MAN?',
            back: 'Stay focused on your goal. Don\'t get distracted by attacks, threats, or attempts to change the subject.',
            category: 'interpersonal_effectiveness',
            difficulty: 'medium'
          },
          {
            id: '38',
            front: 'What does "Appear confident" mean in DEAR MAN?',
            back: 'Use confident body language, eye contact, and tone of voice. Act as if you expect to get what you\'re asking for.',
            category: 'interpersonal_effectiveness',
            difficulty: 'easy'
          },
          {
            id: '39',
            front: 'What does "Negotiate" mean in DEAR MAN?',
            back: 'Be willing to give to get. Offer alternative solutions and ask what would work for the other person.',
            category: 'interpersonal_effectiveness',
            difficulty: 'medium'
          }
        ]
      };

      return cardSets[cat] || cardSets.mindfulness;
    };

    setCards(getCardsForCategory(category));
  }, [category]);

  const currentCard = cards[currentIndex];
  const progress = (studiedCards.size / cards.length) * 100;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped && currentCard) {
      setStudiedCards(prev => new Set(prev).add(currentCard.id));
    }
  };

  const handleCorrect = () => {
    if (currentCard) {
      setCorrectCards(prev => new Set(prev).add(currentCard.id));
    }
    handleNext();
  };

  const handleIncorrect = () => {
    handleNext();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Loading Flash Cards...</h3>
            <Button onClick={onExit}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-3 sm:px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onExit} className="h-9 px-2 sm:px-3">
            <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Back to Library</span>
            <span className="xs:hidden">Back</span>
          </Button>
          <div className="text-center flex-1 mx-2">
            <h2 className="font-semibold text-sm sm:text-base capitalize">{category.replace('_', ' ')}</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              {currentIndex + 1} of {cards.length}
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge variant="secondary" className="text-xs px-2 py-1">
              <span className="hidden xs:inline">{studiedCards.size}/{cards.length} studied</span>
              <span className="xs:hidden">{studiedCards.size}/{cards.length}</span>
            </Badge>
          </div>
        </div>
        <div className="mt-3">
          <Progress value={progress} className="h-2 bg-gray-200" />
        </div>
      </div>

      {/* Flash Card */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-2xl">
          <div 
            className="relative h-72 xs:h-80 sm:h-96 cursor-pointer perspective-1000 active:scale-95 transition-transform"
            onClick={handleFlip}
          >
            <Card className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d shadow-lg hover:shadow-xl ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front of card */}
              <div className="absolute inset-0 backface-hidden">
                <CardContent className="h-full flex flex-col justify-between p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${getDifficultyColor(currentCard.difficulty)} text-white text-xs px-2 py-1 font-medium`}>
                      {currentCard.difficulty}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                      <Star className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center text-center px-2">
                    <p className="text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-gray-800">
                      {currentCard.front}
                    </p>
                  </div>
                  
                  <div className="text-center text-xs sm:text-sm text-gray-500 mt-2 flex items-center justify-center gap-2">
                    <div className="w-8 h-1 bg-gray-300 rounded-full animate-pulse"></div>
                    <span>Tap to reveal answer</span>
                    <div className="w-8 h-1 bg-gray-300 rounded-full animate-pulse"></div>
                  </div>
                </CardContent>
              </div>

              {/* Back of card */}
              <div className="absolute inset-0 backface-hidden rotate-y-180">
                <CardContent className="h-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${getDifficultyColor(currentCard.difficulty)} text-white text-xs px-2 py-1 font-medium`}>
                      {currentCard.difficulty}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100">
                      <Volume2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center text-center px-2">
                    <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-gray-700">
                      {currentCard.back}
                    </p>
                  </div>
                  
                  <div className="text-center text-xs sm:text-sm text-gray-600 mt-2 font-medium">
                    How well did you know this?
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>

          {/* Controls */}
          <div className="mt-4 sm:mt-6 px-2">
            {!isFlipped ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex gap-2 sm:gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    className="flex-1 h-11 sm:h-10 text-sm font-medium border-gray-300 hover:border-gray-400"
                  >
                    <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                    <span className="hidden xs:inline">Previous</span>
                    <span className="xs:hidden">Prev</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleNext}
                    className="flex-1 h-11 sm:h-10 text-sm font-medium border-gray-300 hover:border-gray-400"
                  >
                    <span className="hidden xs:inline">Next</span>
                    <span className="xs:hidden">Next</span>
                    <ArrowRight className="ml-1 sm:ml-2 h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleFlip} 
                  className="h-11 sm:h-10 px-6 sm:px-8 text-sm font-medium bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Reveal Answer
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4 sm:justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleIncorrect} 
                  className="h-11 sm:h-10 text-sm font-medium text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <X className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Didn't Know It</span>
                  <span className="xs:hidden">Wrong</span>
                </Button>
                <Button 
                  onClick={handleCorrect} 
                  className="h-11 sm:h-10 text-sm font-medium bg-green-600 hover:bg-green-700 text-white shadow-sm"
                >
                  <Check className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Got It Right</span>
                  <span className="xs:hidden">Correct</span>
                </Button>
              </div>
            )}
          </div>

          {/* Study Stats */}
          <div className="mt-4 sm:mt-6 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 mx-2">
              <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-600">{correctCards.size}</div>
                  <div className="text-gray-500">Correct</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{studiedCards.size}</div>
                  <div className="text-gray-500">Studied</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-600">{cards.length - studiedCards.size}</div>
                  <div className="text-gray-500">Remaining</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};