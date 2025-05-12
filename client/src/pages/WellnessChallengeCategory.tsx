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
          },
          {
            id: 124,
            title: "Emotional Triggers Journal",
            description: "Document situations that trigger strong emotional responses",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 125,
            title: "Inner Child Dialogue",
            description: "Practice speaking compassionately to your inner child",
            frequency: "Daily",
            difficulty: "Hard",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 126,
            title: "Emotional Acceptance",
            description: "Practice accepting emotions without judgment or resistance",
            frequency: "Daily",
            difficulty: "Hard",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 127,
            title: "Three Good Things",
            description: "Write down three positive experiences each day and their causes",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 3,
            active: false
          },
          {
            id: 128,
            title: "Emotional Resilience Reading",
            description: "Read literature on building emotional resilience",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 129,
            title: "Emotional Needs Inventory",
            description: "Identify and rank your emotional needs for better self-understanding",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 1,
            active: false
          },
          {
            id: 130,
            title: "Mood-Boosting Activity",
            description: "Do one intentional activity to boost your mood daily",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 131,
            title: "Non-Verbal Emotion Expression",
            description: "Express emotions through art, movement, or other non-verbal means",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 132,
            title: "Emotional Regulation Practice",
            description: "Practice specific emotional regulation techniques when feeling overwhelmed",
            frequency: "As needed",
            difficulty: "Hard",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 133,
            title: "Media Emotional Awareness",
            description: "Be mindful of how music, TV, and social media affect your emotions",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "All day",
            target: 1,
            active: false
          },
          {
            id: 134,
            title: "Emotional Timeline",
            description: "Create a timeline of significant emotional events in your life",
            frequency: "One-time",
            difficulty: "Hard",
            duration: "60 minutes",
            target: 1,
            active: false
          },
          {
            id: 135,
            title: "Forgiveness Practice",
            description: "Practice forgiving yourself or others for past hurts",
            frequency: "Weekly",
            difficulty: "Hard",
            duration: "20 minutes",
            target: 1,
            active: false
          },
          {
            id: 136,
            title: "Nurturing Relationships",
            description: "Invest time in relationships that nurture positive emotions",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 1,
            active: false
          },
          {
            id: 137,
            title: "Nostalgic Reflection",
            description: "Reflect on positive nostalgic memories to enhance mood",
            frequency: "Weekly",
            difficulty: "Easy",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 138,
            title: "Emotional Word of the Day",
            description: "Learn a new emotion word and notice that feeling throughout the day",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "All day",
            target: 1,
            active: false
          },
          {
            id: 139,
            title: "Authentic Communication",
            description: "Practice expressing your emotions authentically in conversation",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "Varies",
            target: 1,
            active: false
          },
          {
            id: 140,
            title: "Opposite Action",
            description: "Act opposite to unwanted emotions when they don't fit the facts",
            frequency: "As needed",
            difficulty: "Hard",
            duration: "Varies",
            target: 1,
            active: false
          },
          {
            id: 141,
            title: "Emotional Safety Plan",
            description: "Create a plan for managing intense emotional situations",
            frequency: "One-time",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 1,
            active: false
          },
          {
            id: 142,
            title: "Positive Reappraisal",
            description: "Practice finding alternative positive perspectives on difficult situations",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 143,
            title: "Emotion-Focused Journaling",
            description: "Journal specifically about one emotion you experienced today",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 144,
            title: "HALT Check-in",
            description: "Check if you're Hungry, Angry, Lonely or Tired when emotions intensify",
            frequency: "As needed",
            difficulty: "Easy",
            duration: "2 minutes",
            target: 1,
            active: false
          },
          {
            id: 145,
            title: "Pleasant Activities Scheduling",
            description: "Schedule and engage in activities that create positive emotions",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 1,
            active: false
          },
          {
            id: 146,
            title: "Difficult Emotions Mindfulness",
            description: "Practice mindfulness specifically with difficult emotions",
            frequency: "Daily",
            difficulty: "Hard",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 147,
            title: "Values Clarification",
            description: "Identify and reflect on your core values to guide emotional regulation",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "20 minutes",
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
          },
          {
            id: 224,
            title: "Zen Garden Meditation",
            description: "Create or tend to a small zen garden while practicing mindfulness",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 20,
            active: false
          },
          {
            id: 225,
            title: "Stone Stacking Meditation",
            description: "Practice stacking stones as a form of moving meditation",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 226,
            title: "Labyrinth Walking",
            description: "Walk a labyrinth pattern as a form of moving meditation",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 20,
            active: false
          },
          {
            id: 227,
            title: "Chakra Balancing",
            description: "Focus on balancing each of the seven chakras during meditation",
            frequency: "Weekly",
            difficulty: "Hard",
            duration: "25 minutes",
            target: 25,
            active: false
          },
          {
            id: 228,
            title: "Intention Setting",
            description: "Set a clear intention at the beginning of each meditation session",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "2 minutes",
            target: 2,
            active: false
          },
          {
            id: 229,
            title: "Mind-Body Scan",
            description: "Scan from head to toe, noticing sensations without judgment",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 230,
            title: "Trataka Meditation",
            description: "Focus on a single point or object to develop concentration",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 231,
            title: "Sound Bath Meditation",
            description: "Meditate while listening to singing bowls or other resonant sounds",
            frequency: "Weekly",
            difficulty: "Easy",
            duration: "20 minutes",
            target: 20,
            active: false
          },
          {
            id: 232,
            title: "Mudra Meditation",
            description: "Incorporate hand positions (mudras) into your meditation practice",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 233,
            title: "Mirror Gazing",
            description: "Gaze at your reflection in the mirror as a meditation practice",
            frequency: "Weekly",
            difficulty: "Hard",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 234,
            title: "Gratitude Meditation",
            description: "Focus on things you're grateful for during your meditation",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 235,
            title: "Full Moon Meditation",
            description: "Practice a special meditation during the full moon",
            frequency: "Monthly",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 20,
            active: false
          },
          {
            id: 236,
            title: "Sunrise Meditation",
            description: "Meditate at sunrise to align with natural cycles",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 237,
            title: "Sunset Meditation",
            description: "Meditate at sunset to transition from day to evening",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 238,
            title: "Visualization Journey",
            description: "Take an imaginary journey to a peaceful place during meditation",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 239,
            title: "Color Meditation",
            description: "Focus on visualizing specific colors associated with healing",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 240,
            title: "Group Meditation",
            description: "Meditate with others to experience collective energy",
            frequency: "Weekly",
            difficulty: "Easy",
            duration: "30 minutes",
            target: 30,
            active: false
          },
          {
            id: 241,
            title: "Element Meditation",
            description: "Focus on the four elements (earth, air, fire, water) during meditation",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 20,
            active: false
          },
          {
            id: 242,
            title: "Energy Center Focus",
            description: "Rotate attention through major energy centers in the body",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 243,
            title: "Walking Meditation",
            description: "Practice mindfulness while walking very slowly and deliberately",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 244,
            title: "Kitchen Meditation",
            description: "Practice mindfulness while cooking or preparing food",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 20,
            active: false
          },
          {
            id: 245,
            title: "Dance Meditation",
            description: "Use free-form dance as a moving meditation practice",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 246,
            title: "Meditation for Sleep",
            description: "Use a special meditation practice to prepare for sleep",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 247,
            title: "Meditation Teacher Exploration",
            description: "Try meditation practices from different teachers each week",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 20,
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
          },
          {
            id: 324,
            title: "Daily Word Journal",
            description: "Choose a word each day and explore what it means to you",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 325,
            title: "Future Self Letters",
            description: "Write letters to your future self at specific milestones",
            frequency: "Monthly",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 1,
            active: false
          },
          {
            id: 326,
            title: "Unsent Letters",
            description: "Write letters you don't intend to send to process feelings",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 1,
            active: false
          },
          {
            id: 327,
            title: "Childhood Memory Journal",
            description: "Record and reflect on significant childhood memories",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "25 minutes",
            target: 1,
            active: false
          },
          {
            id: 328,
            title: "Morning Brain Dump",
            description: "Write freely for 5 minutes first thing in the morning",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 1,
            active: false
          },
          {
            id: 329,
            title: "Two-Column Journaling",
            description: "Compare thoughts and feelings in a two-column format",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 330,
            title: "Relationship Journal",
            description: "Reflect on important relationships in your life",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 1,
            active: false
          },
          {
            id: 331,
            title: "Five Senses Journal",
            description: "Record observations using all five senses",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 332,
            title: "Monthly Review",
            description: "Conduct a thorough review of the past month",
            frequency: "Monthly",
            difficulty: "Medium",
            duration: "45 minutes",
            target: 1,
            active: false
          },
          {
            id: 333,
            title: "Character Sketch",
            description: "Write detailed descriptions of people you know",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 1,
            active: false
          },
          {
            id: 334,
            title: "Travel Journal",
            description: "Document travels, even short local adventures",
            frequency: "As needed",
            difficulty: "Easy",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 335,
            title: "Media Response Journal",
            description: "Reflect on books, movies, or articles that moved you",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 336,
            title: "Six-Word Stories",
            description: "Capture your day in exactly six words",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "5 minutes",
            target: 1,
            active: false
          },
          {
            id: 337,
            title: "Belief Examination",
            description: "Explore and question a deeply held belief",
            frequency: "Weekly",
            difficulty: "Hard",
            duration: "30 minutes",
            target: 1,
            active: false
          },
          {
            id: 338,
            title: "Opposite Perspective",
            description: "Write from a perspective opposite to your own",
            frequency: "Weekly",
            difficulty: "Hard",
            duration: "25 minutes",
            target: 1,
            active: false
          },
          {
            id: 339,
            title: "First-Thing Journaling",
            description: "Write before looking at your phone in the morning",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 1,
            active: false
          },
          {
            id: 340,
            title: "Life Timeline",
            description: "Create a timeline of significant life events",
            frequency: "One-time",
            difficulty: "Medium",
            duration: "60 minutes",
            target: 1,
            active: false
          },
          {
            id: 341,
            title: "Third-Person Journaling",
            description: "Write about yourself in the third person for perspective",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 342,
            title: "Illustrated Journal",
            description: "Combine words and simple drawings in your journal",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 343,
            title: "Wisdom Collection",
            description: "Record wisdom you encounter from various sources",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 1,
            active: false
          },
          {
            id: 344,
            title: "Photo Journal",
            description: "Use photos as prompts for written reflection",
            frequency: "Weekly",
            difficulty: "Easy",
            duration: "15 minutes",
            target: 1,
            active: false
          },
          {
            id: 345,
            title: "Time Capsule Journal",
            description: "Create entries to be read at a future date",
            frequency: "Monthly",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 1,
            active: false
          },
          {
            id: 346,
            title: "Dialogue Journaling",
            description: "Write a dialogue between different parts of yourself",
            frequency: "Weekly",
            difficulty: "Hard",
            duration: "20 minutes",
            target: 1,
            active: false
          },
          {
            id: 347,
            title: "Structured Reflection",
            description: "Use a specific template to guide your journaling",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "10 minutes",
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
          },
          {
            id: 424,
            title: "Digital Detox",
            description: "Set aside time each day to completely disconnect from digital devices",
            frequency: "Daily",
            difficulty: "Hard",
            duration: "60 minutes",
            target: 60,
            active: false
          },
          {
            id: 425,
            title: "Morning Sun Exposure",
            description: "Get 10-15 minutes of morning sunlight to regulate circadian rhythm",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 426,
            title: "Posture Practice",
            description: "Set reminders to check and correct your posture throughout the day",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "All day",
            target: 10,
            active: false
          },
          {
            id: 427,
            title: "Joint Mobility Routine",
            description: "Perform gentle joint mobility exercises to maintain range of motion",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 428,
            title: "Desk Exercise Breaks",
            description: "Take short exercise breaks during long periods of sitting",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 6,
            active: false
          },
          {
            id: 429,
            title: "Deep Breathing Practice",
            description: "Practice deep diaphragmatic breathing throughout the day",
            frequency: "Daily",
            difficulty: "Easy",
            duration: "5 minutes",
            target: 3,
            active: false
          },
          {
            id: 430,
            title: "Nature Connection",
            description: "Spend time in nature regardless of weather conditions",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 30,
            active: false
          },
          {
            id: 431,
            title: "Bedtime Routine",
            description: "Establish a consistent bedtime routine to improve sleep quality",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 30,
            active: false
          },
          {
            id: 432,
            title: "Plant-Based Meal",
            description: "Incorporate one fully plant-based meal into your day",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 1,
            active: false
          },
          {
            id: 433,
            title: "Cold Exposure",
            description: "Take a cold shower or practice cold exposure therapy",
            frequency: "Daily",
            difficulty: "Hard",
            duration: "2 minutes",
            target: 2,
            active: false
          },
          {
            id: 434,
            title: "Balance Training",
            description: "Practice standing on one leg to improve balance and stability",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "5 minutes",
            target: 5,
            active: false
          },
          {
            id: 435,
            title: "Phone-Free Meals",
            description: "Eat meals without phone or screens to practice mindful eating",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 1,
            active: false
          },
          {
            id: 436,
            title: "Weekly Meal Prep",
            description: "Prepare healthy meals in advance for the upcoming week",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "120 minutes",
            target: 1,
            active: false
          },
          {
            id: 437,
            title: "Hobby Time",
            description: "Dedicate time to a non-digital, hands-on hobby",
            frequency: "Weekly",
            difficulty: "Easy",
            duration: "60 minutes",
            target: 60,
            active: false
          },
          {
            id: 438,
            title: "Foam Rolling",
            description: "Use a foam roller for myofascial release and muscle recovery",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "10 minutes",
            target: 10,
            active: false
          },
          {
            id: 439,
            title: "Declutter Session",
            description: "Declutter one small area of your living space",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 1,
            active: false
          },
          {
            id: 440,
            title: "Active Transportation",
            description: "Choose walking, cycling, or stairs instead of motorized options",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "Varies",
            target: 1,
            active: false
          },
          {
            id: 441,
            title: "Mindful Snacking",
            description: "Choose nutritious snacks and eat them mindfully",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "All day",
            target: 1,
            active: false
          },
          {
            id: 442,
            title: "Power Nap",
            description: "Take a short 10-20 minute nap to boost alertness and performance",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "20 minutes",
            target: 1,
            active: false
          },
          {
            id: 443,
            title: "Tech-Free Time",
            description: "Schedule a period each day completely free from technology",
            frequency: "Daily",
            difficulty: "Hard",
            duration: "60 minutes",
            target: 60,
            active: false
          },
          {
            id: 444,
            title: "Morning Ritual",
            description: "Create and follow a meaningful morning ritual",
            frequency: "Daily",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 30,
            active: false
          },
          {
            id: 445,
            title: "Conscious Consumption",
            description: "Research the origins and impact of items before purchasing",
            frequency: "As needed",
            difficulty: "Medium",
            duration: "Varies",
            target: 1,
            active: false
          },
          {
            id: 446,
            title: "Barefoot Walking",
            description: "Walk barefoot on natural surfaces to improve foot strength",
            frequency: "Weekly",
            difficulty: "Easy",
            duration: "15 minutes",
            target: 15,
            active: false
          },
          {
            id: 447,
            title: "Digital Organization",
            description: "Organize digital files and reduce digital clutter",
            frequency: "Weekly",
            difficulty: "Medium",
            duration: "30 minutes",
            target: 30,
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