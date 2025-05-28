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
            id: '11',
            front: 'What does PLEASE stand for in emotion regulation?',
            back: 'PL: Treat Physical illness, E: Balance Eating, A: Avoid mood-Altering substances, S: Balance Sleep, E: Get Exercise',
            category: 'emotion_regulation',
            difficulty: 'hard'
          },
          {
            id: '12',
            front: 'What is opposite action?',
            back: 'Act opposite to your emotion\'s action urge when the emotion doesn\'t fit the facts or is unhelpful.',
            category: 'emotion_regulation',
            difficulty: 'medium'
          }
        ],
        interpersonal_effectiveness: [
          {
            id: '13',
            front: 'What does DEAR MAN help with?',
            back: 'Getting what you want from others - asking for something or saying no effectively.',
            category: 'interpersonal_effectiveness',
            difficulty: 'medium'
          },
          {
            id: '14',
            front: 'What does the D in DEAR MAN stand for?',
            back: 'Describe - Describe the situation using facts, not interpretations.',
            category: 'interpersonal_effectiveness',
            difficulty: 'easy'
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onExit}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
          <div className="text-center">
            <h2 className="font-semibold capitalize">{category.replace('_', ' ')}</h2>
            <p className="text-sm text-gray-500">
              {currentIndex + 1} of {cards.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {studiedCards.size}/{cards.length} studied
            </Badge>
          </div>
        </div>
        <div className="mt-3">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Flash Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div 
            className="relative h-80 sm:h-96 cursor-pointer perspective-1000"
            onClick={handleFlip}
          >
            <Card className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front of card */}
              <div className="absolute inset-0 backface-hidden">
                <CardContent className="h-full flex flex-col justify-between p-6">
                  <div className="flex items-start justify-between">
                    <Badge className={`${getDifficultyColor(currentCard.difficulty)} text-white text-xs`}>
                      {currentCard.difficulty}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center text-center">
                    <p className="text-lg sm:text-xl font-medium leading-relaxed">
                      {currentCard.front}
                    </p>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500">
                    Tap to reveal answer
                  </div>
                </CardContent>
              </div>

              {/* Back of card */}
              <div className="absolute inset-0 backface-hidden rotate-y-180">
                <CardContent className="h-full flex flex-col justify-between p-6 bg-blue-50">
                  <div className="flex items-start justify-between">
                    <Badge className={`${getDifficultyColor(currentCard.difficulty)} text-white text-xs`}>
                      {currentCard.difficulty}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center text-center">
                    <p className="text-base sm:text-lg leading-relaxed">
                      {currentCard.back}
                    </p>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500">
                    How well did you know this?
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            {!isFlipped ? (
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button onClick={handleFlip} className="px-8">
                  Reveal Answer
                </Button>
                <Button variant="outline" onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleIncorrect} className="text-red-600 border-red-200 hover:bg-red-50">
                  <X className="mr-2 h-4 w-4" />
                  Didn't Know It
                </Button>
                <Button onClick={handleCorrect} className="bg-green-600 hover:bg-green-700 text-white">
                  <Check className="mr-2 h-4 w-4" />
                  Got It Right
                </Button>
              </div>
            )}
          </div>

          {/* Study Stats */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Correct: {correctCards.size} | Studied: {studiedCards.size} | Remaining: {cards.length - studiedCards.size}</p>
          </div>
        </div>
      </div>
    </div>
  );
};