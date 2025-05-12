import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PageTransition } from "@/components/page-transition";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Heart, 
  Brain, 
  BookOpen, 
  Activity,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

/**
 * Page to browse challenges within a specific category
 */
const WellnessChallengeCategory: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/wellness-challenges/categories/:category");
  const category = params?.category || "";
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Format the category name for display
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
  
  // Icon and style mapping based on category
  const getCategoryStyles = () => {
    switch (category) {
      case "emotions":
        return { 
          icon: <Heart className="h-6 w-6 text-red-500" />, 
          color: "bg-red-100",
          textColor: "text-red-500",
          borderColor: "border-red-400" 
        };
      case "meditation":
        return { 
          icon: <Brain className="h-6 w-6 text-blue-500" />, 
          color: "bg-blue-100",
          textColor: "text-blue-500",
          borderColor: "border-blue-400" 
        };
      case "journaling":
        return { 
          icon: <BookOpen className="h-6 w-6 text-green-500" />, 
          color: "bg-green-100",
          textColor: "text-green-500",
          borderColor: "border-blue-400" 
        };
      case "activity":
        return { 
          icon: <Activity className="h-6 w-6 text-orange-500" />, 
          color: "bg-orange-100",
          textColor: "text-orange-500",
          borderColor: "border-orange-400" 
        };
      default:
        return { 
          icon: <Heart className="h-6 w-6 text-gray-500" />, 
          color: "bg-gray-100",
          textColor: "text-gray-500",
          borderColor: "border-gray-400" 
        };
    }
  };
  
  const categoryStyles = getCategoryStyles();
  
  // Get challenges for the category
  const getChallenges = () => {
    switch (category) {
      case "emotions":
        return [
          {
            id: 1,
            title: "Daily Gratitude Practice",
            description: "Write down three things you are grateful for each day to build a positive mindset",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 3,
            active: false
          },
          {
            id: 2,
            title: "Emotion Tracking",
            description: "Record your emotions throughout the day and identify patterns in your mood",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "2 minutes",
            target: 5,
            active: true
          },
          {
            id: 101,
            title: "Positive Affirmations",
            description: "Repeat three positive affirmations each morning to start your day with confidence",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "2 minutes",
            target: 3,
            active: false
          },
          {
            id: 102,
            title: "Joy Journal",
            description: "Document one moment of joy each day, no matter how small it might seem",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 1,
            active: false
          },
          {
            id: 103,
            title: "Compassion Practice",
            description: "Perform one act of kindness or compassion daily for yourself or others",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "Varies",
            target: 1,
            active: false
          },
          {
            id: 104,
            title: "Emotional Vocabulary",
            description: "Learn and use one new emotion word each day to better express your feelings",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "5 minutes",
            target: 1,
            active: false
          },
          {
            id: 105,
            title: "Worry Time",
            description: "Schedule 10 minutes to write down all your worries, then set them aside",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 106,
            title: "Weekly Emotion Review",
            description: "Reflect on the patterns in your emotions to identify triggers and responses",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 107,
            title: "Compliment Practice",
            description: "Give three sincere compliments each day to boost others' confidence",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 3,
            active: false
          },
          {
            id: 108,
            title: "Anger Management",
            description: "Practice a calming technique each time you feel angry or frustrated",
            frequency: "As needed",
            difficulty: "Hard",
            duration: "5 minutes",
            target: 1,
            active: false
          },
          {
            id: 109,
            title: "Gratitude Letters",
            description: "Write one letter of gratitude each week to someone who has positively impacted you",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 1,
            active: false
          },
          {
            id: 110,
            title: "Emotion Weather Report",
            description: "Check in with your emotional state three times daily, like a weather report",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "1 minute",
            target: 3,
            active: false
          },
          {
            id: 111,
            title: "Boundary Setting",
            description: "Practice setting one healthy boundary each day to protect your emotional wellbeing",
            frequency: "Daily",
            difficulty: "Hard",
            duration: "Varies",
            target: 1,
            active: false
          },
          {
            id: 112,
            title: "Celebration Journal",
            description: "Document one personal achievement each day, no matter how small",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 1,
            active: false
          },
          {
            id: 113,
            title: "Self-Compassion Break",
            description: "Take a 5-minute self-compassion break when facing difficulty or stress",
            frequency: "As needed",
            difficulty: "Medium",
            duration: "5 minutes",
            target: 1,
            active: false
          },
          {
            id: 114,
            title: "Emotional Releasing",
            description: "Spend 10 minutes safely expressing and releasing difficult emotions",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 115,
            title: "Thankfulness Meditation",
            description: "Meditate on three things you're thankful for to cultivate gratitude",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 116,
            title: "Pleasure Savoring",
            description: "Fully savor and appreciate one pleasurable moment each day",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 1,
            active: false
          },
          {
            id: 117,
            title: "Value Alignment",
            description: "Perform one action each day that aligns with your core values",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "Varies",
            target: 1,
            active: false
          },
          {
            id: 118,
            title: "Emotional Support",
            description: "Reach out for or offer emotional support once each day",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 119,
            title: "Empathy Practice",
            description: "Practice putting yourself in someone else's position once daily",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "5 minutes",
            target: 1,
            active: false
          },
          {
            id: 120,
            title: "Laughter Therapy",
            description: "Find something that makes you genuinely laugh each day",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 1,
            active: false
          },
          {
            id: 121,
            title: "Feeling Identification",
            description: "Name your feelings throughout the day to increase emotional awareness",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "All day",
            target: 5,
            active: false
          },
          {
            id: 122,
            title: "Stress Inventory",
            description: "List your stressors weekly and identify which ones you can control",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 123,
            title: "Emotional Intelligence Reading",
            description: "Read about emotional intelligence for 10 minutes daily",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "10 minutes",
            target: 1,
            active: false
          }
        ];
      case "meditation":
        return [
          {
            id: 3,
            title: "Morning Mindfulness",
            description: "Start your day with 10 minutes of mindful breathing to set a calm intention",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 4,
            title: "Breath Awareness",
            description: "Practice focusing on your breath for 5 minutes to reduce stress and anxiety",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 5,
            active: true
          },
          {
            id: 201,
            title: "Body Scan Meditation",
            description: "Progressively relax your body by mentally scanning from head to toe",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 202,
            title: "Loving-Kindness Meditation",
            description: "Cultivate feelings of goodwill toward yourself and others",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 203,
            title: "Walking Meditation",
            description: "Practice mindfulness while walking slowly and deliberately",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 204,
            title: "Gratitude Meditation",
            description: "Focus on things you're grateful for during meditation",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 205,
            title: "Sound Meditation",
            description: "Use sounds as the focus of your attention during meditation",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 206,
            title: "Visualization Meditation",
            description: "Create mental images that promote relaxation and positive emotions",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 207,
            title: "Mantra Meditation",
            description: "Repeat a calming word or phrase to focus your mind",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 208,
            title: "Chakra Meditation",
            description: "Focus on balancing energy centers in the body",
            frequency: "Daily",
            difficulty: "Hard",
            duration: "20 minutes",
            target: 20,
            active: false
          },
          {
            id: 209,
            title: "Five Senses Meditation",
            description: "Systematically focus on each of your five senses",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 210,
            title: "Mindful Eating",
            description: "Eat one meal daily with complete mindful awareness",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 211,
            title: "Evening Wind-Down",
            description: "Practice a calming meditation before sleep",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 212,
            title: "Mindful Movement",
            description: "Combine gentle movement with mindfulness",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 213,
            title: "Emotional Awareness Meditation",
            description: "Observe emotions arising without judgment",
            frequency: "Daily",
            difficulty: "Hard",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 214,
            title: "Thought Observation",
            description: "Watch thoughts come and go without engaging with them",
            frequency: "Daily",
            difficulty: "Hard",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 215,
            title: "Counting Breaths",
            description: "Count each breath cycle up to ten, then start over",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 5,
            active: false
          },
          {
            id: 216,
            title: "Three-Minute Breathing Space",
            description: "Take short meditation breaks throughout the day",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "3 minutes",
            target: 3,
            active: false
          },
          {
            id: 217,
            title: "Compassion Meditation",
            description: "Develop compassion for yourself and others through meditation",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 218,
            title: "Candle Gazing",
            description: "Focus on a candle flame to develop concentration",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 219,
            title: "Nature Connection",
            description: "Meditate outdoors while connecting with natural surroundings",
            frequency: "Weekly",
            difficulty: "Easy",
            duration: "20 minutes",
            target: 20,
            active: false
          },
          {
            id: 220,
            title: "Self-Compassion Meditation",
            description: "Focus on sending kindness to yourself when facing difficulties",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 221,
            title: "Tension Release",
            description: "Progressively tense and release muscle groups",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 222,
            title: "Zen Counting",
            description: "Count from one to ten repeatedly, focusing solely on the numbers",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 223,
            title: "Guided Meditation",
            description: "Follow along with a guided meditation recording",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "15 minutes",
            target: 15,
            active: false
          }
        ];
      case "journaling":
        return [
          {
            id: 5,
            title: "Evening Reflection",
            description: "Write about your day, focusing on what went well and what you learned",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 6,
            title: "Thought Reframing",
            description: "Identify negative thoughts and practice reframing them in a more balanced way",
            frequency: "Daily",
            difficulty: "Hard",
            duration: "15 minutes",
            target: 3,
            active: false
          },
          {
            id: 301,
            title: "Morning Pages",
            description: "Write three pages of stream-of-consciousness thoughts each morning",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 3,
            active: false
          },
          {
            id: 302,
            title: "Gratitude Journal",
            description: "List three things you're grateful for and why they matter to you",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 3,
            active: false
          },
          {
            id: 303,
            title: "Goal Setting Journal",
            description: "Write down your daily, weekly, and monthly goals",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 304,
            title: "Dream Journal",
            description: "Record your dreams upon waking to identify patterns and insights",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 305,
            title: "Shadow Work Journal",
            description: "Explore and integrate aspects of yourself you typically avoid",
            frequency: "Weekly",
            difficulty: "Hard",
            duration: "30 minutes",
            target: 1,
            active: false
          },
          {
            id: 306,
            title: "Forgiveness Letters",
            description: "Write letters you don't send to release resentment and practice forgiveness",
            frequency: "Weekly",
            difficulty: "Hard",
            duration: "20 minutes",
            target: 1,
            active: false
          },
          {
            id: 307,
            title: "Values Journaling",
            description: "Explore and clarify your core values through writing",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 1,
            active: false
          },
          {
            id: 308,
            title: "Worry Download",
            description: "Write down all your worries to get them out of your head",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 309,
            title: "Accomplishment Journal",
            description: "Record three achievements each day, no matter how small",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 3,
            active: false
          },
          {
            id: 310,
            title: "Letter to Your Future Self",
            description: "Write a letter to your future self about your hopes and dreams",
            frequency: "Monthly",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 1,
            active: false
          },
          {
            id: 311,
            title: "Emotional Release Writing",
            description: "Write freely about difficult emotions, then destroy the pages",
            frequency: "As needed",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 312,
            title: "Fictional Storytelling",
            description: "Create fictional stories to express emotions and explore possibilities",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 1,
            active: false
          },
          {
            id: 313,
            title: "Mindful Moment Journal",
            description: "Record one moment of mindfulness or presence each day",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 1,
            active: false
          },
          {
            id: 314,
            title: "Self-Compassion Writing",
            description: "Write to yourself with the kindness you would show a good friend",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 315,
            title: "Prompt Journal",
            description: "Respond to a different thought-provoking prompt each day",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 316,
            title: "Decision Journal",
            description: "Document important decisions and your reasoning process",
            frequency: "As needed",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 317,
            title: "Identity Exploration",
            description: "Write about different aspects of your identity and how they shape you",
            frequency: "Weekly",
            difficulty: "Hard",
            duration: "20 minutes",
            target: 1,
            active: false
          },
          {
            id: 318,
            title: "Conflict Resolution Journal",
            description: "Work through interpersonal conflicts by writing about different perspectives",
            frequency: "As needed",
            difficulty: "Hard",
            duration: "20 minutes",
            target: 1,
            active: false
          },
          {
            id: 319,
            title: "Habit Tracker Journal",
            description: "Track your habits and reflect on your progress",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 1,
            active: false
          },
          {
            id: 320,
            title: "Nature Observations",
            description: "Document observations about the natural world around you",
            frequency: "Weekly",
            difficulty: "Easy",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 321,
            title: "Self-Discovery Questions",
            description: "Answer one deep self-discovery question each day",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 322,
            title: "Lessons Learned Journal",
            description: "Document important lessons from experiences and mistakes",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 323,
            title: "Poetry Writing",
            description: "Express emotions through poetry or creative writing",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 1,
            active: false
          }
        ];
      case "activity":
        return [
          {
            id: 7,
            title: "Daily Movement",
            description: "Engage in 30 minutes of physical activity to boost mood and energy",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 30,
            active: true
          },
          {
            id: 8,
            title: "Hydration Habit",
            description: "Drink 8 glasses of water throughout the day to stay properly hydrated",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "All day",
            target: 8,
            active: false
          },
          {
            id: 401,
            title: "Morning Stretch",
            description: "Start your day with 10 minutes of gentle stretching",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 402,
            title: "Step Count",
            description: "Aim for 10,000 steps each day to increase overall activity",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "All day",
            target: 10000,
            active: false
          },
          {
            id: 403,
            title: "Strength Training",
            description: "Complete a 20-minute strength workout three times per week",
            frequency: "3x Weekly",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 3,
            active: false
          },
          {
            id: 404,
            title: "Yoga Practice",
            description: "Follow a 30-minute yoga routine to improve flexibility and mindfulness",
            frequency: "3x Weekly",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 3,
            active: false
          },
          {
            id: 405,
            title: "Cardio Workout",
            description: "Complete 25 minutes of heart-pumping cardio exercise",
            frequency: "3x Weekly",
            difficulty: "Hard",
            duration: "25 minutes",
            target: 3,
            active: false
          },
          {
            id: 406,
            title: "Nature Walk",
            description: "Take a 45-minute walk in nature for physical and mental benefits",
            frequency: "Weekly",
            difficulty: "Easy",
            duration: "45 minutes",
            target: 1,
            active: false
          },
          {
            id: 407,
            title: "Posture Check",
            description: "Check and correct your posture several times throughout the day",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "All day",
            target: 10,
            active: false
          },
          {
            id: 408,
            title: "Screen Break",
            description: "Take a 5-minute break from screens every hour of work",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "5 minutes",
            target: 8,
            active: false
          },
          {
            id: 409,
            title: "Dance Break",
            description: "Dance to one song each day to boost mood and energy",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 1,
            active: false
          },
          {
            id: 410,
            title: "Standing Desk",
            description: "Stand instead of sitting for at least 3 hours of your workday",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "3 hours",
            target: 180,
            active: false
          },
          {
            id: 411,
            title: "Balance Practice",
            description: "Practice balance exercises for 5 minutes to improve stability",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "5 minutes",
            target: 5,
            active: false
          },
          {
            id: 412,
            title: "Breathing Exercises",
            description: "Complete deep breathing exercises to reduce stress and improve lung function",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 5,
            active: false
          },
          {
            id: 413,
            title: "Sleep Hygiene",
            description: "Maintain a consistent sleep schedule and bedtime routine",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "All night",
            target: 8,
            active: false
          },
          {
            id: 414,
            title: "Tech-Free Time",
            description: "Spend one hour each day completely free from technology",
            frequency: "Daily",
            difficulty: "Hard",
            duration: "1 hour",
            target: 60,
            active: false
          },
          {
            id: 415,
            title: "Meal Planning",
            description: "Plan healthy meals for the week ahead",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 1,
            active: false
          },
          {
            id: 416,
            title: "New Recipe",
            description: "Try cooking one new healthy recipe each week",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "45 minutes",
            target: 1,
            active: false
          },
          {
            id: 417,
            title: "Sugar Reduction",
            description: "Reduce added sugar intake by being mindful of food choices",
            frequency: "Daily",
            difficulty: "Hard",
            duration: "All day",
            target: 1,
            active: false
          },
          {
            id: 418,
            title: "Vegetable Servings",
            description: "Consume at least 5 servings of vegetables each day",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "All day",
            target: 5,
            active: false
          },
          {
            id: 419,
            title: "Mindful Eating",
            description: "Eat one meal per day without distractions, focusing fully on the experience",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 1,
            active: false
          },
          {
            id: 420,
            title: "Active Commuting",
            description: "Walk, bike, or use stairs instead of driving or elevators when possible",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "Varies",
            target: 1,
            active: false
          },
          {
            id: 421,
            title: "Interval Training",
            description: "Complete a short, high-intensity interval workout",
            frequency: "3x Weekly",
            difficulty: "Hard",
            duration: "20 minutes",
            target: 3,
            active: false
          },
          {
            id: 422,
            title: "Flexibility Training",
            description: "Perform specific stretches to improve overall flexibility",
            frequency: "3x Weekly",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 3,
            active: false
          },
          {
            id: 423,
            title: "Outdoor Activity",
            description: "Spend time being active outdoors to connect with nature",
            frequency: "Weekly",
            difficulty: "Easy",
            duration: "60 minutes",
            target: 60,
            active: false
          }
        ];
      default:
        return [];
    }
  };
  
  const allChallenges = getChallenges();
  
  // Calculate total pages
  const totalPages = Math.ceil(allChallenges.length / itemsPerPage);
  
  // Get current page of challenges
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentChallenges = allChallenges.slice(indexOfFirstItem, indexOfLastItem);
  
  const handleChallengeSelect = (challenge: any) => {
    if (challenge.active) {
      // If already active, go to the challenge details
      navigate(`/wellness-challenges/${challenge.id}`);
    } else {
      // If not active, open the accept dialog
      setSelectedChallenge(challenge);
      setAcceptDialogOpen(true);
    }
  };
  
  const handleAcceptChallenge = () => {
    // Here we would make an API call to accept the challenge
    setAcceptDialogOpen(false);
    
    // Redirect to the challenge details page
    if (selectedChallenge) {
      navigate(`/wellness-challenges/${selectedChallenge.id}`);
    }
  };
  
  return (
    <PageTransition>
      <div className="pb-16">
        {/* Header with gradient background */}
        <div className={`${categoryStyles.color} pt-6 pb-8 px-4`}>
          <Button 
            variant="ghost" 
            className="flex items-center gap-1 mb-2 text-foreground" 
            onClick={() => navigate("/wellness-challenges")}
          >
            <ArrowLeft size={16} />
            Back to Categories
          </Button>
          
          <div className="flex items-center">
            <div className="bg-white/80 p-3 rounded-full mr-3">
              {categoryStyles.icon}
            </div>
            <h1 className="text-2xl font-bold">{displayCategory} Challenges</h1>
          </div>
        </div>
        
        {/* Challenge list */}
        <div className="p-4 space-y-5">
          {/* Category info */}
          <div className="mb-2">
            <p className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, allChallenges.length)} of {allChallenges.length} challenges
            </p>
          </div>
          
          {/* Challenges */}
          {allChallenges.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No challenges available in this category</p>
            </div>
          ) : (
            <>
              {currentChallenges.map(challenge => (
                <Card 
                  key={challenge.id} 
                  className={`overflow-hidden cursor-pointer hover:border-primary transition-colors ${challenge.active ? `border-2 ${categoryStyles.borderColor}` : ""}`}
                  onClick={() => handleChallengeSelect(challenge)}
                >
                  <CardContent className="p-4 pt-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-1">
                          <h3 className="font-medium mr-2">{challenge.title}</h3>
                          {challenge.active && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">Active</div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>You are currently doing this challenge</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                        
                        <div className="flex flex-wrap gap-2 text-xs">
                          <div className="flex items-center bg-secondary/50 px-2 py-1 rounded-full">
                            <Clock className="h-3 w-3 mr-1" />
                            {challenge.duration}
                          </div>
                          <div className="bg-secondary/50 px-2 py-1 rounded-full">
                            {challenge.frequency}
                          </div>
                          <div className="bg-secondary/50 px-2 py-1 rounded-full">
                            {challenge.difficulty}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Accept challenge dialog */}
        <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accept Challenge</DialogTitle>
              <DialogDescription>
                Are you ready to start this wellness challenge?
              </DialogDescription>
            </DialogHeader>
            
            {selectedChallenge && (
              <div className="py-4">
                <h3 className="font-medium text-lg">{selectedChallenge.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">{selectedChallenge.description}</p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-medium">{selectedChallenge.frequency}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Time required:</span>
                    <span className="font-medium">{selectedChallenge.duration}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <span className="font-medium">{selectedChallenge.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily target:</span>
                    <span className="font-medium">{selectedChallenge.target} per day</span>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex space-x-2 sm:space-x-0">
              <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAcceptChallenge}>Accept Challenge</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default WellnessChallengeCategory;