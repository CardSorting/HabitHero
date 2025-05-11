import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Target, 
  Sparkles, 
  Heart, 
  CalendarCheck, 
  CheckCircle2,
  ArrowRight, 
  Edit 
} from "lucide-react";

interface DailyGoalTrackerProps {
  className?: string;
}

interface DailyGoalData {
  todayGoal: string;
  tomorrowGoal: string;
  todayHighlight: string;
  gratitude: string;
  dbtSkillUsed: string;
}

const defaultData: DailyGoalData = {
  todayGoal: "",
  tomorrowGoal: "",
  todayHighlight: "",
  gratitude: "",
  dbtSkillUsed: ""
};

// DBT skills for dropdown selection
const dbtSkills = [
  { value: "", label: "Select a skill" },
  // Mindfulness
  { value: "wise-mind", label: "Wise Mind" },
  { value: "observe", label: "Observe: just notice" },
  { value: "describe", label: "Describe: put words on" },
  { value: "participate", label: "Participate" },
  { value: "non-judgmental", label: "Non-judgmental stance" },
  { value: "one-mindfully", label: "One-mindfully: in the moment" },
  { value: "effectiveness", label: "Effectiveness: focus on what works" },
  // Distress Tolerance
  { value: "stop-skill", label: "STOP skill" },
  { value: "pros-cons", label: "Pros and cons" },
  { value: "tip-skills", label: "TIP skills" },
  { value: "improve", label: "IMPROVE the moment" },
  { value: "self-soothing", label: "Self-soothing with senses" },
  { value: "radical-acceptance", label: "Radical acceptance" },
  { value: "willingness", label: "Willingness vs. willfulness" },
  // Emotion Regulation
  { value: "check-facts", label: "Check the facts" },
  { value: "opposite-action", label: "Opposite action" },
  { value: "problem-solving", label: "Problem solving" },
  { value: "abc-please", label: "ABC PLEASE skills" },
  { value: "emotion-mindfulness", label: "Mindfulness of current emotion" },
  { value: "build-mastery", label: "Build mastery" },
  { value: "cope-ahead", label: "Cope ahead" },
  // Interpersonal Effectiveness
  { value: "dearman", label: "DEAR MAN skills" },
  { value: "give", label: "GIVE skills" },
  { value: "fast", label: "FAST skills" }
];

const DailyGoalTracker: React.FC<DailyGoalTrackerProps> = ({ className = "" }) => {
  const [goals, setGoals] = useState<DailyGoalData>(defaultData);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<DailyGoalData>(defaultData);
  const { toast } = useToast();
  
  const today = format(new Date(), "yyyy-MM-dd");
  
  // Load saved goals from local storage
  useEffect(() => {
    const savedGoals = localStorage.getItem(`daily-goals-${today}`);
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
      setFormData(JSON.parse(savedGoals));
    }
  }, [today]);
  
  // Save goals to local storage when they change
  useEffect(() => {
    if (goals.todayGoal || goals.tomorrowGoal || goals.todayHighlight || goals.gratitude || goals.dbtSkillUsed) {
      localStorage.setItem(`daily-goals-${today}`, JSON.stringify(goals));
    }
  }, [goals, today]);
  
  const handleInputChange = (field: keyof DailyGoalData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSave = () => {
    setGoals(formData);
    setEditing(false);
    toast({
      title: "Goals updated",
      description: "Your daily goals and reflections have been saved",
      variant: "default",
      className: "bg-success text-white",
    });
  };
  
  // Get the DBT skill label for display
  const getSkillLabel = (value: string) => {
    const skill = dbtSkills.find(skill => skill.value === value);
    return skill ? skill.label : "";
  };
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Target className="mr-2 h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium">Daily Focus</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(!editing)}
            className="h-8 px-2"
          >
            {editing ? <CheckCircle2 className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
        </div>

        {editing ? (
          <div className="space-y-4 animate-in fade-in-50">
            <div>
              <label className="text-sm font-medium flex items-center mb-2">
                <CalendarCheck className="h-4 w-4 mr-1 text-blue-500" />
                Today's Goal
              </label>
              <Input
                placeholder="What do you want to accomplish today?"
                value={formData.todayGoal}
                onChange={(e) => handleInputChange("todayGoal", e.target.value)}
                className="bg-muted/30"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium flex items-center mb-2">
                <ArrowRight className="h-4 w-4 mr-1 text-orange-500" />
                Tomorrow's Goal
              </label>
              <Input
                placeholder="What's your goal for tomorrow?"
                value={formData.tomorrowGoal}
                onChange={(e) => handleInputChange("tomorrowGoal", e.target.value)}
                className="bg-muted/30"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium flex items-center mb-2">
                <Sparkles className="h-4 w-4 mr-1 text-amber-500" />
                Today's Highlight
              </label>
              <Input
                placeholder="What was the highlight of your day?"
                value={formData.todayHighlight}
                onChange={(e) => handleInputChange("todayHighlight", e.target.value)}
                className="bg-muted/30"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium flex items-center mb-2">
                <Heart className="h-4 w-4 mr-1 text-red-500" />
                Gratitude
              </label>
              <Textarea
                placeholder="What are you grateful for today?"
                value={formData.gratitude}
                onChange={(e) => handleInputChange("gratitude", e.target.value)}
                className="min-h-[80px] bg-muted/30"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium flex items-center mb-2">
                <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                DBT Skill Used Today
              </label>
              <Select
                value={formData.dbtSkillUsed}
                onValueChange={(value) => handleInputChange("dbtSkillUsed", value)}
              >
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="Select a DBT skill you used today" />
                </SelectTrigger>
                <SelectContent>
                  {dbtSkills.map((skill) => (
                    <SelectItem key={skill.value} value={skill.value}>
                      {skill.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-2">
              <Button onClick={handleSave} className="w-full">
                Save Daily Focus
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.todayGoal || goals.tomorrowGoal || goals.todayHighlight || goals.gratitude || goals.dbtSkillUsed ? (
              <>
                {goals.todayGoal && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-blue-50 p-3 rounded-lg"
                  >
                    <div className="text-xs text-blue-600 uppercase font-semibold flex items-center mb-1">
                      <CalendarCheck className="h-3 w-3 mr-1" />
                      Today's Goal
                    </div>
                    <div className="text-sm">{goals.todayGoal}</div>
                  </motion.div>
                )}
                
                {goals.tomorrowGoal && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="bg-orange-50 p-3 rounded-lg"
                  >
                    <div className="text-xs text-orange-600 uppercase font-semibold flex items-center mb-1">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Tomorrow's Goal
                    </div>
                    <div className="text-sm">{goals.tomorrowGoal}</div>
                  </motion.div>
                )}
                
                {goals.todayHighlight && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                    className="bg-amber-50 p-3 rounded-lg"
                  >
                    <div className="text-xs text-amber-600 uppercase font-semibold flex items-center mb-1">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Today's Highlight
                    </div>
                    <div className="text-sm">{goals.todayHighlight}</div>
                  </motion.div>
                )}
                
                {goals.gratitude && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.3 }}
                    className="bg-red-50 p-3 rounded-lg"
                  >
                    <div className="text-xs text-red-600 uppercase font-semibold flex items-center mb-1">
                      <Heart className="h-3 w-3 mr-1" />
                      Gratitude
                    </div>
                    <div className="text-sm">{goals.gratitude}</div>
                  </motion.div>
                )}
                
                {goals.dbtSkillUsed && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.4 }}
                    className="bg-green-50 p-3 rounded-lg"
                  >
                    <div className="text-xs text-green-600 uppercase font-semibold flex items-center mb-1">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      DBT Skill Used
                    </div>
                    <div className="text-sm">{getSkillLabel(goals.dbtSkillUsed)}</div>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-6 text-center"
              >
                <div className="rounded-full bg-muted p-2 mb-3">
                  <Target className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-base font-medium">Set your daily focus</h3>
                <p className="text-muted-foreground text-xs mt-1 max-w-[250px]">
                  Track your goals, highlights, and gratitude to stay mindful throughout your day
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setEditing(true)}>
                  Add today's focus
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </CardContent>
      
      {!editing && (goals.todayGoal || goals.tomorrowGoal || goals.todayHighlight || goals.gratitude || goals.dbtSkillUsed) && (
        <CardFooter className="px-4 py-3 border-t bg-muted/10 flex justify-between">
          <div className="text-xs text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </div>
          <Button variant="ghost" size="sm" className="h-auto p-0" onClick={() => setEditing(true)}>
            <Edit className="h-3 w-3 mr-1" />
            <span className="text-xs">Edit</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default DailyGoalTracker;