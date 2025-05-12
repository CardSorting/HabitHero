// SkillsTab Component - UI presentation layer
// Handles the skills section of the diary card

import React, { useState } from 'react';
import { format, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDiary } from '../../../presentation/context/DiaryContext';
import { DateString } from '../../../domain/models';

interface SkillsTabProps {
  dayHeaders: {
    full: string;
    abbr: string;
    date: DateString;
  }[];
  selectedDate: Date;
  viewMode: 'day' | 'week';
}

const SkillsTab: React.FC<SkillsTabProps> = ({ 
  dayHeaders,
  selectedDate,
  viewMode
}) => {
  const { handleSkillChange, getSkillChecked } = useDiary();
  const [activeCategory, setActiveCategory] = useState('mindfulness');
  
  // DBT skills categories
  const skillCategories = {
    mindfulness: {
      label: 'Mindfulness',
      skills: [
        'Wise Mind', 'Observe', 'Describe', 'Participate',
        'Non-judgmental', 'One-mindful', 'Effectiveness'
      ]
    },
    distressTolerance: {
      label: 'Distress Tolerance',
      skills: [
        'STOP skill', 'Pros and Cons', 'TIP skills', 'TIPP skills',
        'Self-soothe', 'IMPROVE the moment', 'Radical acceptance',
        'Willingness'
      ]
    },
    emotionRegulation: {
      label: 'Emotion Regulation',
      skills: [
        'Identify emotions', 'Check the facts', 'Opposite action',
        'Problem solving', 'ABC PLEASE skills', 'Build mastery',
        'Cope ahead'
      ]
    },
    interpersonalEffectiveness: {
      label: 'Interpersonal Effectiveness',
      skills: [
        'DEAR MAN', 'GIVE', 'FAST', 'Validate',
        'Build relationships', 'DIME skills'
      ]
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-primary/10 border-primary">DBT Skills Used</Badge>
            <div className="text-xs text-muted-foreground ml-auto">
              {viewMode === 'day' 
                ? `For ${isToday(selectedDate) ? 'today' : format(selectedDate, 'MMMM d')}` 
                : 'Check skills you used this week'
              }
            </div>
          </div>
          
          <Tabs 
            value={activeCategory} 
            onValueChange={setActiveCategory}
            className="mb-4"
          >
            <TabsList className="grid grid-cols-4 mb-4">
              {Object.entries(skillCategories).map(([key, category]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="text-xs md:text-sm"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <ScrollArea className="h-[calc(100vh-360px)]">
              {Object.entries(skillCategories).map(([key, category]) => (
                <TabsContent key={key} value={key} className="pt-2">
                  {viewMode === 'day' ? (
                    // Day view - simple list with checkboxes
                    <div className="space-y-4">
                      {category.skills.map(skill => (
                        <Card key={skill} className="rounded-xl overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <Checkbox 
                                id={`${key}-${skill}-${format(selectedDate, "yyyy-MM-dd")}`}
                                checked={getSkillChecked(key, skill, format(selectedDate, "yyyy-MM-dd"))}
                                onCheckedChange={(checked) => 
                                  handleSkillChange(key, skill, format(selectedDate, "yyyy-MM-dd"), checked as boolean)
                                }
                              />
                              <label 
                                htmlFor={`${key}-${skill}-${format(selectedDate, "yyyy-MM-dd")}`}
                                className="ml-3 text-base font-medium cursor-pointer"
                              >
                                {skill}
                              </label>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    // Week view - grid with checkboxes
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left font-medium text-sm p-2 w-36">Skill</th>
                            {dayHeaders.map(day => (
                              <th key={day.date} className="text-center font-medium text-xs p-2">
                                <div>{day.abbr}</div>
                                <div className="text-muted-foreground">{format(new Date(day.date), "d")}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {category.skills.map(skill => (
                            <tr key={skill} className="border-t border-muted">
                              <td className="p-2 text-sm font-medium">{skill}</td>
                              {dayHeaders.map(day => (
                                <td key={day.date} className="p-1 text-center">
                                  <Checkbox 
                                    id={`${key}-${skill}-${day.date}`}
                                    checked={getSkillChecked(key, skill, day.date)}
                                    onCheckedChange={(checked) => 
                                      handleSkillChange(key, skill, day.date, checked as boolean)
                                    }
                                    className="mx-auto"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SkillsTab;