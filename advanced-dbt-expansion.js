/**
 * Advanced DBT Flash Cards Expansion - Clinical Grade Content
 * Adding therapeutically accurate, detailed DBT skills following exact clinical methodology
 * Based on Marsha Linehan's complete DBT manual and clinical practice guidelines
 */

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Advanced Clinical DBT Skills with exact therapeutic methodology
const advancedDBTSkills = [
  // MINDFULNESS MODULE - Advanced Clinical Techniques
  {
    category: 'mindfulness',
    skill_name: 'Three States of Mind Integration',
    question: 'How do you practice moving between Emotion Mind, Reasonable Mind, and Wise Mind in real-time?',
    answer: 'Notice when you\'re in Emotion Mind (hot, reactive). Shift to Reasonable Mind (cool, logical). Then integrate both by asking "What does my wise mind know?" Consider both feelings and facts to find the wise response.',
    skill_description: 'Clinical technique for real-time state-of-mind awareness and integration during emotional episodes.',
    skill_purpose: 'To develop moment-to-moment awareness of mental states and ability to access wisdom during crisis.',
    when_to_use: 'During emotional overwhelm, decision-making under stress, or when caught between emotions and logic.',
    difficulty_level: 'advanced'
  },
  {
    category: 'mindfulness',
    skill_name: 'Mindful Urge Surfing',
    question: 'What is the clinical technique for mindfully riding out urges without acting?',
    answer: 'Notice the urge arising, observe its physical sensations, breathe through the peak intensity, remind yourself "urges are temporary," stay present until it naturally decreases.',
    skill_description: 'Evidence-based technique for managing impulses and urges without acting on them destructively.',
    skill_purpose: 'To break the automatic urge-action cycle and develop distress tolerance around impulses.',
    when_to_use: 'When experiencing urges to engage in problem behaviors, self-harm, substance use, or impulsive actions.',
    difficulty_level: 'advanced'
  },
  {
    category: 'mindfulness',
    skill_name: 'Present Moment Radical Awareness',
    question: 'How do you practice the "This moment, exactly as it is" mindfulness technique?',
    answer: 'Stop and say "This moment, exactly as it is." Notice all sensations, thoughts, emotions without changing anything. Accept the complete present experience including discomfort.',
    skill_description: 'Intensive present-moment awareness practice for developing radical acceptance.',
    skill_purpose: 'To develop profound acceptance of current reality and reduce suffering from fighting what is.',
    when_to_use: 'When caught in past regrets, future anxieties, or fighting current circumstances.',
    difficulty_level: 'advanced'
  },
  {
    category: 'mindfulness',
    skill_name: 'Mindful Self-Compassion Practice',
    question: 'What are the clinical steps for practicing mindful self-compassion in DBT?',
    answer: 'Mindfully notice self-criticism. Place hand on heart. Say "This is a moment of suffering. Suffering is part of human experience. May I be kind to myself right now."',
    skill_description: 'Structured self-compassion practice integrated with mindfulness principles.',
    skill_purpose: 'To develop self-kindness and reduce self-judgment during difficult emotional experiences.',
    when_to_use: 'During self-criticism, shame spirals, or when treating yourself harshly.',
    difficulty_level: 'medium'
  },

  // DISTRESS TOLERANCE MODULE - Advanced Clinical Interventions
  {
    category: 'distress_tolerance',
    skill_name: 'Advanced TIPP Technique',
    question: 'How do you use TIPP with precise clinical timing and intensity?',
    answer: 'Temperature: 50°F water for 30 seconds on face/wrists. Intense Exercise: 10-15 minutes vigorous activity. Paced Breathing: 4-7-8 pattern. Paired Muscle: tense 5 seconds, release 10 seconds.',
    skill_description: 'Precise clinical application of TIPP for maximum effectiveness in crisis situations.',
    skill_purpose: 'To rapidly change body chemistry and nervous system activation when emotions reach crisis levels.',
    when_to_use: 'When emotions are 8-10 intensity, during panic attacks, or before potential self-destructive actions.',
    difficulty_level: 'medium'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Radical Acceptance Series - Complete',
    question: 'What are all seven steps of the complete Radical Acceptance process?',
    answer: '1) Observe your resistance. 2) Remind yourself reality is what it is. 3) Consider causes beyond your control. 4) Practice willingness. 5) Pay attention with your whole self. 6) Acknowledge "it is as it is." 7) Allow disappointment, sadness, or grief.',
    skill_description: 'Complete clinical protocol for achieving radical acceptance of unchangeable painful realities.',
    skill_purpose: 'To fully accept painful realities and reduce the additional suffering that comes from non-acceptance.',
    when_to_use: 'When facing major losses, trauma, chronic illness, or any unchangeable painful situation.',
    difficulty_level: 'advanced'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Distraction with Wisdom',
    question: 'How do you use healthy distraction while maintaining emotional awareness?',
    answer: 'Choose activities that match your emotional intensity. Use bilateral activities (walking, juggling). Set a time limit. Check in with emotions afterward. Return to processing when calmer.',
    skill_description: 'Strategic use of distraction that doesn\'t avoid emotions but creates space for wise action.',
    skill_purpose: 'To temporarily step away from overwhelming emotions while maintaining connection to inner wisdom.',
    when_to_use: 'When emotions are too intense for problem-solving but you need to function or prevent harm.',
    difficulty_level: 'medium'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Crisis Survival Box Technique',
    question: 'What should be included in a comprehensive crisis survival box?',
    answer: 'Ice cubes, strong mints, essential oils, stress ball, comfort object, crisis plan card, list of supports, meaningful photos, inspirational quotes, and emergency contact list.',
    skill_description: 'Pre-prepared collection of sensory and cognitive tools for crisis moments.',
    skill_purpose: 'To have immediate access to multiple distress tolerance tools when thinking clearly is difficult.',
    when_to_use: 'During any crisis situation when you need immediate sensory grounding and comfort.',
    difficulty_level: 'easy'
  },

  // EMOTION REGULATION MODULE - Advanced Clinical Strategies
  {
    category: 'emotion_regulation',
    skill_name: 'Advanced Opposite Action Protocol',
    question: 'What is the complete clinical protocol for Opposite Action?',
    answer: '1) Identify the emotion and urge. 2) Check if emotion fits facts and intensity. 3) If not, do opposite action completely (posture, facial expression, thoughts, actions). 4) Maintain until emotion changes. 5) Practice repeatedly.',
    skill_description: 'Complete clinical methodology for changing emotions through opposite behavioral activation.',
    skill_purpose: 'To effectively change emotions that don\'t fit the facts or are disproportionately intense.',
    when_to_use: 'When experiencing depression (activate), anxiety (approach fears), anger (gentle responses), shame (hold head high).',
    difficulty_level: 'advanced'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Emotional Granularity Training',
    question: 'How do you practice clinical emotional granularity assessment?',
    answer: 'Use emotion words wheel. Rate intensity 0-10. Identify emotion families. Notice body sensations. Track triggers. Differentiate between primary and secondary emotions.',
    skill_description: 'Systematic training in precise emotional awareness and differentiation.',
    skill_purpose: 'To develop sophisticated emotional awareness that enables more effective regulation strategies.',
    when_to_use: 'Daily for emotional awareness building, and during therapy sessions for precise emotional processing.',
    difficulty_level: 'medium'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Build Positive Experiences - ABC PLEASE',
    question: 'What does ABC PLEASE stand for in building positive experiences?',
    answer: 'Accumulate positive emotions, Build mastery, Cope ahead of time. PLEASE: treat PhysicaL illness, balance Eating, avoid mood-Altering substances, balance Sleep, get Exercise.',
    skill_description: 'Comprehensive approach to building emotional resilience through lifestyle and experience planning.',
    skill_purpose: 'To create sustainable positive emotional states and reduce vulnerability to negative emotions.',
    when_to_use: 'As ongoing emotional maintenance and specifically when recovering from depression or emotional instability.',
    difficulty_level: 'medium'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Emotion Effectiveness Assessment',
    question: 'How do you assess whether your emotional response is effective?',
    answer: 'Ask: Does this emotion fit the facts? Is the intensity proportional? Does expressing it achieve my goals? Does it help or harm relationships? Is it moving me toward my values?',
    skill_description: 'Clinical assessment tool for evaluating emotional responses and regulation needs.',
    skill_purpose: 'To develop wisdom about when emotions are helpful versus when regulation is needed.',
    when_to_use: 'After emotional episodes, during therapy processing, or when questioning your emotional responses.',
    difficulty_level: 'advanced'
  },

  // INTERPERSONAL EFFECTIVENESS MODULE - Advanced Clinical Applications
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'DEAR MAN - Complete Clinical Application',
    question: 'What is the advanced clinical application of DEAR MAN with troubleshooting?',
    answer: 'Describe objectively, Express using "I" statements, Assert specifically, Reinforce positively. Mindful (ignore attacks), Appear confident (posture/voice), Negotiate (willing to give to get). Repeat if necessary.',
    skill_description: 'Complete clinical protocol for interpersonal requests with advanced implementation strategies.',
    skill_purpose: 'To effectively communicate needs while maintaining relationships and self-respect.',
    when_to_use: 'When making requests, setting boundaries, saying no, or advocating for your needs.',
    difficulty_level: 'medium'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Validation Levels - Clinical Application',
    question: 'How do you apply all six levels of validation in therapeutic conversations?',
    answer: 'Level 1: Be present and listen. Level 2: Reflect accurately. Level 3: Read emotions. Level 4: Understand given history. Level 5: Normalize responses. Level 6: Treat as equal person.',
    skill_description: 'Complete clinical validation protocol for therapeutic and personal relationships.',
    skill_purpose: 'To provide effective emotional validation that reduces distress and strengthens connections.',
    when_to_use: 'When someone is distressed, during conflicts, in therapy, or when building deeper relationships.',
    difficulty_level: 'advanced'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Interpersonal Crisis Navigation',
    question: 'What is the DBT protocol for managing interpersonal crises?',
    answer: 'Use STOP skill first. Assess: Is this an emergency? Use TIPP if needed. Apply GIVE skills. Use DEAR MAN if appropriate. Consider wise mind. Plan follow-up conversation.',
    skill_description: 'Systematic approach to managing acute interpersonal conflicts and crises.',
    skill_purpose: 'To navigate relationship crises without causing additional damage while protecting yourself.',
    when_to_use: 'During relationship conflicts, when emotions are high, or when relationships are threatened.',
    difficulty_level: 'advanced'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Boundary Setting with Compassion',
    question: 'How do you set firm boundaries while maintaining compassion?',
    answer: 'Express care for the person, clearly state your boundary, explain your reasons briefly, offer alternatives when possible, hold boundary consistently with kindness.',
    skill_description: 'Advanced technique for maintaining personal limits while preserving relationship connection.',
    skill_purpose: 'To protect yourself while communicating respect and care for others.',
    when_to_use: 'When others push against your limits, during enabling situations, or when self-care requires boundaries.',
    difficulty_level: 'medium'
  },

  // ADVANCED INTEGRATION SKILLS
  {
    category: 'mindfulness',
    skill_name: 'DBT Skills Chain Analysis',
    question: 'How do you conduct a mindful chain analysis of a problem behavior?',
    answer: 'Identify the problem behavior. Work backwards: What triggered it? What were your thoughts, feelings, sensations? What skills could you have used? Practice the effective response.',
    skill_description: 'Mindful examination of behavioral sequences to identify intervention points.',
    skill_purpose: 'To understand behavior patterns and develop effective alternative responses.',
    when_to_use: 'After engaging in problem behaviors or when patterns repeat.',
    difficulty_level: 'advanced'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Meaning-Making in Suffering',
    question: 'How do you find meaning in unavoidable suffering using DBT principles?',
    answer: 'Practice radical acceptance of the pain. Look for ways suffering connects you to others. Consider how pain can deepen compassion. Identify growth or wisdom gained. Find ways to help others.',
    skill_description: 'Advanced technique for transforming unavoidable suffering into meaning and growth.',
    skill_purpose: 'To reduce the additional suffering that comes from seeing pain as meaningless.',
    when_to_use: 'During chronic illness, grief, trauma recovery, or other prolonged difficult experiences.',
    difficulty_level: 'advanced'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Wise Mind Emotion Regulation',
    question: 'How do you use Wise Mind specifically for emotion regulation decisions?',
    answer: 'Notice the emotion in your body. Ask Wise Mind: "What does this emotion tell me?" "What action would be most effective?" "How can I honor this feeling while acting wisely?" Follow wise mind guidance.',
    skill_description: 'Integration of mindfulness and emotion regulation through wise mind consultation.',
    skill_purpose: 'To make emotionally informed but wise decisions about how to respond to feelings.',
    when_to_use: 'When emotions are strong but you need to choose your response carefully.',
    difficulty_level: 'advanced'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Relationship Mindfulness Practice',
    question: 'What does it mean to practice mindfulness within relationships?',
    answer: 'Stay present during conversations. Notice your reactions without immediately responding. Listen with full attention. Observe judgments. Respond from wise mind rather than emotion mind.',
    skill_description: 'Application of mindfulness principles specifically to interpersonal interactions.',
    skill_purpose: 'To improve relationship quality and reduce reactive patterns in social situations.',
    when_to_use: 'During all interpersonal interactions, especially when emotions or judgments arise.',
    difficulty_level: 'medium'
  },

  // TRAUMA-INFORMED DBT ADAPTATIONS
  {
    category: 'distress_tolerance',
    skill_name: 'Trauma-Informed Grounding Sequence',
    question: 'What is the DBT grounding sequence for trauma responses?',
    answer: '5-4-3-2-1 technique: Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste. Then use TIPP if needed. Remind yourself "I am safe now."',
    skill_description: 'Sensory grounding technique specifically adapted for trauma responses and dissociation.',
    skill_purpose: 'To reconnect with present reality when experiencing trauma flashbacks or dissociation.',
    when_to_use: 'During flashbacks, dissociation, panic attacks, or when feeling disconnected from reality.',
    difficulty_level: 'easy'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Post-Traumatic Growth Integration',
    question: 'How do you integrate post-traumatic growth using DBT principles?',
    answer: 'Practice radical acceptance of what happened. Identify new strengths developed. Notice deeper relationships formed. Recognize expanded life priorities. Appreciate increased compassion for others.',
    skill_description: 'Framework for recognizing and integrating positive changes that can emerge after trauma.',
    skill_purpose: 'To acknowledge growth and meaning that can coexist with trauma pain.',
    when_to_use: 'During trauma recovery when ready to explore potential growth alongside healing.',
    difficulty_level: 'advanced'
  }
];

async function expandAdvancedDBTSkills() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting advanced clinical DBT flash cards expansion...');
    
    // Insert all advanced clinical DBT skills
    for (const skill of advancedDBTSkills) {
      await client.query(
        `INSERT INTO dbt_flash_cards (category, skill_name, question, answer, skill_description, skill_purpose, when_to_use, difficulty_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [skill.category, skill.skill_name, skill.question, skill.answer, 
         skill.skill_description, skill.skill_purpose, skill.when_to_use, skill.difficulty_level]
      );
    }
    
    // Get updated counts
    const categoryStats = await client.query(`
      SELECT category, difficulty_level, COUNT(*) as count
      FROM dbt_flash_cards 
      GROUP BY category, difficulty_level 
      ORDER BY category, 
      CASE difficulty_level 
        WHEN 'easy' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'advanced' THEN 3 
        WHEN 'hard' THEN 4
      END
    `);
    
    const totalCount = await client.query('SELECT COUNT(*) as total FROM dbt_flash_cards');
    
    console.log('\n✅ Advanced Clinical DBT Flash Cards Successfully Added!');
    console.log(`📚 Total Cards: ${totalCount.rows[0].total}`);
    console.log('\n📊 Updated Distribution by Category and Difficulty:');
    
    categoryStats.rows.forEach(row => {
      console.log(`   ${row.category} - ${row.difficulty_level}: ${row.count} cards`);
    });
    
    console.log('\n🎯 Advanced Clinical Features Added:');
    console.log('   • Precise clinical protocols and timing');
    console.log('   • Complete therapeutic methodologies');
    console.log('   • Trauma-informed adaptations');
    console.log('   • Advanced integration techniques');
    console.log('   • Evidence-based clinical applications');
    console.log('   • Detailed step-by-step procedures');
    
  } catch (error) {
    console.error('❌ Error expanding advanced DBT skills:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the advanced expansion
expandAdvancedDBTSkills().catch(console.error);