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
    <Card className="hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer group border-gray-200 hover:border-blue-300" onClick={onClick}>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 sm:p-3 rounded-lg ${category.color} text-white group-hover:scale-110 transition-transform shadow-sm`}>
            {category.icon}
          </div>
          <Badge variant="secondary" className="text-xs font-medium bg-gray-100 text-gray-700">
            {category.cardCount} cards
          </Badge>
        </div>
        <CardTitle className="text-base sm:text-lg font-semibold group-hover:text-blue-600 transition-colors leading-tight">
          {category.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3 sm:space-y-4">
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {category.description}
        </p>
        <Button 
          className="w-full h-10 sm:h-11 text-sm font-medium bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Play className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Start Studying
        </Button>
      </CardContent>
    </Card>
  );
};