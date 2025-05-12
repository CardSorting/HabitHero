/**
 * Seed script for adding DBT-related challenges to the database
 * This script adds challenges in the 4 DBT modules:
 * - Mindfulness
 * - Distress Tolerance
 * - Emotion Regulation
 * - Interpersonal Effectiveness
 */

import { db } from './server/db.js';
import { wellnessChallenges } from './shared/schema.js';

// 50 challenges per category
const mindfulnessChallenges = [
  {
    title: "One Minute Mindfulness",
    description: "Practice one minute of complete mindfulness focusing on your breath",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "1 minute",
    target: 1,
    category: "mindfulness"
  },
  {
    title: "Body Scan Meditation",
    description: "Complete a body scan meditation, systematically bringing awareness to each part of your body",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "mindfulness"
  },
  {
    title: "Mindful Walking",
    description: "Practice walking slowly and deliberately, paying attention to each step and bodily sensation",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "mindfulness"
  },
  {
    title: "Observe Breath",
    description: "Simply observe your natural breath without changing it",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    category: "mindfulness"
  },
  {
    title: "Five Senses Exercise",
    description: "Notice 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    category: "mindfulness"
  },
  {
    title: "Wise Mind Practice",
    description: "Connect with your wise mind - the balance between emotion mind and reasonable mind",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "mindfulness"
  },
  {
    title: "Mindful Eating",
    description: "Eat a meal or snack with complete awareness of taste, texture, and sensation",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "mindfulness"
  },
  {
    title: "Observe-Describe-Participate",
    description: "Practice the three primary mindfulness skills: observing, describing, and participating",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "mindfulness"
  },
  {
    title: "One-Mindfully in the Moment",
    description: "Focus completely on what you're doing in this moment, with undivided attention",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "mindfulness"
  },
  {
    title: "Effective vs. Judgmental Stance",
    description: "Practice taking a non-judgmental stance toward yourself and others",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "All Day",
    target: 1,
    category: "mindfulness"
  },
  {
    title: "Stone Flake on a Lake",
    description: "Visualize your thoughts as stone flakes floating on a lake's surface",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "mindfulness"
  },
  {
    title: "Mindful Breathing 4-7-8",
    description: "Breathe in for 4 counts, hold for 7 counts, breathe out for 8 counts",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    category: "mindfulness"
  },
  {
    title: "Mindful Washing",
    description: "Practice mindfulness while washing dishes or taking a shower",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "Varies",
    target: 1,
    category: "mindfulness"
  },
  {
    title: "Mindful Touch",
    description: "Focus entirely on the sensation of touch with different objects and textures",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "mindfulness"
  },
  {
    title: "Mindful Listening",
    description: "Listen to a piece of music with complete attention to the sounds",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "mindfulness"
  },
  {
    title: "Mindfulness of Thoughts",
    description: "Watch thoughts come and go without attachment",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    category: "mindfulness"
  },
  {
    title: "Beginner's Mind",
    description: "Approach a familiar activity as if experiencing it for the first time",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "mindfulness"
  },
  {
    title: "Observing Emotion Waves",
    description: "Observe emotions as they rise, peak, and fall like waves",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "mindfulness"
  },
  {
    title: "Mindful Movement",
    description: "Practice gentle stretching or yoga with full awareness",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "mindfulness"
  },
  {
    title: "Mindfulness Bell",
    description: "Use random bells or alarms throughout the day as reminders to return to mindfulness",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "1 minute",
    target: 5,
    category: "mindfulness"
  },
  {
    title: "Three Minute Breathing Space",
    description: "Take three minutes to: 1) become aware, 2) focus on breath, 3) expand awareness",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "3 minutes",
    target: 3,
    category: "mindfulness"
  },
  {
    title: "Leaves on a Stream",
    description: "Visualize your thoughts as leaves floating down a stream",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "mindfulness"
  },
  {
    title: "Mountain Meditation",
    description: "Visualize yourself as a mountain - steady through all weather and seasons",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "mindfulness"
  },
  {
    title: "Just This One Breath",
    description: "Focus entirely on just one breath at a time",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    category: "mindfulness"
  },
  {
    title: "Mindful Technology Use",
    description: "Practice using technology with intention and awareness",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "All Day",
    target: 1,
    category: "mindfulness"
  },
  {
    title: "Mindful Communication",
    description: "Practice speaking and listening with full attention",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "mindfulness"
  },
  {
    title: "Mindful Pause",
    description: "Take brief mindful pauses between activities",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "1 minute",
    target: 5,
    category: "mindfulness"
  },
  {
    title: "Mindful Awareness of Surroundings",
    description: "Notice the details of your environment with curiosity",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    category: "mindfulness"
  },
  {
    title: "RAIN Practice",
    description: "Recognize, Allow, Investigate, Nurture difficult emotions",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "mindfulness"
  },
  {
    title: "Loving-Kindness Meditation",
    description: "Practice wishing well-being for yourself and others",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "mindfulness"
  },
  {
    title: "Mindful Waiting",
    description: "Use waiting time as an opportunity to practice mindfulness",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "Varies",
    target: 1,
    category: "mindfulness"
  },
  {
    title: "Mindful Posture",
    description: "Practice maintaining awareness of your posture throughout the day",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "All Day",
    target: 1,
    category: "mindfulness"
  },
  {
    title: "Mindful Driving",
    description: "Drive with full awareness of the road and your surroundings",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "mindfulness"
  },
  {
    title: "Thought Defusion",
    description: "Practice recognizing thoughts as 'just thoughts' not reality",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "mindfulness"
  },
  {
    title: "Mindful Transitions",
    description: "Bring awareness to transitions between activities",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "1 minute",
    target: 5,
    category: "mindfulness"
  },
  {
    title: "Soles of the Feet",
    description: "Shift attention to the soles of your feet when emotionally triggered",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "3 minutes",
    target: 3,
    category: "mindfulness"
  },
  {
    title: "Mindful Gratitude",
    description: "Mindfully appreciate something in your present experience",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    category: "mindfulness"
  },
  {
    title: "Mindful Acceptance",
    description: "Practice accepting reality as it is, without resistance",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    category: "mindfulness"
  },
  {
    title: "Name Your Emotions",
    description: "Practice identifying and naming emotions as they arise",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "All Day",
    target: 5,
    category: "mindfulness"
  },
  {
    title: "Dropping Anchor",
    description: "Ground yourself in the present moment through physical sensations",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "5 minutes",
    target: 5,
    category: "mindfulness"
  },
  {
    title: "Mindful Cooking",
    description: "Prepare a meal with full attention to the process",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "30 minutes",
    target: 30,
    category: "mindfulness"
  },
  {
    title: "Mindful Walking in Nature",
    description: "Walk in nature while paying attention to the natural environment",
    frequency: "Weekly",
    difficulty: "Easy",
    duration: "20 minutes",
    target: 20,
    category: "mindfulness"
  },
  {
    title: "Mindful Photography",
    description: "Take photographs with full attention to what you're seeing",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "20 minutes",
    target: 20,
    category: "mindfulness"
  },
  {
    title: "Mindfulness of Breath at the Nostrils",
    description: "Focus specifically on the sensation of breath at the nostrils",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "mindfulness"
  },
  {
    title: "Mindfulness of Sound",
    description: "Focus on sounds in your environment without labeling or judging",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "mindfulness"
  },
  {
    title: "Mindful Showering",
    description: "Shower with complete awareness of sensations, water temperature, and movement",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "Varies",
    target: 1,
    category: "mindfulness"
  },
  {
    title: "Mindfulness of Urges",
    description: "Notice urges and cravings without automatically acting on them",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "mindfulness"
  },
  {
    title: "Center of the Hurricane",
    description: "Find the still center within emotional storms",
    frequency: "As Needed",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    category: "mindfulness"
  },
  {
    title: "Counting Breaths",
    description: "Count breaths from 1 to 10, then start over",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    category: "mindfulness"
  },
  {
    title: "Observe-Describe-Participate with an Object",
    description: "Practice core mindfulness skills with a simple object",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "10 minutes",
    target: 10,
    category: "mindfulness"
  }
];

const distressToleranceChallenges = [
  {
    title: "TIPP Skills Practice",
    description: "Temperature change, Intense exercise, Paced breathing, Progressive muscle relaxation",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "distress_tolerance"
  },
  {
    title: "Wise Mind ACCEPTS",
    description: "Activities, Contributing, Comparisons, Emotions, Pushing away, Thoughts, Sensations",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "distress_tolerance"
  },
  {
    title: "Self-Soothing with Senses",
    description: "Use vision, hearing, smell, taste, and touch to self-soothe",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "10 minutes",
    target: 10,
    category: "distress_tolerance"
  },
  {
    title: "IMPROVE the Moment",
    description: "Imagery, Meaning, Prayer, Relaxation, One thing at a time, Vacation, Encouragement",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "distress_tolerance"
  },
  {
    title: "Pros and Cons",
    description: "Make a pros and cons list for tolerating vs not tolerating the distress",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "distress_tolerance"
  },
  {
    title: "Radical Acceptance",
    description: "Practice accepting reality as it is, without fighting against it",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "15 minutes",
    target: 15,
    category: "distress_tolerance"
  },
  {
    title: "Turning the Mind",
    description: "Practice consciously choosing to accept reality rather than reject it",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "5 minutes",
    target: 5,
    category: "distress_tolerance"
  },
  {
    title: "Willingness vs. Willfulness",
    description: "Practice willingness to do what's effective rather than willful refusal",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "distress_tolerance"
  },
  {
    title: "Half-Smile and Willing Hands",
    description: "Adopt a half-smile and open palm position during distress",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "5 minutes",
    target: 5,
    category: "distress_tolerance"
  },
  {
    title: "Cold Water Immersion",
    description: "Use cold water to rapidly reduce emotional arousal",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "1 minute",
    target: 1,
    category: "distress_tolerance"
  },
  {
    title: "Urge Surfing",
    description: "Ride the wave of an urge until it naturally subsides",
    frequency: "As Needed",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "distress_tolerance"
  },
  {
    title: "Create a Crisis Plan",
    description: "Develop a detailed plan for managing future crises",
    frequency: "One Time",
    difficulty: "Medium",
    duration: "30 minutes",
    target: 30,
    category: "distress_tolerance"
  },
  {
    title: "Distraction Plan",
    description: "Create a list of effective distractions to use when distressed",
    frequency: "One Time",
    difficulty: "Easy",
    duration: "20 minutes",
    target: 20,
    category: "distress_tolerance"
  },
  {
    title: "Paired Muscle Relaxation",
    description: "Tense and relax muscle groups while saying 'relax' as you exhale",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "10 minutes",
    target: 10,
    category: "distress_tolerance"
  },
  {
    title: "4-7-8 Breathing",
    description: "Inhale for 4 counts, hold for 7, exhale for 8",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    category: "distress_tolerance"
  },
  {
    title: "Create a Comfort Box",
    description: "Assemble items that engage your five senses for comfort",
    frequency: "One Time",
    difficulty: "Easy",
    duration: "45 minutes",
    target: 45,
    category: "distress_tolerance"
  },
  {
    title: "Intense Exercise",
    description: "Engage in brief, intense physical activity to reduce distress",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "distress_tolerance"
  },
  {
    title: "Progressive Muscle Relaxation",
    description: "Systematically tense and relax muscle groups to reduce tension",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "15 minutes",
    target: 15,
    category: "distress_tolerance"
  },
  {
    title: "Safe Place Visualization",
    description: "Imagine a safe, peaceful place in detail",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "10 minutes",
    target: 10,
    category: "distress_tolerance"
  },
  {
    title: "Paced Breathing",
    description: "Slow your breathing to 5-6 breaths per minute",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    category: "distress_tolerance"
  },
  {
    title: "Distress Thermometer",
    description: "Rate your distress on a scale of 0-10 at different times",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "1 minute",
    target: 3,
    category: "distress_tolerance"
  },
  {
    title: "Apply Ice to Face",
    description: "Apply cold to the face to activate the dive reflex",
    frequency: "As Needed",
    difficulty: "Easy",
    duration: "1 minute",
    target: 1,
    category: "distress_tolerance"
  },
  {
    title: "Radical Acceptance Meditation",
    description: "Meditate specifically on accepting reality as it is",
    frequency: "Weekly",
    difficulty: "Hard",
    duration: "20 minutes",
    target: 20,
    category: "distress_tolerance"
  },
  {
    title: "Pushing Away",
    description: "Temporarily push away distressing thoughts or situations",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "distress_tolerance"
  },
  {
    title: "Meaningful Activities",
    description: "Engage in activities that provide meaning and purpose",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "30 minutes",
    target: 30,
    category: "distress_tolerance"
  },
  {
    title: "Contributing to Others",
    description: "Help someone else to shift focus from your own distress",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "distress_tolerance"
  },
  {
    title: "Adaptive Self-Talk",
    description: "Practice helpful self-statements during distress",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 3,
    category: "distress_tolerance"
  },
  {
    title: "Holding Ice",
    description: "Hold ice in your hand during intense distress",
    frequency: "As Needed",
    difficulty: "Easy",
    duration: "1 minute",
    target: 1,
    category: "distress_tolerance"
  },
  {
    title: "5-4-3-2-1 Grounding",
    description: "Notice 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste",
    frequency: "As Needed",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    category: "distress_tolerance"
  },
  {
    title: "Self-Encouragement",
    description: "Actively encourage yourself during difficult situations",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 3,
    category: "distress_tolerance"
  },
  {
    title: "Comparison Making",
    description: "Compare your situation to those worse off or to your own past struggles",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "5 minutes",
    target: 5,
    category: "distress_tolerance"
  },
  {
    title: "Vacation in Your Mind",
    description: "Take a brief mental vacation to somewhere peaceful",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    category: "distress_tolerance"
  },
  {
    title: "One-Thing-In-The-Moment",
    description: "Focus completely on just one thing you're doing",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "distress_tolerance"
  },
  {
    title: "Categories Distraction",
    description: "Distract by listing items in different categories (e.g., types of dogs)",
    frequency: "As Needed",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    category: "distress_tolerance"
  },
  {
    title: "Intense Sensations",
    description: "Use intense sensations (like hot sauce) to distract from emotional pain",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "1 minute",
    target: 1,
    category: "distress_tolerance"
  },
  {
    title: "Opposite Emotions",
    description: "Engage in activities that generate emotions opposite to your distress",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "distress_tolerance"
  },
  {
    title: "Purposeful Focus Shifting",
    description: "Deliberately shift your focus to something neutral or positive",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "5 minutes",
    target: 5,
    category: "distress_tolerance"
  },
  {
    title: "Balanced Reasoning",
    description: "Consider both emotional and reasonable mind perspectives",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    category: "distress_tolerance"
  },
  {
    title: "Self-Validation",
    description: "Acknowledge and validate your own feelings and experiences",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "5 minutes",
    target: 5,
    category: "distress_tolerance"
  },
  {
    title: "Crisis Box",
    description: "Create a box with items and instructions for crisis situations",
    frequency: "One Time",
    difficulty: "Medium",
    duration: "45 minutes",
    target: 45,
    category: "distress_tolerance"
  },
  {
    title: "STOP Skill Practice",
    description: "Stop, Take a step back, Observe, Proceed mindfully",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "3 minutes",
    target: 3,
    category: "distress_tolerance"
  },
  {
    title: "Supportive Friend Visualization",
    description: "Imagine a supportive friend or mentor offering wisdom",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "distress_tolerance"
  },
  {
    title: "Counting Backwards",
    description: "Count backwards from 100 by 7s to interrupt distressing thoughts",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "3 minutes",
    target: 3,
    category: "distress_tolerance"
  },
  {
    title: "Emergency Contact List",
    description: "Create and maintain a list of emergency contacts for crisis",
    frequency: "Monthly",
    difficulty: "Easy",
    duration: "15 minutes",
    target: 15,
    category: "distress_tolerance"
  },
  {
    title: "DEAR MAN for Self",
    description: "Use DEAR MAN skills to advocate for yourself during distress",
    frequency: "As Needed",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    category: "distress_tolerance"
  },
  {
    title: "Distress Tolerance Imagery",
    description: "Visualize yourself successfully tolerating distress",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "distress_tolerance"
  },
  {
    title: "Delay Acting on Urges",
    description: "Practice delaying acting on urges for increasing periods",
    frequency: "As Needed",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "distress_tolerance"
  },
  {
    title: "Mindful Distress Tolerance",
    description: "Stay mindfully present with distress without trying to change it",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    category: "distress_tolerance"
  },
  {
    title: "Radical Acceptance Practice Cards",
    description: "Create and review cards with radical acceptance statements",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "5 minutes",
    target: 5,
    category: "distress_tolerance"
  }
];

const emotionRegulationChallenges = [
  {
    title: "Identifying Primary Emotions",
    description: "Practice identifying primary vs. secondary emotions",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "emotion_regulation"
  },
  {
    title: "Emotion Monitoring",
    description: "Track emotions throughout the day with a log",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "All Day",
    target: 3,
    category: "emotion_regulation"
  },
  {
    title: "Opposite Action",
    description: "Act opposite to the action urge of your emotion",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "emotion_regulation"
  },
  {
    title: "Check the Facts",
    description: "Evaluate whether your emotional response fits the facts",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "emotion_regulation"
  },
  {
    title: "ABC PLEASE Skills",
    description: "Accumulate positive emotions, Build mastery, Cope ahead with emotion, treat Physical illness, Low vulnerability to emotion with balance Eating, Avoiding drugs, Sleep, and Exercise",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "All Day",
    target: 1,
    category: "emotion_regulation"
  },
  {
    title: "Positive Experience Building",
    description: "Deliberately engage in activities that create positive emotions",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "30 minutes",
    target: 30,
    category: "emotion_regulation"
  },
  {
    title: "Long-term Pleasant Activity Scheduling",
    description: "Plan enjoyable activities to build positive emotions over time",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "20 minutes",
    target: 20,
    category: "emotion_regulation"
  },
  {
    title: "Being Mindful of Positive Emotions",
    description: "Fully attend to positive experiences as they occur",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 3,
    category: "emotion_regulation"
  },
  {
    title: "Emotion Name It to Tame It",
    description: "Practice labeling emotions precisely to reduce their intensity",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "All Day",
    target: 5,
    category: "emotion_regulation"
  },
  {
    title: "Build Mastery",
    description: "Engage in challenging activities that create a sense of accomplishment",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "30 minutes",
    target: 30,
    category: "emotion_regulation"
  },
  {
    title: "Cope Ahead Planning",
    description: "Prepare for emotionally difficult situations in advance",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "emotion_regulation"
  },
  {
    title: "Physical Wellness Check",
    description: "Assess and take care of physical factors affecting emotions",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "10 minutes",
    target: 10,
    category: "emotion_regulation"
  },
  {
    title: "Balanced Eating",
    description: "Maintain regular, balanced eating to stabilize emotions",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "All Day",
    target: 3,
    category: "emotion_regulation"
  },
  {
    title: "Sleep Hygiene Improvement",
    description: "Improve sleep habits to support emotional regulation",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "All Day",
    target: 1,
    category: "emotion_regulation"
  },
  {
    title: "Regular Exercise",
    description: "Engage in regular physical activity for emotional wellness",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "30 minutes",
    target: 30,
    category: "emotion_regulation"
  },
  {
    title: "Avoiding Mood-Altering Substances",
    description: "Reduce or eliminate substances that impact emotional stability",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "All Day",
    target: 1,
    category: "emotion_regulation"
  },
  {
    title: "Values Clarification",
    description: "Identify personal values to guide emotional responses",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "20 minutes",
    target: 20,
    category: "emotion_regulation"
  },
  {
    title: "Opposite Emotion Cultivation",
    description: "Deliberately generate emotions opposite to painful ones",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "emotion_regulation"
  },
  {
    title: "Emotion Acceptance",
    description: "Practice accepting emotions without judgment",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "15 minutes",
    target: 15,
    category: "emotion_regulation"
  },
  {
    title: "Self-Validation Practice",
    description: "Validate your own emotional experiences",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "emotion_regulation"
  },
  {
    title: "Changing Emotional Interpretations",
    description: "Practice reinterpreting situations to change emotional responses",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "15 minutes",
    target: 15,
    category: "emotion_regulation"
  },
  {
    title: "Problem-Solving Approach",
    description: "Use structured problem-solving for emotion-generating situations",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "20 minutes",
    target: 20,
    category: "emotion_regulation"
  },
  {
    title: "Emotion Myth Busting",
    description: "Identify and challenge unhelpful beliefs about emotions",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "emotion_regulation"
  },
  {
    title: "Emotional Awareness Practice",
    description: "Increase awareness of emotion cues in body and mind",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "emotion_regulation"
  },
  {
    title: "Emotion Function Analysis",
    description: "Analyze what functions your emotions serve",
    frequency: "Weekly",
    difficulty: "Hard",
    duration: "20 minutes",
    target: 20,
    category: "emotion_regulation"
  },
  {
    title: "Emotion Surfing",
    description: "Practice riding the wave of emotion without acting on it",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "emotion_regulation"
  },
  {
    title: "Willingness to Experience Emotions",
    description: "Practice willingness to feel emotions without avoidance",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "15 minutes",
    target: 15,
    category: "emotion_regulation"
  },
  {
    title: "Emotion Intensity Scale",
    description: "Rate emotions on a 0-100 scale to track changes in intensity",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 3,
    category: "emotion_regulation"
  },
  {
    title: "STOPP Technique",
    description: "Stop, Take a breath, Observe, Perspective, Practice what works",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "5 minutes",
    target: 5,
    category: "emotion_regulation"
  },
  {
    title: "Behavioral Chain Analysis",
    description: "Analyze the chain of events leading to problematic emotions",
    frequency: "Weekly",
    difficulty: "Hard",
    duration: "30 minutes",
    target: 30,
    category: "emotion_regulation"
  },
  {
    title: "Body Scan for Emotions",
    description: "Scan your body to identify where you feel emotions physically",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "emotion_regulation"
  },
  {
    title: "Urge Surfing",
    description: "Ride out urges to act on emotions without giving in",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "emotion_regulation"
  },
  {
    title: "Emotional Vocabulary Building",
    description: "Expand your emotional vocabulary beyond basic terms",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "emotion_regulation"
  },
  {
    title: "Wise Mind for Emotions",
    description: "Access wise mind when making decisions while emotional",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "Varies",
    target: 3,
    category: "emotion_regulation"
  },
  {
    title: "Acting Effectively Despite Emotions",
    description: "Practice acting effectively even when emotions are intense",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "emotion_regulation"
  },
  {
    title: "Emotion Processing Journal",
    description: "Journal to process difficult emotions in depth",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "20 minutes",
    target: 20,
    category: "emotion_regulation"
  },
  {
    title: "Self-Soothing for Emotions",
    description: "Practice self-soothing techniques during emotional distress",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "emotion_regulation"
  },
  {
    title: "Changing Emotion-Driven Behaviors",
    description: "Identify and change behaviors driven by unwanted emotions",
    frequency: "Weekly",
    difficulty: "Hard",
    duration: "15 minutes",
    target: 15,
    category: "emotion_regulation"
  },
  {
    title: "Skill Review and Selection",
    description: "Review which emotion regulation skills work best in what situations",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "emotion_regulation"
  },
  {
    title: "Emotion Regulation Goals",
    description: "Set specific goals for improving emotion regulation",
    frequency: "Monthly",
    difficulty: "Medium",
    duration: "30 minutes",
    target: 30,
    category: "emotion_regulation"
  },
  {
    title: "Increasing Positive Interactions",
    description: "Deliberately increase positive interactions with others",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 2,
    category: "emotion_regulation"
  },
  {
    title: "Progressive Relaxation for Emotions",
    description: "Use progressive relaxation to regulate emotional intensity",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "15 minutes",
    target: 15,
    category: "emotion_regulation"
  },
  {
    title: "Emotional Triggers Identification",
    description: "Identify specific triggers for problematic emotions",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "20 minutes",
    target: 20,
    category: "emotion_regulation"
  },
  {
    title: "Emotional Effectiveness",
    description: "Evaluate if emotions are helping you meet your goals",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "10 minutes",
    target: 10,
    category: "emotion_regulation"
  },
  {
    title: "Mindful Emotional Awareness",
    description: "Practice mindful awareness of emotions without reacting",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "emotion_regulation"
  },
  {
    title: "Coping Strategies Toolkit",
    description: "Develop a personalized toolkit of emotion regulation strategies",
    frequency: "One Time",
    difficulty: "Medium",
    duration: "45 minutes",
    target: 45,
    category: "emotion_regulation"
  },
  {
    title: "Positive Memory Bank",
    description: "Collect and review positive memories to counter negative emotions",
    frequency: "Weekly",
    difficulty: "Easy",
    duration: "15 minutes",
    target: 15,
    category: "emotion_regulation"
  },
  {
    title: "Distress Tolerance Application",
    description: "Apply distress tolerance skills to regulate emotional intensity",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "emotion_regulation"
  },
  {
    title: "Checking Assumptions About Emotions",
    description: "Identify and check assumptions that drive emotional responses",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "emotion_regulation"
  },
  {
    title: "Emotion Coaching Self-Talk",
    description: "Develop supportive self-talk to coach yourself through emotions",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "emotion_regulation"
  }
];

const interpersonalEffectivenessChallenges = [
  {
    title: "DEAR MAN Practice",
    description: "Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate",
    frequency: "Weekly",
    difficulty: "Hard",
    duration: "15 minutes",
    target: 15,
    category: "interpersonal_effectiveness"
  },
  {
    title: "GIVE Skills",
    description: "Gentle, Interested, Validate, Easy manner to maintain relationships",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "FAST Skills",
    description: "Fair, Apologies (no excessive), Stick to values, Truthful for self-respect",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Active Listening Practice",
    description: "Practice fully attending to the speaker without planning your response",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Validation Practice",
    description: "Practice validating others' experiences and feelings",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 3,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Boundary Setting",
    description: "Practice setting clear, appropriate boundaries in relationships",
    frequency: "Weekly",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Relationship Values",
    description: "Identify and clarify your values in relationships",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "20 minutes",
    target: 20,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Interpersonal Effectiveness Diary",
    description: "Track interpersonal interactions, goals, and skills used",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "10 minutes",
    target: 10,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Effectiveness Priorities",
    description: "Clarify objectives, relationships, and self-respect priorities",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Interpersonal Myths",
    description: "Identify and challenge unhelpful beliefs about relationships",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Relationship Mindfulness",
    description: "Practice mindfulness during interpersonal interactions",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 2,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Saying No Effectively",
    description: "Practice declining requests while maintaining relationships",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Making Requests Effectively",
    description: "Practice making clear, direct requests",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Finding Middle Paths",
    description: "Practice finding balanced solutions in interpersonal conflicts",
    frequency: "Weekly",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Relationship Repair",
    description: "Practice skills for repairing relationship ruptures",
    frequency: "As Needed",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Nonjudgmental Stance",
    description: "Practice taking a nonjudgmental stance toward others",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "All Day",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Interpersonal Effectiveness Factors",
    description: "Consider factors that help or hinder effectiveness",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Conflict Resolution Skills",
    description: "Practice structured approach to resolving conflicts",
    frequency: "As Needed",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Interpersonal Coping Statements",
    description: "Develop helpful statements for challenging interactions",
    frequency: "Weekly",
    difficulty: "Easy",
    duration: "15 minutes",
    target: 15,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Social Connection Building",
    description: "Take actions to build positive social connections",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Self-Respect Affirmations",
    description: "Create and practice affirmations supporting self-respect",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 5,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Interpersonal Problem Analysis",
    description: "Analyze patterns in recurring interpersonal problems",
    frequency: "Weekly",
    difficulty: "Hard",
    duration: "30 minutes",
    target: 30,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Assertiveness Training",
    description: "Practice assertive communication techniques",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Non-Verbal Communication Awareness",
    description: "Increase awareness of your non-verbal communication",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Difficult Conversations Planning",
    description: "Plan and practice approaching difficult conversations",
    frequency: "As Needed",
    difficulty: "Hard",
    duration: "20 minutes",
    target: 20,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Relationship Nurturing",
    description: "Take actions to nurture important relationships",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "30 minutes",
    target: 30,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Active Relationship Maintenance",
    description: "Proactively maintain relationships rather than waiting for problems",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Emotional Intelligence in Relationships",
    description: "Practice recognizing and responding to others' emotions",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Relationship Goals Setting",
    description: "Set specific goals for improving important relationships",
    frequency: "Monthly",
    difficulty: "Medium",
    duration: "20 minutes",
    target: 20,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Meeting New People Skills",
    description: "Practice skills for meeting new people and building connections",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Building Trust",
    description: "Take actions specifically aimed at building trust in relationships",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Apologizing Effectively",
    description: "Practice making genuine, effective apologies when appropriate",
    frequency: "As Needed",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Appreciation Practice",
    description: "Regularly express genuine appreciation to others",
    frequency: "Daily",
    difficulty: "Easy",
    duration: "5 minutes",
    target: 2,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Healthy Relationship Assessment",
    description: "Assess the health of your relationships using specific criteria",
    frequency: "Monthly",
    difficulty: "Medium",
    duration: "30 minutes",
    target: 30,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Dialectical Thinking in Relationships",
    description: "Practice holding seemingly opposite viewpoints simultaneously",
    frequency: "Daily",
    difficulty: "Hard",
    duration: "15 minutes",
    target: 15,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Social Vulnerability Practice",
    description: "Practice appropriate vulnerability to deepen connections",
    frequency: "Weekly",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Friendship Building",
    description: "Take specific actions to build new friendships",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "60 minutes",
    target: 60,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Conflict Avoidance Reduction",
    description: "Practice addressing conflicts rather than avoiding them",
    frequency: "Weekly",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Clear Communication Practice",
    description: "Practice clear, direct communication without assumptions",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Active Relationship Repair",
    description: "Initiate repair when relationships become strained",
    frequency: "As Needed",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Interpersonal Effectiveness Scripts",
    description: "Create and practice scripts for challenging interactions",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "20 minutes",
    target: 20,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Social Support Network",
    description: "Map and strengthen your social support network",
    frequency: "Monthly",
    difficulty: "Medium",
    duration: "30 minutes",
    target: 30,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Social Anxiety Management",
    description: "Practice skills to manage anxiety in social situations",
    frequency: "Weekly",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Self-Advocacy Practice",
    description: "Practice advocating for your needs in relationships",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Interpersonal Meditation",
    description: "Meditate on loving-kindness toward challenging relationships",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "15 minutes",
    target: 15,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Emotional Validation Skills",
    description: "Develop skills for validating others' emotions",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 2,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Interpersonal Mindfulness",
    description: "Practice staying mindful during interpersonal interactions",
    frequency: "Daily",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Asking for Support",
    description: "Practice asking for support when needed",
    frequency: "Weekly",
    difficulty: "Medium",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Receiving Feedback",
    description: "Practice receiving feedback without defensiveness",
    frequency: "Weekly",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  },
  {
    title: "Giving Constructive Feedback",
    description: "Practice giving feedback that is helpful and respectful",
    frequency: "Weekly",
    difficulty: "Hard",
    duration: "Varies",
    target: 1,
    category: "interpersonal_effectiveness"
  }
];

async function seedDBTChallenges() {
  try {
    console.log('Starting to seed DBT wellness challenges...');
    
    // Get the first user's ID (assuming there's at least one user in the system)
    const users = await db.query.users.findMany({ limit: 1 });
    
    if (users.length === 0) {
      console.error('No users found in the database. Please create a user first.');
      process.exit(1);
    }
    
    const userId = users[0].id;
    console.log(`Using user ID: ${userId} for seeding challenges`);
    
    // Set dates for challenges
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 30); // End in 30 days
    
    // Helper function to seed challenges
    async function seedChallenges(challenges, category) {
      console.log(`Seeding ${category} challenges...`);
      
      for (const challenge of challenges) {
        try {
          const [insertedChallenge] = await db.insert(wellnessChallenges).values({
            title: challenge.title,
            description: challenge.description,
            type: challenge.category,
            frequency: challenge.frequency.toLowerCase(),
            status: 'active',
            difficulty: challenge.difficulty.toLowerCase(),
            duration: challenge.duration,
            targetValue: challenge.target,
            userId: userId,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            createdAt: new Date(),
            updatedAt: new Date()
          }).returning();
          
          console.log(`Added challenge: ${challenge.title} (ID: ${insertedChallenge.id})`);
        } catch (err) {
          console.error(`Error adding challenge '${challenge.title}':`, err);
        }
      }
    }

    // Seed all challenge categories
    await seedChallenges(mindfulnessChallenges, 'Mindfulness');
    await seedChallenges(distressToleranceChallenges, 'Distress Tolerance');
    await seedChallenges(emotionRegulationChallenges, 'Emotion Regulation');
    await seedChallenges(interpersonalEffectivenessChallenges, 'Interpersonal Effectiveness');

    console.log('All DBT challenges have been seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DBT challenges:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDBTChallenges();