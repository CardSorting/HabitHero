/**
 * Master DBT Flash Cards Expansion - Complete Clinical Library
 * Adding comprehensive, therapeutically accurate DBT skills following exact clinical methodology
 * Based on Marsha Linehan's complete DBT manual, clinical practice guidelines, and evidence-based research
 */

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Master Clinical DBT Skills Library - Comprehensive Therapeutic Content
const masterDBTSkills = [
  // MINDFULNESS MODULE - Complete Clinical Applications
  {
    category: 'mindfulness',
    skill_name: 'Observe Skills - Complete Protocol',
    question: 'What is the complete clinical protocol for practicing Observe skills?',
    answer: 'Step 1: Notice what comes into your awareness through your five senses. Step 2: Notice thoughts that come and go. Step 3: Notice feelings and emotions. Step 4: Just notice, without trying to get rid of, hold onto, or change what you observe. Step 5: Step back and observe your observing.',
    skill_description: 'Complete clinical methodology for developing observational awareness without interference.',
    skill_purpose: 'To develop the foundation skill of mindful awareness that underlies all other DBT techniques.',
    when_to_use: 'As the foundation for all mindfulness practice and when needing to step back from overwhelming experiences.',
    difficulty_level: 'easy'
  },
  {
    category: 'mindfulness',
    skill_name: 'Describe Skills - Clinical Precision',
    question: 'What are the precise clinical guidelines for Describe skills?',
    answer: 'Describe only what you observe through your senses. Stick to the facts. Describe only what you see, hear, smell, taste, or touch. Do not describe your interpretations, assumptions, or what you think others are thinking. Use "I" statements for internal experiences.',
    skill_description: 'Precise clinical methodology for factual description without interpretation or judgment.',
    skill_purpose: 'To develop clear communication and reduce emotional reactivity through factual awareness.',
    when_to_use: 'During conflict resolution, emotional processing, therapy sessions, and daily mindfulness practice.',
    difficulty_level: 'medium'
  },
  {
    category: 'mindfulness',
    skill_name: 'Participate Skills - Therapeutic Application',
    question: 'How do you practice Participate skills in therapeutic contexts?',
    answer: 'Throw yourself completely into the present activity. Become one with what you are doing. Let go of self-consciousness. Act intuitively from wise mind. Allow yourself to be spontaneous. Forget yourself and become the experience.',
    skill_description: 'Clinical technique for full engagement and presence in therapeutic and life activities.',
    skill_purpose: 'To break through depression, anxiety, and self-consciousness by fully engaging with life.',
    when_to_use: 'During depression, social anxiety, disconnection, or when life feels meaningless.',
    difficulty_level: 'advanced'
  },
  {
    category: 'mindfulness',
    skill_name: 'Non-Judgmental Stance - Clinical Practice',
    question: 'What is the complete clinical approach to non-judgmental stance?',
    answer: 'Observe your judgments without judging the judgments. Replace judgmental words with neutral descriptions. When you notice "good/bad" thoughts, describe the consequences instead. Practice "just the facts" approach. Notice when judgments arise and gently return to observation.',
    skill_description: 'Systematic clinical approach to reducing judgmental thinking and increasing acceptance.',
    skill_purpose: 'To reduce emotional suffering caused by judgmental thinking and increase psychological flexibility.',
    when_to_use: 'When experiencing self-criticism, relationship conflicts, or emotional overwhelm.',
    difficulty_level: 'medium'
  },
  {
    category: 'mindfulness',
    skill_name: 'One-Mindfully - Therapeutic Integration',
    question: 'How do you practice One-Mindfully in therapeutic work?',
    answer: 'Do one thing at a time with complete attention. When your mind wanders, gently bring it back. If you are listening to someone, just listen. If you are feeling an emotion, just feel it. Practice single-tasking throughout your day.',
    skill_description: 'Clinical technique for developing sustained attention and presence in therapeutic contexts.',
    skill_purpose: 'To improve focus, reduce anxiety, and increase effectiveness in all activities.',
    when_to_use: 'During therapy sessions, mindfulness practice, and when feeling scattered or overwhelmed.',
    difficulty_level: 'medium'
  },
  {
    category: 'mindfulness',
    skill_name: 'Effectively - Clinical Decision Making',
    question: 'How do you apply Effectively in clinical decision-making?',
    answer: 'Focus on what works to achieve your goals. Let go of being "right" when it interferes with effectiveness. Consider the consequences of your actions. Ask "Will this help me achieve my long-term goals?" Practice flexible responding based on the situation.',
    skill_description: 'Clinical approach to effective action and decision-making in therapeutic contexts.',
    skill_purpose: 'To increase goal achievement and reduce ineffective behaviors that maintain problems.',
    when_to_use: 'When making important decisions, during conflicts, or when perfectionistic thinking interferes.',
    difficulty_level: 'advanced'
  },

  // DISTRESS TOLERANCE MODULE - Advanced Clinical Protocols
  {
    category: 'distress_tolerance',
    skill_name: 'TIPP - Complete Clinical Protocol',
    question: 'What is the complete clinical protocol for TIPP implementation?',
    answer: 'Temperature: 50-60°F water on face for 30 seconds OR hold ice cubes. Intense Exercise: 10-20 minutes vigorous activity. Paced Breathing: Exhale longer than inhale (4 in, 6-8 out). Paired Muscle Relaxation: Tense for 5 seconds, release for 10, notice the contrast.',
    skill_description: 'Evidence-based rapid intervention for crisis-level emotional dysregulation.',
    skill_purpose: 'To quickly change body chemistry and nervous system activation during emotional emergencies.',
    when_to_use: 'When emotions are 8-10 intensity, during panic attacks, or before potential self-harm.',
    difficulty_level: 'easy'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Radical Acceptance - 7-Step Protocol',
    question: 'What are the complete 7 steps of clinical Radical Acceptance?',
    answer: '1) Observe that you are resisting reality. 2) Remind yourself that the unpleasant reality is just what it is. 3) Consider the causes of the reality. 4) Practice accepting with your whole self. 5) Notice if you are allowing disappointment. 6) Acknowledge that life can be worth living even with painful events. 7) Do pros and cons if you continue to resist.',
    skill_description: 'Complete clinical methodology for accepting unchangeable painful realities.',
    skill_purpose: 'To reduce suffering by stopping the fight against unchangeable painful circumstances.',
    when_to_use: 'When facing loss, trauma, chronic illness, or any unchangeable painful situation.',
    difficulty_level: 'advanced'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'ACCEPTS - Clinical Implementation',
    question: 'How do you implement each component of ACCEPTS clinically?',
    answer: 'Activities: Match intensity to emotion level. Contributing: Help others or volunteer. Comparisons: Compare to worse situations or better times. Emotions: Do opposite action. Push away: Visualize pushing away thoughts. Thoughts: Count, recite poems. Sensations: Ice, hot showers, intense tastes.',
    skill_description: 'Complete clinical protocol for crisis survival through healthy distraction.',
    skill_purpose: 'To survive crisis moments without engaging in behaviors that worsen the situation.',
    when_to_use: 'During acute emotional crises when problem-solving is not possible.',
    difficulty_level: 'medium'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'IMPROVE - Therapeutic Application',
    question: 'What is the therapeutic application of each IMPROVE component?',
    answer: 'Imagery: Visualize peaceful scenes or coping successfully. Meaning: Find purpose in suffering. Prayer: Use spiritual practices. Relaxation: Progressive muscle relaxation. One thing: Focus on single activity. Vacation: Take brief mental breaks. Encouragement: Use positive self-talk.',
    skill_description: 'Clinical toolkit for making crisis moments more tolerable and meaningful.',
    skill_purpose: 'To improve distressing moments and find ways to make them more bearable.',
    when_to_use: 'When distraction alone is not enough and you need to actively improve the moment.',
    difficulty_level: 'medium'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Willingness vs Willfulness',
    question: 'What is the clinical distinction between willingness and willfulness?',
    answer: 'Willingness: Doing what is needed in each situation. Being effective. Listening to wise mind. Willfulness: Refusing to tolerate the moment. Trying to control what cannot be controlled. Giving up. Practice choosing willingness over willfulness.',
    skill_description: 'Clinical framework for understanding and choosing effective responses to difficult situations.',
    skill_purpose: 'To develop wise responses to unchangeable situations and reduce self-defeating behaviors.',
    when_to_use: 'When feeling stuck, rebellious, or wanting to give up on healthy coping.',
    difficulty_level: 'advanced'
  },

  // EMOTION REGULATION MODULE - Advanced Clinical Strategies
  {
    category: 'emotion_regulation',
    skill_name: 'Emotion Regulation Model - Complete',
    question: 'What is the complete DBT model of emotion regulation?',
    answer: 'Prompting Event → Interpretation → Biological Changes → Facial/Body Expression → Action Urges → Actions → Consequences. Each step offers intervention opportunities. Change interpretation, body posture, or actions to influence the entire emotional experience.',
    skill_description: 'Complete clinical model for understanding and intervening in emotional experiences.',
    skill_purpose: 'To provide multiple intervention points for effective emotion regulation.',
    when_to_use: 'For understanding emotional patterns and choosing effective regulation strategies.',
    difficulty_level: 'advanced'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Opposite Action - Complete Protocol',
    question: 'What is the complete clinical protocol for Opposite Action?',
    answer: '1) Identify the emotion and its action urge. 2) Ask if emotion fits facts and intensity is appropriate. 3) If not, act opposite to the urge ALL THE WAY. 4) Change facial expression, posture, and thoughts. 5) Continue until emotion changes. 6) Repeat often to create new emotional patterns.',
    skill_description: 'Evidence-based technique for changing emotions through behavioral change.',
    skill_purpose: 'To effectively change emotions that do not fit facts or are unhelpfully intense.',
    when_to_use: 'When emotions do not match reality or when emotional responses are ineffective.',
    difficulty_level: 'medium'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Building Positive Experiences - ABC PLEASE',
    question: 'What is the complete ABC PLEASE protocol for emotion regulation?',
    answer: 'Accumulate Positive Emotions: Daily pleasant activities and work toward goals. Build Mastery: Engage in activities that create competence. Cope Ahead: Plan for difficult situations. PLEASE: Treat Physical illness, balance Eating, avoid mood-Altering substances, balance Sleep, Exercise daily.',
    skill_description: 'Comprehensive approach to building emotional resilience and reducing vulnerability.',
    skill_purpose: 'To create sustainable positive emotional states and reduce susceptibility to emotional dysregulation.',
    when_to_use: 'As ongoing emotional maintenance and when recovering from depression or instability.',
    difficulty_level: 'medium'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Cope Ahead - Clinical Planning',
    question: 'What is the complete Cope Ahead planning protocol?',
    answer: '1) Identify the situation likely to trigger emotions. 2) Decide what coping skills to use. 3) Imagine the situation in detail. 4) Rehearse using the coping skills. 5) Practice relaxation after rehearsal. 6) Repeat until the skills feel natural.',
    skill_description: 'Clinical technique for preparing effective responses to anticipated difficult situations.',
    skill_purpose: 'To reduce emotional vulnerability and increase effectiveness in challenging situations.',
    when_to_use: 'Before anticipated stressful events, transitions, or challenging interpersonal situations.',
    difficulty_level: 'medium'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Emotional Vulnerability Reduction',
    question: 'What are the clinical strategies for reducing emotional vulnerability?',
    answer: 'Treat physical illness promptly. Maintain balanced eating patterns. Avoid mood-altering substances. Get adequate, regular sleep. Exercise regularly. Build mastery through skill-building activities. Accumulate positive experiences daily.',
    skill_description: 'Evidence-based approach to reducing biological and psychological vulnerability to emotional dysregulation.',
    skill_purpose: 'To create conditions that support emotional stability and resilience.',
    when_to_use: 'As daily practice and especially when noticing increased emotional sensitivity.',
    difficulty_level: 'easy'
  },

  // INTERPERSONAL EFFECTIVENESS MODULE - Advanced Clinical Applications
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'DEAR MAN - Complete Clinical Protocol',
    question: 'What is the complete clinical protocol for DEAR MAN implementation?',
    answer: 'Describe: Use objective facts only. Express: "I feel..." statements. Assert: Ask clearly and specifically. Reinforce: Explain positive consequences. Mindful: Stay focused on goals. Appear confident: Use assertive body language. Negotiate: Offer compromises when appropriate.',
    skill_description: 'Evidence-based communication technique for effective interpersonal goal achievement.',
    skill_purpose: 'To increase likelihood of getting needs met while maintaining relationships and self-respect.',
    when_to_use: 'When making requests, setting boundaries, or saying no in any relationship context.',
    difficulty_level: 'medium'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Validation Levels - Complete Clinical Guide',
    question: 'What are all six levels of validation with clinical applications?',
    answer: 'Level 1: Be present (listen mindfully). Level 2: Reflect accurately (reflect back what you heard). Level 3: Mind-reading (guess unstated thoughts/feelings). Level 4: Understanding history (validate based on past/biology). Level 5: Normalizing (validate as understandable). Level 6: Radical genuineness (treat as valid person).',
    skill_description: 'Complete clinical framework for providing therapeutic validation in relationships.',
    skill_purpose: 'To reduce emotional distress in others and strengthen interpersonal connections.',
    when_to_use: 'In all relationships, especially when others are distressed or sharing difficulties.',
    difficulty_level: 'advanced'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'GIVE Skills - Relationship Maintenance',
    question: 'How do you apply GIVE skills for optimal relationship maintenance?',
    answer: 'Gentle: No attacks, criticism, or threats. Use a respectful tone. Interested: Listen and ask questions. Act interested even if you feel otherwise. Validate: Acknowledge the other person\'s perspective. Easy manner: Smile, use humor, be lighthearted when appropriate.',
    skill_description: 'Clinical approach to maintaining positive relationships while being assertive.',
    skill_purpose: 'To preserve and strengthen relationships while still advocating for your needs.',
    when_to_use: 'In all interpersonal interactions where relationship quality matters.',
    difficulty_level: 'easy'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'FAST Skills - Self-Respect Maintenance',
    question: 'How do you apply FAST skills to maintain self-respect?',
    answer: 'Fair: Be fair to yourself and others. No excessive self-sacrifice. No Apologies: Don\'t apologize for existing, having opinions, or making requests. Stick to values: Don\'t compromise your values for approval. Truthful: Don\'t lie, exaggerate, or make excuses.',
    skill_description: 'Clinical framework for maintaining self-respect and integrity in relationships.',
    skill_purpose: 'To preserve self-worth and values while navigating interpersonal situations.',
    when_to_use: 'When feeling pressured to compromise values or when self-respect is threatened.',
    difficulty_level: 'medium'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Relationship Mindfulness',
    question: 'What does relationship mindfulness look like in clinical practice?',
    answer: 'Stay present during conversations. Notice urges to react without immediately acting. Observe your judgments about the other person. Pay attention to your body language and tone. Listen with wise mind. Respond rather than react.',
    skill_description: 'Application of mindfulness principles specifically to interpersonal interactions.',
    skill_purpose: 'To improve relationship quality and reduce reactive patterns in social situations.',
    when_to_use: 'During all interpersonal interactions, especially when emotions or conflicts arise.',
    difficulty_level: 'medium'
  },

  // ADVANCED INTEGRATION AND SPECIALIZED APPLICATIONS
  {
    category: 'mindfulness',
    skill_name: 'Wise Mind Problem Solving',
    question: 'How do you use Wise Mind for complex problem-solving?',
    answer: 'Gather facts (reasonable mind). Notice your feelings about the situation (emotion mind). Ask Wise Mind: "What is the wise thing to do?" Wait for the answer without forcing it. Trust the wisdom that emerges. Act on wise mind guidance.',
    skill_description: 'Integration of logic and emotion for optimal decision-making in complex situations.',
    skill_purpose: 'To make decisions that honor both rational thinking and emotional wisdom.',
    when_to_use: 'When facing complex decisions, moral dilemmas, or situations requiring balanced judgment.',
    difficulty_level: 'advanced'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Trauma-Informed Crisis Survival',
    question: 'How do you adapt crisis survival skills for trauma responses?',
    answer: 'Use grounding techniques first (5-4-3-2-1). Apply TIPP gently if triggered. Practice self-validation. Use bilateral stimulation (walking, tapping). Create safety statements. Connect with support when possible. Remember: "This feeling will pass."',
    skill_description: 'Trauma-informed adaptation of distress tolerance skills for crisis situations.',
    skill_purpose: 'To manage trauma responses and flashbacks without re-traumatization.',
    when_to_use: 'During trauma flashbacks, dissociation, or crisis situations triggered by past trauma.',
    difficulty_level: 'advanced'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Complex Emotion Management',
    question: 'How do you manage multiple conflicting emotions simultaneously?',
    answer: 'Notice and name each emotion present. Validate all emotions as understandable. Identify which emotion is most intense. Use appropriate skills for the primary emotion. Practice self-compassion for emotional complexity.',
    skill_description: 'Clinical approach to managing complex, mixed, or conflicting emotional states.',
    skill_purpose: 'To effectively navigate situations involving multiple intense emotions.',
    when_to_use: 'During grief, relationship conflicts, major life transitions, or complex trauma processing.',
    difficulty_level: 'advanced'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Therapeutic Boundary Setting',
    question: 'How do you set therapeutic boundaries using DBT principles?',
    answer: 'Identify your limits clearly. Use DEAR MAN to communicate boundaries. Apply GIVE to maintain relationships. Use FAST to preserve self-respect. Be prepared for pushback. Stay consistent. Offer alternatives when possible.',
    skill_description: 'Clinical framework for setting and maintaining healthy boundaries in therapeutic and personal contexts.',
    skill_purpose: 'To protect well-being while maintaining respectful, caring relationships.',
    when_to_use: 'When others violate limits, during codependent patterns, or when self-care requires boundaries.',
    difficulty_level: 'medium'
  }
];

async function expandMasterDBTSkills() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting master clinical DBT flash cards expansion...');
    
    // Insert all master clinical DBT skills
    for (const skill of masterDBTSkills) {
      await client.query(
        `INSERT INTO dbt_flash_cards (category, skill_name, question, answer, skill_description, skill_purpose, when_to_use, difficulty_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [skill.category, skill.skill_name, skill.question, skill.answer, 
         skill.skill_description, skill.skill_purpose, skill.when_to_use, skill.difficulty_level]
      );
    }
    
    // Get final comprehensive stats
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
    
    console.log('\n✅ Master Clinical DBT Flash Cards Library Complete!');
    console.log(`📚 Total Cards: ${totalCount.rows[0].total}`);
    console.log('\n📊 Final Distribution by Category and Difficulty:');
    
    categoryStats.rows.forEach(row => {
      console.log(`   ${row.category} - ${row.difficulty_level}: ${row.count} cards`);
    });
    
    console.log('\n🎯 Master Clinical Features:');
    console.log('   • Complete 7-step protocols for complex skills');
    console.log('   • Evidence-based clinical timing and procedures');
    console.log('   • Trauma-informed adaptations and applications');
    console.log('   • Advanced integration of all four modules');
    console.log('   • Therapeutic decision-making frameworks');
    console.log('   • Complex emotion and situation management');
    console.log('   • Clinical validation and communication protocols');
    console.log('   • Complete therapeutic implementation guides');
    
  } catch (error) {
    console.error('❌ Error expanding master DBT skills:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the master expansion
expandMasterDBTSkills().catch(console.error);