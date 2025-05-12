// SleepTab Component - UI presentation layer
// Handles the sleep section of the diary card

import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDiary } from '../../../presentation/context/DiaryContext';
import { DateString } from '../../../domain/models';

interface SleepTabProps {
  dayHeaders: {
    full: string;
    abbr: string;
    date: DateString;
  }[];
  selectedDate: Date;
  viewMode: 'day' | 'week';
}

const SleepTab: React.FC<SleepTabProps> = ({ 
  dayHeaders,
  selectedDate,
  viewMode
}) => {
  const { handleSleepChange, getSleepValue } = useDiary();
  
  // Rating scales options
  const yesNoOptions = ['Yes', 'No'];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-primary/10 border-primary">Quality of Sleep</Badge>
            <div className="text-xs text-muted-foreground ml-auto">
              {viewMode === 'day' 
                ? `For ${isToday(selectedDate) ? 'today' : format(selectedDate, 'MMMM d')}` 
                : 'Record daily to track patterns'
              }
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-6">
              {/* Hours slept section */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-primary">Number of hours slept</h4>
                {viewMode === 'day' ? (
                  // Single day view - larger input
                  <div className="flex flex-col items-center p-6 bg-muted/30 rounded-xl mb-4">
                    <div className="text-sm font-medium mb-2 text-muted-foreground">
                      {format(selectedDate, "EEEE, MMMM d")}
                    </div>
                    <Input 
                      type="text" 
                      className="h-14 text-center text-2xl font-medium w-24 mt-2"
                      placeholder="hrs"
                      value={getSleepValue(format(selectedDate, "yyyy-MM-dd"), 'hoursSlept')}
                      onChange={(e) => handleSleepChange(format(selectedDate, "yyyy-MM-dd"), 'hoursSlept', e.target.value)}
                    />
                    <div className="text-xs text-muted-foreground mt-3">Hours of sleep</div>
                  </div>
                ) : (
                  // Week view - grid of days
                  <div className="grid grid-cols-7 gap-2">
                    {dayHeaders.map(day => {
                      const today = new Date();
                      const isCurrentDay = isSameDay(new Date(day.date), today);
                      return (
                        <div 
                          key={day.date} 
                          className={cn(
                            "flex flex-col items-center",
                            isCurrentDay ? "bg-primary/5 rounded-lg p-1" : ""
                          )}
                        >
                          <div className="text-xs text-muted-foreground mb-1">{day.abbr}</div>
                          <Input 
                            type="text" 
                            className="h-10 text-center text-lg font-medium"
                            placeholder="hrs"
                            value={getSleepValue(day.date, 'hoursSlept')}
                            onChange={(e) => handleSleepChange(day.date, 'hoursSlept', e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Sleep issues section with Apple Health-inspired cards */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-primary">Sleep Issues</h4>
                {viewMode === 'day' ? (
                  // Day view - vertical stacked cards
                  <div className="space-y-4">
                    {/* Trouble falling asleep */}
                    <Card className="rounded-xl overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <h5 className="text-base font-medium">Trouble falling asleep</h5>
                          <Select 
                            value={getSleepValue(format(selectedDate, "yyyy-MM-dd"), 'troubleFalling')}
                            onValueChange={(value) => handleSleepChange(format(selectedDate, "yyyy-MM-dd"), 'troubleFalling', value)}
                          >
                            <SelectTrigger className="w-24 h-9">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {yesNoOptions.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Trouble staying asleep */}
                    <Card className="rounded-xl overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <h5 className="text-base font-medium">Trouble staying asleep</h5>
                          <Select 
                            value={getSleepValue(format(selectedDate, "yyyy-MM-dd"), 'troubleStaying')}
                            onValueChange={(value) => handleSleepChange(format(selectedDate, "yyyy-MM-dd"), 'troubleStaying', value)}
                          >
                            <SelectTrigger className="w-24 h-9">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {yesNoOptions.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Trouble waking up */}
                    <Card className="rounded-xl overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <h5 className="text-base font-medium">Trouble waking up</h5>
                          <Select 
                            value={getSleepValue(format(selectedDate, "yyyy-MM-dd"), 'troubleWaking')}
                            onValueChange={(value) => handleSleepChange(format(selectedDate, "yyyy-MM-dd"), 'troubleWaking', value)}
                          >
                            <SelectTrigger className="w-24 h-9">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {yesNoOptions.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  // Week view - horizontal grid of cards
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Trouble falling asleep */}
                    <Card className="rounded-xl overflow-hidden">
                      <CardContent className="p-3">
                        <h5 className="text-sm font-medium mb-2">Trouble falling asleep</h5>
                        <div className="grid grid-cols-7 gap-1">
                          {dayHeaders.map(day => (
                            <div key={day.date} className="flex flex-col items-center">
                              <div className="text-xs text-muted-foreground mb-1">{format(new Date(day.date), "d")}</div>
                              <Select 
                                value={getSleepValue(day.date, 'troubleFalling')}
                                onValueChange={(value) => handleSleepChange(day.date, 'troubleFalling', value)}
                              >
                                <SelectTrigger className="h-8 w-full border-dashed">
                                  <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent>
                                  {yesNoOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Trouble staying asleep */}
                    <Card className="rounded-xl overflow-hidden">
                      <CardContent className="p-3">
                        <h5 className="text-sm font-medium mb-2">Trouble staying asleep</h5>
                        <div className="grid grid-cols-7 gap-1">
                          {dayHeaders.map(day => (
                            <div key={day.date} className="flex flex-col items-center">
                              <div className="text-xs text-muted-foreground mb-1">{format(new Date(day.date), "d")}</div>
                              <Select 
                                value={getSleepValue(day.date, 'troubleStaying')}
                                onValueChange={(value) => handleSleepChange(day.date, 'troubleStaying', value)}
                              >
                                <SelectTrigger className="h-8 w-full border-dashed">
                                  <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent>
                                  {yesNoOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Trouble waking up */}
                    <Card className="rounded-xl overflow-hidden">
                      <CardContent className="p-3">
                        <h5 className="text-sm font-medium mb-2">Trouble waking up</h5>
                        <div className="grid grid-cols-7 gap-1">
                          {dayHeaders.map(day => (
                            <div key={day.date} className="flex flex-col items-center">
                              <div className="text-xs text-muted-foreground mb-1">{format(new Date(day.date), "d")}</div>
                              <Select 
                                value={getSleepValue(day.date, 'troubleWaking')}
                                onValueChange={(value) => handleSleepChange(day.date, 'troubleWaking', value)}
                              >
                                <SelectTrigger className="h-8 w-full border-dashed">
                                  <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent>
                                  {yesNoOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SleepTab;