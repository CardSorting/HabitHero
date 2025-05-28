import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface FlashCardCategoryProps {
  category: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    cardCount: number;
  };
  onClick: () => void;
}

export const FlashCardCategory: React.FC<FlashCardCategoryProps> = ({ category, onClick }) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={onClick}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${category.color} text-white group-hover:scale-110 transition-transform`}>
            {category.icon}
          </div>
          <Badge variant="secondary" className="text-xs">
            {category.cardCount} cards
          </Badge>
        </div>
        <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
          {category.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {category.description}
        </p>
        <Button 
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Play className="mr-2 h-4 w-4" />
          Start Studying
        </Button>
      </CardContent>
    </Card>
  );
};