/**
 * Comprehensive DBT Flash Cards Expansion
 * Adding authentic DBT skills following industry standard guidelines
 * Based on Marsha Linehan's DBT methodology and therapeutic practices
 */

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Extensive DBT Skills following authentic methodology
const comprehensiveDBTSkills = [
  // MINDFULNESS MODULE - Expanded with authentic DBT content
  {
    category: 'mindfulness',
    skill_name: 'Wise Mind ACCEPTS',
    question: 'What does the ACCEPTS acronym stand for in distress tolerance?',
    answer: 'Activities, Contributing, Comparisons, Emotions (opposite), Push away, Thoughts (other), Sensations',
    skill_description: 'A comprehensive distress tolerance technique combining mindful awareness with practical coping strategies.',
    skill_purpose: 'To survive crisis situations without making them worse through impulsive actions.',
    when_to_use: 'During intense emotional distress when you need immediate relief without long-term consequences.',
    difficulty_level: 'medium'
  },
  {
    category: 'mindfulness',
    skill_name: 'Mindful Eating Practice',
    question: 'How do you practice mindful eating using DBT principles?',
    answer: 'Notice colors, textures, smells. Chew slowly. Pay attention to taste changes. Notice hunger/fullness cues. Observe judgments without acting on them.',
    skill_description: 'Using mindfulness to develop a healthy relationship with food and eating behaviors.',
    skill_purpose: 'To increase awareness of eating patterns and reduce emotional or mindless eating.',
    when_to_use: 'During meals, when struggling with eating disorders, or when eating has become automatic.',
    difficulty_level: 'easy'
  },
  {
    category: 'mindfulness',
    skill_name: 'Mindfulness of Current Thoughts',
    question: 'What is the "thoughts on clouds" mindfulness technique?',
    answer: 'Visualize thoughts as clouds passing through the sky of your mind. Watch them come and go without trying to change or hold onto them.',
    skill_description: 'A visualization technique for observing thoughts without getting caught up in their content.',
    skill_purpose: 'To develop cognitive flexibility and reduce rumination by creating distance from thoughts.',
    when_to_use: 'When experiencing racing thoughts, anxiety, or getting stuck in negative thinking patterns.',
    difficulty_level: 'easy'
  },
  {
    category: 'mindfulness',
    skill_name: 'Mindfulness of Body Sensations',
    question: 'How do you practice body scan mindfulness in DBT?',
    answer: 'Start at your toes and slowly move attention up your body. Notice sensations without trying to change them. Include areas of tension, relaxation, warmth, or coolness.',
    skill_description: 'Systematic attention to physical sensations throughout the body.',
    skill_purpose: 'To increase bodily awareness and identify early signs of emotional or physical distress.',
    when_to_use: 'When feeling disconnected from your body, before sleep, or when experiencing physical tension.',
    difficulty_level: 'easy'
  },
  {
    category: 'mindfulness',
    skill_name: 'Mindful Movement',
    question: 'What are key elements of mindful movement in DBT?',
    answer: 'Focus on the sensation of movement, coordinate with breathing, notice balance and coordination, stay present with the activity.',
    skill_description: 'Bringing mindful awareness to physical movement and exercise.',
    skill_purpose: 'To integrate mindfulness into daily physical activities and improve mind-body connection.',
    when_to_use: 'During exercise, walking, stretching, or any physical activity.',
    difficulty_level: 'easy'
  },

  // DISTRESS TOLERANCE MODULE - Expanded with authentic techniques
  {
    category: 'distress_tolerance',
    skill_name: 'TIPP for Intense Emotions',
    question: 'What does TIPP stand for and how does each component work?',
    answer: 'Temperature (cold water/ice), Intense Exercise, Paced Breathing, Paired Muscle Relaxation. Each rapidly changes body chemistry to reduce emotional intensity.',
    skill_description: 'Fast-acting techniques to change your body chemistry and reduce emotional intensity quickly.',
    skill_purpose: 'To rapidly decrease emotional arousal when emotions are at 7-10 intensity level.',
    when_to_use: 'During emotional crises, panic attacks, or when emotions feel overwhelming and unmanageable.',
    difficulty_level: 'easy'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Radical Acceptance of Pain',
    question: 'How do you practice radical acceptance when experiencing emotional pain?',
    answer: 'Acknowledge "this is painful right now," stop fighting reality, breathe into the pain, remind yourself that pain is temporary, focus on what you can control.',
    skill_description: 'Fully accepting painful emotions and situations without trying to change or fight them.',
    skill_purpose: 'To reduce additional suffering that comes from fighting against painful realities.',
    when_to_use: 'When experiencing grief, disappointment, trauma reactions, or any unavoidable emotional pain.',
    difficulty_level: 'advanced'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Distraction Techniques',
    question: 'What are the main categories of healthy distraction in DBT?',
    answer: 'Activities (puzzles, crafts), Contributing (volunteering, helping others), Comparisons (with worse situations), Emotions (opposite emotions), Push away (thoughts), Thoughts (other focus), Sensations (intense but safe).',
    skill_description: 'Temporarily shifting attention away from distressing thoughts and emotions.',
    skill_purpose: 'To get through crisis moments without making situations worse through impulsive actions.',
    when_to_use: 'When emotions are too intense to solve problems effectively or when immediate action would be harmful.',
    difficulty_level: 'easy'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Self-Soothing with Five Senses',
    question: 'How do you practice self-soothing using all five senses?',
    answer: 'Vision: beautiful images; Hearing: calming music; Smell: pleasant scents; Taste: comforting flavors; Touch: soft textures or warm baths.',
    skill_description: 'Using sensory experiences to provide comfort and emotional regulation.',
    skill_purpose: 'To nurture yourself during difficult times and activate the parasympathetic nervous system.',
    when_to_use: 'When feeling emotionally depleted, after stressful events, or when needing comfort.',
    difficulty_level: 'easy'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'IMPROVE the Moment',
    question: 'What does the IMPROVE acronym include for crisis survival?',
    answer: 'Imagery, Meaning, Prayer/spirituality, Relaxation, One thing at a time, Vacation (brief break), Encouragement (self-talk).',
    skill_description: 'Seven techniques to make difficult moments more bearable.',
    skill_purpose: 'To survive crisis situations and make painful moments more tolerable.',
    when_to_use: 'During acute distress when you need to get through the next few minutes or hours.',
    difficulty_level: 'medium'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Pros and Cons Analysis',
    question: 'How do you use pros and cons for distress tolerance decisions?',
    answer: 'List pros and cons of tolerating distress vs. acting impulsively. Consider short-term and long-term consequences for each option.',
    skill_description: 'Systematic evaluation of options during emotional distress.',
    skill_purpose: 'To make wise decisions when emotions are high by engaging rational thinking.',
    when_to_use: 'When considering impulsive actions that might have negative consequences.',
    difficulty_level: 'medium'
  },

  // EMOTION REGULATION MODULE - Expanded with authentic strategies
  {
    category: 'emotion_regulation',
    skill_name: 'Emotion Regulation PLEASE Skills',
    question: 'What does PLEASE stand for in emotion regulation?',
    answer: 'Protect from illness, balance Eating, avoid mood-Altering substances, balance Sleep, get Exercise',
    skill_description: 'Basic self-care practices that create emotional vulnerability or resilience.',
    skill_purpose: 'To maintain emotional stability through biological and physical wellness.',
    when_to_use: 'Daily as prevention, and especially when emotions feel more intense than usual.',
    difficulty_level: 'easy'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Emotional Granularity',
    question: 'How do you practice emotional granularity in DBT?',
    answer: 'Use specific emotion words instead of general ones. Notice subtle differences between similar emotions. Rate intensity levels. Identify emotion mixtures.',
    skill_description: 'Developing precise vocabulary and awareness for emotional experiences.',
    skill_purpose: 'To better understand and communicate about emotions, leading to more effective regulation.',
    when_to_use: 'When emotions feel confusing, overwhelming, or when you notice saying "fine" or "upset" frequently.',
    difficulty_level: 'medium'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Mastery Activities',
    question: 'What are mastery activities and how do they help with emotions?',
    answer: 'Activities that provide a sense of accomplishment and competence. They build confidence and positive emotions while creating meaning.',
    skill_description: 'Engaging in activities that build skills, confidence, and positive emotions.',
    skill_purpose: 'To increase positive emotions and build a sense of mastery and accomplishment.',
    when_to_use: 'When feeling depressed, worthless, or lacking motivation; as regular emotional maintenance.',
    difficulty_level: 'easy'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Pleasant Events Scheduling',
    question: 'How do you effectively schedule pleasant activities for emotion regulation?',
    answer: 'Plan at least one pleasant activity daily. Include both small (tea, music) and larger (outings) activities. Schedule them like appointments. Notice and savor the experience.',
    skill_description: 'Systematically planning and engaging in enjoyable activities.',
    skill_purpose: 'To increase positive emotions and build resilience against negative emotional states.',
    when_to_use: 'When feeling depressed, when life feels routine, or as regular emotional maintenance.',
    difficulty_level: 'easy'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Building Positive Experiences',
    question: 'What are the two types of positive experiences to build in DBT?',
    answer: 'Short-term: pleasant events in the moment. Long-term: working toward goals and values that create meaning and accomplishment.',
    skill_description: 'Creating both immediate and long-term sources of positive emotions.',
    skill_purpose: 'To build a life worth living and increase emotional resilience.',
    when_to_use: 'Ongoing as part of creating a balanced, meaningful life.',
    difficulty_level: 'medium'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Emotion Surfing',
    question: 'How do you practice emotion surfing?',
    answer: 'Notice the emotion arising, observe its peak intensity, stay present as it naturally decreases. Like surfing a wave - ride it without fighting it.',
    skill_description: 'Allowing emotions to rise and fall naturally without trying to control them.',
    skill_purpose: 'To learn that emotions are temporary and naturally decrease when not fed by thoughts or actions.',
    when_to_use: 'When experiencing strong emotions that you want to change but cannot in the moment.',
    difficulty_level: 'medium'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Emotion Regulation in Relationships',
    question: 'How do you regulate emotions during interpersonal conflicts?',
    answer: 'Use STOP skill first, identify your emotion and its validity, consider the other person\'s perspective, choose response based on relationship goals.',
    skill_description: 'Managing emotions effectively during relationship challenges.',
    skill_purpose: 'To maintain relationships while honoring your own emotional experience.',
    when_to_use: 'During conflicts, when feeling hurt by others, or when relationship emotions are intense.',
    difficulty_level: 'advanced'
  },

  // INTERPERSONAL EFFECTIVENESS MODULE - Expanded with authentic techniques
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'DEAR MAN for Requests',
    question: 'How do you use DEAR MAN to make effective requests?',
    answer: 'Describe situation, Express feelings, Assert needs, Reinforce benefits. Be Mindful, Appear confident, Negotiate when possible.',
    skill_description: 'Structured approach for asking for what you need or want.',
    skill_purpose: 'To increase the likelihood of getting your needs met while maintaining relationships.',
    when_to_use: 'When you need something from someone or want to make a request.',
    difficulty_level: 'medium'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'GIVE Skills for Relationships',
    question: 'What does GIVE stand for in interpersonal effectiveness?',
    answer: 'Gentle approach, show Interest, Validate, use Easy manner. These maintain and strengthen relationships.',
    skill_description: 'Skills for maintaining positive relationships while being assertive.',
    skill_purpose: 'To keep relationships healthy while still advocating for your needs.',
    when_to_use: 'In all interpersonal interactions, especially when relationship maintenance is important.',
    difficulty_level: 'easy'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'FAST for Self-Respect',
    question: 'How does FAST help maintain self-respect in relationships?',
    answer: 'Fair to self and others, no Apologies for existing, Stick to values, Truthful. Maintains dignity and self-worth.',
    skill_description: 'Maintaining self-respect and integrity in interpersonal situations.',
    skill_purpose: 'To preserve your sense of self-worth and values while interacting with others.',
    when_to_use: 'When feeling pressured to compromise your values or when self-respect is at stake.',
    difficulty_level: 'medium'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Interpersonal Problem-Solving',
    question: 'What are the steps for collaborative problem-solving in relationships?',
    answer: 'Define the problem together, brainstorm solutions without judgment, evaluate options considering both perspectives, agree on a solution to try, set a time to review.',
    skill_description: 'Working together to solve interpersonal problems.',
    skill_purpose: 'To resolve conflicts in a way that strengthens rather than damages relationships.',
    when_to_use: 'When facing ongoing relationship problems that require collaborative solutions.',
    difficulty_level: 'advanced'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Boundary Setting',
    question: 'How do you set healthy boundaries using DBT principles?',
    answer: 'Identify your limits, communicate them clearly using DEAR MAN, maintain consistency, be prepared for pushback, use broken record technique if needed.',
    skill_description: 'Establishing and maintaining personal limits in relationships.',
    skill_purpose: 'To protect your well-being while maintaining healthy relationships.',
    when_to_use: 'When others are crossing your limits or when you feel taken advantage of.',
    difficulty_level: 'medium'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Validation Skills',
    question: 'What are the levels of validation in DBT?',
    answer: 'Level 1: Being present. Level 2: Accurate reflection. Level 3: Mind-reading. Level 4: Understanding history. Level 5: Normalizing. Level 6: Radical genuineness.',
    skill_description: 'Six levels of communicating understanding and acceptance to others.',
    skill_purpose: 'To strengthen relationships and help others feel understood and accepted.',
    when_to_use: 'In all relationships, especially when someone is distressed or sharing something important.',
    difficulty_level: 'advanced'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Conflict Resolution',
    question: 'What is the DBT approach to resolving interpersonal conflicts?',
    answer: 'Stay calm using distress tolerance skills, validate the other person first, use DEAR MAN for your perspective, look for win-win solutions, agree to disagree when necessary.',
    skill_description: 'Systematic approach to working through disagreements and conflicts.',
    skill_purpose: 'To resolve conflicts while preserving relationships and achieving mutual understanding.',
    when_to_use: 'During disagreements, arguments, or when relationship tensions arise.',
    difficulty_level: 'advanced'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Interpersonal Mindfulness',
    question: 'How do you practice mindfulness during interpersonal interactions?',
    answer: 'Stay present in conversations, notice your emotions without reacting immediately, observe the other person without judgment, stay focused on current interaction.',
    skill_description: 'Applying mindfulness principles to relationships and social interactions.',
    skill_purpose: 'To improve the quality of relationships and reduce interpersonal reactivity.',
    when_to_use: 'During all social interactions, especially when emotions are high or relationships are strained.',
    difficulty_level: 'medium'
  },

  // Additional Advanced Skills Across Modules
  {
    category: 'mindfulness',
    skill_name: 'Mindfulness in Daily Activities',
    question: 'How do you practice mindfulness while doing routine activities?',
    answer: 'Choose one daily activity (brushing teeth, washing dishes). Focus completely on physical sensations, movements, and present moment experience.',
    skill_description: 'Bringing mindful awareness to everyday tasks and routines.',
    skill_purpose: 'To integrate mindfulness into daily life and increase present moment awareness.',
    when_to_use: 'Throughout the day during routine activities as a way to practice mindfulness.',
    difficulty_level: 'easy'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Reality Acceptance Series',
    question: 'What are the steps in the reality acceptance series?',
    answer: 'Observe your resistance, practice willingness, achieve acceptance through radical acceptance, find meaning in suffering, commit to valued action despite pain.',
    skill_description: 'Progressive steps for accepting difficult realities.',
    skill_purpose: 'To move from fighting reality to accepting it and finding ways to create meaning.',
    when_to_use: 'When struggling with major life changes, losses, or unchangeable difficult situations.',
    difficulty_level: 'advanced'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Emotional Memory Processing',
    question: 'How do you process emotional memories using DBT skills?',
    answer: 'Use mindfulness to observe memory without becoming overwhelmed, practice opposite action if needed, use self-soothing, seek support when appropriate.',
    skill_description: 'Working with difficult emotional memories in a healthy way.',
    skill_purpose: 'To process past experiences without being overwhelmed by associated emotions.',
    when_to_use: 'When traumatic or difficult memories arise and interfere with current functioning.',
    difficulty_level: 'advanced'
  }
];

async function expandDBTFlashCards() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting comprehensive DBT flash cards expansion...');
    
    // Insert all new comprehensive DBT skills
    for (const skill of comprehensiveDBTSkills) {
      await client.query(
        `INSERT INTO dbt_flash_cards (category, skill_name, question, answer, skill_description, skill_purpose, when_to_use, difficulty_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [skill.category, skill.skill_name, skill.question, skill.answer, 
         skill.skill_description, skill.skill_purpose, skill.when_to_use, skill.difficulty_level]
      );
    }
    
    // Get final counts by category and difficulty
    const categoryStats = await client.query(`
      SELECT category, difficulty_level, COUNT(*) as count
      FROM dbt_flash_cards 
      GROUP BY category, difficulty_level 
      ORDER BY category, 
      CASE difficulty_level 
        WHEN 'easy' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'advanced' THEN 3 
      END
    `);
    
    const totalCount = await client.query('SELECT COUNT(*) as total FROM dbt_flash_cards');
    
    console.log('\n✅ DBT Flash Cards Library Successfully Expanded!');
    console.log(`📚 Total Cards: ${totalCount.rows[0].total}`);
    console.log('\n📊 Distribution by Category and Difficulty:');
    
    categoryStats.rows.forEach(row => {
      console.log(`   ${row.category} - ${row.difficulty_level}: ${row.count} cards`);
    });
    
    console.log('\n🎯 Features Added:');
    console.log('   • Authentic DBT methodology following industry standards');
    console.log('   • Comprehensive coverage of all four core modules');
    console.log('   • Progressive difficulty levels for structured learning');
    console.log('   • Practical application guidance for each skill');
    console.log('   • Evidence-based therapeutic techniques');
    
  } catch (error) {
    console.error('❌ Error expanding DBT flash cards:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the expansion
expandDBTFlashCards().catch(console.error);