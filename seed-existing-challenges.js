/**
 * Seed script for adding the existing hardcoded challenges to the database
 * This script migrates the hardcoded challenges from the frontend to the database
 * for the original categories: Emotions, Meditation, Journaling, and Activity
 */

import { db } from './server/db.ts';
import { wellnessChallenges } from './shared/schema.ts';

// Define the hardcoded challenges from the frontend
const emotionsChallenges = [
  {
    title: "Daily Gratitude Practice",
    description: "Write down three things you are grateful for each day to build a positive mindset",
    frequency: "daily",
    difficulty: "easy",
    duration: "5 minutes",
    target: 3,
  },
  {
    title: "Emotion Tracking",
    description: "Record your emotions throughout the day and identify patterns in your mood",
    frequency: "daily",
    difficulty: "medium",
    duration: "2 minutes",
    target: 5,
  },
  {
    title: "Positive Affirmations",
    description: "Repeat three positive affirmations each morning to start your day with confidence",
    frequency: "daily",
    difficulty: "easy",
    duration: "2 minutes",
    target: 3,
  },
  {
    title: "Joy Journal",
    description: "Document one moment of joy each day, no matter how small it might seem",
    frequency: "daily",
    difficulty: "easy",
    duration: "5 minutes",
    target: 1,
  },
  {
    title: "Compassion Practice",
    description: "Perform one act of kindness or compassion daily for yourself or others",
    frequency: "daily",
    difficulty: "medium",
    duration: "10 minutes",
    target: 1,
  },
  {
    title: "Emotional Vocabulary",
    description: "Learn and use one new emotion word each day to better express your feelings",
    frequency: "daily",
    difficulty: "medium",
    duration: "5 minutes",
    target: 1,
  },
  {
    title: "Worry Time",
    description: "Schedule 10 minutes to write down all your worries, then set them aside",
    frequency: "daily",
    difficulty: "medium",
    duration: "10 minutes",
    target: 1,
  }
];

const meditationChallenges = [
  {
    title: "Morning Mindfulness",
    description: "Start each day with a 10-minute meditation to center yourself",
    frequency: "daily",
    difficulty: "medium",
    duration: "10 minutes",
    target: 10,
  },
  {
    title: "Breath Awareness",
    description: "Take 5 short one-minute breathing breaks throughout your day",
    frequency: "daily",
    difficulty: "easy",
    duration: "1 minute",
    target: 5,
  },
  {
    title: "Body Scan",
    description: "Practice a full body scan meditation to release tension",
    frequency: "daily",
    difficulty: "medium",
    duration: "15 minutes",
    target: 15,
  },
  {
    title: "Walking Meditation",
    description: "Practice mindful walking for 10 minutes, feeling each step",
    frequency: "daily",
    difficulty: "medium",
    duration: "10 minutes",
    target: 10,
  },
  {
    title: "Loving-Kindness",
    description: "Practice sending compassion to yourself and others",
    frequency: "daily",
    difficulty: "medium",
    duration: "15 minutes",
    target: 15,
  }
];

const journalingChallenges = [
  {
    title: "Evening Reflection",
    description: "Write a daily journal entry about your day, challenges, and wins",
    frequency: "daily",
    difficulty: "medium",
    duration: "10 minutes",
    target: 1,
  },
  {
    title: "Thought Reframing",
    description: "Journal about negative thoughts and reframe them positively",
    frequency: "daily",
    difficulty: "hard",
    duration: "15 minutes",
    target: 3,
  },
  {
    title: "Stream of Consciousness",
    description: "Write without stopping or editing for 5 minutes each morning",
    frequency: "daily",
    difficulty: "medium",
    duration: "5 minutes",
    target: 1,
  },
  {
    title: "Gratitude List",
    description: "List 5 things you're grateful for each day",
    frequency: "daily",
    difficulty: "easy",
    duration: "5 minutes",
    target: 5,
  },
  {
    title: "Goal Journaling",
    description: "Write about your progress toward your goals each week",
    frequency: "weekly",
    difficulty: "medium",
    duration: "20 minutes",
    target: 1,
  },
  {
    title: "Values Reflection",
    description: "Journal about how your actions aligned with your values today",
    frequency: "daily",
    difficulty: "medium",
    duration: "10 minutes",
    target: 1,
  }
];

const activityChallenges = [
  {
    title: "Daily Movement",
    description: "Get at least 30 minutes of physical activity each day",
    frequency: "daily",
    difficulty: "medium",
    duration: "30 minutes",
    target: 30,
  },
  {
    title: "Hydration Habit",
    description: "Drink 8 glasses of water daily",
    frequency: "daily",
    difficulty: "easy",
    duration: "all day",
    target: 8,
  },
  {
    title: "Phone-Free Time",
    description: "Spend 1 hour each day completely free from screens",
    frequency: "daily",
    difficulty: "hard",
    duration: "60 minutes",
    target: 60,
  },
  {
    title: "Nature Connection",
    description: "Spend at least 15 minutes outside in nature each day",
    frequency: "daily",
    difficulty: "easy",
    duration: "15 minutes",
    target: 15,
  },
  {
    title: "Stretch Break",
    description: "Take 3 short stretch breaks throughout your day",
    frequency: "daily",
    difficulty: "easy",
    duration: "5 minutes",
    target: 3,
  },
  {
    title: "Sleep Hygiene",
    description: "Maintain a consistent sleep schedule and relaxing bedtime routine",
    frequency: "daily",
    difficulty: "medium",
    duration: "8 hours",
    target: 1,
  }
];

async function seedExistingChallenges() {
  try {
    console.log('Starting to seed existing wellness challenges...');
    
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
    async function seedChallenges(challenges, categoryType) {
      console.log(`Seeding ${categoryType} challenges...`);
      
      for (const challenge of challenges) {
        try {
          const [insertedChallenge] = await db.insert(wellnessChallenges).values({
            title: challenge.title,
            description: challenge.description,
            type: categoryType,
            frequency: challenge.frequency,
            status: 'active',
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
    await seedChallenges(emotionsChallenges, 'emotions');
    await seedChallenges(meditationChallenges, 'meditation');
    await seedChallenges(journalingChallenges, 'journaling');
    await seedChallenges(activityChallenges, 'activity');

    console.log('All existing challenges have been seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding existing challenges:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedExistingChallenges();