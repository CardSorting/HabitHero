/**
 * Add DBT challenges for current user
 */
import { db } from './server/db.js';
import { wellnessChallenges } from './shared/schema.js';

async function addDBTChallenges() {
  try {
    console.log('Adding DBT wellness challenges for current user...');
    
    // Use user ID 8 (current user)
    const userId = 8;
    console.log(`Adding challenges for user ID: ${userId}`);
    
    // Set dates for challenges
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 30); // End in 30 days
    
    // DBT Challenge templates
    const dbtChallenges = [
      // Mindfulness challenges
      {
        title: 'Observe Without Judgment',
        description: 'Practice noticing thoughts and feelings without labeling them as good or bad',
        type: 'mindfulness',
        frequency: 'daily',
        targetValue: 3
      },
      {
        title: 'Wise Mind Practice',
        description: 'Find balance between emotional and rational mind through mindful awareness',
        type: 'mindfulness',
        frequency: 'daily',
        targetValue: 1
      },
      
      // Distress Tolerance challenges
      {
        title: 'TIPP for Crisis',
        description: 'Use Temperature, Intense exercise, Paced breathing, Paired muscle relaxation when distressed',
        type: 'distress-tolerance',
        frequency: 'weekly',
        targetValue: 2
      },
      {
        title: 'Distract with ACCEPTS',
        description: 'Practice Activities, Contributing, Comparisons, Emotions, Push away, Thoughts, Sensations',
        type: 'distress-tolerance',
        frequency: 'daily',
        targetValue: 1
      },
      
      // Emotion Regulation challenges
      {
        title: 'Opposite Action',
        description: 'Act opposite to the emotion when it doesn\'t fit the facts or is ineffective',
        type: 'emotion-regulation',
        frequency: 'daily',
        targetValue: 1
      },
      {
        title: 'PLEASE Skills',
        description: 'Treat PhysicaL illness, balance Eating, avoid mood-Altering substances, balance Sleep, get Exercise',
        type: 'emotion-regulation',
        frequency: 'daily',
        targetValue: 5
      },
      
      // Interpersonal Effectiveness challenges
      {
        title: 'DEAR MAN Practice',
        description: 'Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate',
        type: 'interpersonal-effectiveness',
        frequency: 'weekly',
        targetValue: 2
      },
      {
        title: 'GIVE Skills',
        description: 'Be Gentle, act Interested, Validate, use an Easy manner in relationships',
        type: 'interpersonal-effectiveness',
        frequency: 'daily',
        targetValue: 3
      }
    ];
    
    // Add challenges to database
    for (const challenge of dbtChallenges) {
      try {
        await db.insert(wellnessChallenges).values({
          title: challenge.title,
          description: challenge.description,
          type: challenge.type,
          frequency: challenge.frequency,
          status: 'active',
          targetValue: challenge.targetValue,
          userId: userId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`✓ Added: ${challenge.title} (${challenge.type})`);
      } catch (error) {
        console.error(`Error adding challenge ${challenge.title}:`, error);
      }
    }
    
    console.log('✓ Successfully added DBT challenges!');
    
  } catch (error) {
    console.error('Error adding DBT challenges:', error);
  } finally {
    process.exit(0);
  }
}

addDBTChallenges();