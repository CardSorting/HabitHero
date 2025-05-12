// Script to seed the database with pre-defined wellness challenges
import { db } from './server/db.js';
import { wellnessChallenges, wellnessChallengeGoals } from './shared/schema.js';

async function seedWellnessChallenges() {
  console.log('Starting to seed wellness challenges...');
  
  try {
    // Get the first user's ID (assuming there's at least one user in the system)
    const users = await db.query.users.findMany({ limit: 1 });
    
    if (users.length === 0) {
      console.error('No users found in the database. Please create a user first.');
      process.exit(1);
    }
    
    const userId = users[0].id;
    console.log(`Using user ID: ${userId} for seeding challenges`);
    
    // Define challenge templates for each category
    const challengeTemplates = [
      // Emotions category
      {
        title: 'Daily Gratitude Practice',
        description: 'Write down three things you are grateful for each day',
        challengeType: 'emotions',
        frequency: 'daily',
        targetValue: 3,
        goals: [
          { description: 'Write at least three items daily', targetValue: 3 },
          { description: 'Include at least one new item each day', targetValue: 1 },
          { description: 'Reflect on why you\'re grateful for these things', targetValue: 1 }
        ]
      },
      {
        title: 'Emotion Tracking',
        description: 'Record your emotions and their intensity throughout the day',
        challengeType: 'emotions',
        frequency: 'daily',
        targetValue: 5,
        goals: [
          { description: 'Record at least 5 emotion check-ins daily', targetValue: 5 },
          { description: 'Note what triggered each emotion', targetValue: 5 },
          { description: 'Identify patterns by the end of the week', targetValue: 1 }
        ]
      },
      
      // Meditation category
      {
        title: 'Morning Mindfulness',
        description: 'Start each day with a 10-minute meditation',
        challengeType: 'meditation',
        frequency: 'daily',
        targetValue: 10,
        goals: [
          { description: 'Meditate for 10 minutes each morning', targetValue: 10 },
          { description: 'Practice before checking your phone', targetValue: 1 },
          { description: 'Notice improvements in morning energy', targetValue: 1 }
        ]
      },
      {
        title: 'Breath Awareness',
        description: 'Take short breathing breaks throughout the day',
        challengeType: 'meditation',
        frequency: 'daily',
        targetValue: 5,
        goals: [
          { description: 'Take 5 one-minute breathing breaks daily', targetValue: 5 },
          { description: 'Practice 4-7-8 breathing technique', targetValue: 5 },
          { description: 'Notice your stress levels before and after', targetValue: 5 }
        ]
      },
      
      // Journaling category
      {
        title: 'Evening Reflection',
        description: 'Write a daily journal entry about your day',
        challengeType: 'journaling',
        frequency: 'daily',
        targetValue: 1,
        goals: [
          { description: 'Write at least 200 words each evening', targetValue: 200 },
          { description: 'Include both challenges and wins', targetValue: 2 },
          { description: 'Note one lesson learned each day', targetValue: 1 }
        ]
      },
      {
        title: 'Thought Reframing',
        description: 'Journal about negative thoughts and reframe them positively',
        challengeType: 'journaling',
        frequency: 'daily',
        targetValue: 3,
        goals: [
          { description: 'Identify 3 negative thoughts daily', targetValue: 3 },
          { description: 'Write a positive reframe for each', targetValue: 3 },
          { description: 'Note evidence supporting the positive view', targetValue: 3 }
        ]
      },
      
      // Activity category
      {
        title: 'Daily Movement',
        description: 'Get at least 30 minutes of physical activity each day',
        challengeType: 'activity',
        frequency: 'daily',
        targetValue: 30,
        goals: [
          { description: 'Move for at least 30 minutes daily', targetValue: 30 },
          { description: 'Include variety in your activities', targetValue: 1 },
          { description: 'Note your energy levels after activity', targetValue: 1 }
        ]
      },
      {
        title: 'Hydration Habit',
        description: 'Drink 8 glasses of water daily',
        challengeType: 'activity',
        frequency: 'daily',
        targetValue: 8,
        goals: [
          { description: 'Drink 8 glasses (64oz) of water daily', targetValue: 8 },
          { description: 'Start your day with a full glass of water', targetValue: 1 },
          { description: 'Track how you feel as hydration improves', targetValue: 1 }
        ]
      }
    ];
    
    // Set dates for challenges
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 3); // Start 3 days ago
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 27); // End in approximately 1 month
    
    // Insert challenges
    for (const template of challengeTemplates) {
      console.log(`Creating challenge: ${template.title}`);
      
      // Insert the challenge
      const [challenge] = await db.insert(wellnessChallenges).values({
        userId: userId,
        title: template.title,
        description: template.description,
        type: template.challengeType,
        frequency: template.frequency,
        status: 'active',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        targetValue: template.targetValue,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      // Insert associated goals
      for (const goal of template.goals) {
        await db.insert(wellnessChallengeGoals).values({
          challengeId: challenge.id,
          title: goal.description, // Using description as title
          description: goal.description,
          targetValue: goal.targetValue,
          createdAt: new Date()
        });
      }
      
      console.log(`Created challenge ID: ${challenge.id} with goals`);
    }
    
    console.log('Successfully seeded wellness challenges!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding wellness challenges:', error);
    process.exit(1);
  }
}

// Run the seed function
seedWellnessChallenges();