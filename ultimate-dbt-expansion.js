/**
 * Ultimate Master Clinical DBT Flash Cards Expansion
 * The most comprehensive therapeutic DBT library with advanced clinical protocols
 * Based on complete DBT methodology, research evidence, and therapeutic practice standards
 */

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Ultimate Master Clinical DBT Skills - Complete Therapeutic Protocols
const ultimateDBTSkills = [
  // MINDFULNESS MODULE - Advanced Clinical Mastery
  {
    category: 'mindfulness',
    skill_name: 'States of Mind Integration - Clinical Protocol',
    question: 'What is the complete clinical protocol for integrating the three states of mind?',
    answer: 'Step 1: Notice which state you\'re in (Emotion Mind: hot/impulsive, Reasonable Mind: cold/logical). Step 2: Acknowledge the value of both states. Step 3: Ask "What does my Wise Mind know about this?" Step 4: Wait for the integration without forcing. Step 5: Act from this integrated wisdom.',
    skill_description: 'Advanced clinical technique for real-time integration of emotion and reason through wise mind.',
    skill_purpose: 'To develop moment-to-moment access to wisdom during emotional intensity and logical analysis.',
    when_to_use: 'During crisis decisions, therapeutic processing, conflict resolution, and major life choices.',
    difficulty_level: 'advanced'
  },
  {
    category: 'mindfulness',
    skill_name: 'Mindful Exposure Protocol',
    question: 'How do you practice mindful exposure to difficult emotions and sensations?',
    answer: 'Step 1: Notice the difficult emotion/sensation arising. Step 2: Breathe with it rather than against it. Step 3: Observe with curiosity rather than judgment. Step 4: Stay present with the experience. Step 5: Notice it naturally changing. Step 6: Practice self-compassion throughout.',
    skill_description: 'Clinical technique for mindfully engaging with difficult internal experiences.',
    skill_purpose: 'To reduce avoidance patterns and increase tolerance for difficult emotions and sensations.',
    when_to_use: 'During anxiety, trauma processing, depression, and any avoided emotional experiences.',
    difficulty_level: 'advanced'
  },
  {
    category: 'mindfulness',
    skill_name: 'Advanced Breathing Techniques',
    question: 'What are the complete clinical breathing protocols for different therapeutic needs?',
    answer: 'Anxiety: 4-7-8 breathing (inhale 4, hold 7, exhale 8). Anger: Box breathing (4-4-4-4). Depression: Energizing breath (quick inhale, slow exhale). Trauma: Coherent breathing (5 in, 5 out). Crisis: Paced breathing (longer exhale than inhale).',
    skill_description: 'Evidence-based breathing techniques matched to specific emotional and physiological needs.',
    skill_purpose: 'To rapidly regulate nervous system activation and emotional states.',
    when_to_use: 'Match technique to current emotional state and therapeutic goal.',
    difficulty_level: 'medium'
  },
  {
    category: 'mindfulness',
    skill_name: 'Mindfulness in Therapeutic Relationship',
    question: 'How do you practice mindfulness within the therapeutic relationship?',
    answer: 'Notice your reactions to the therapist without immediately sharing. Observe judgments about therapy process. Stay present with difficult emotions that arise. Practice wise mind when choosing what to share. Use mindful listening during sessions.',
    skill_description: 'Application of mindfulness specifically within therapeutic contexts and relationships.',
    skill_purpose: 'To maximize therapeutic benefit and develop authentic therapeutic alliance.',
    when_to_use: 'During therapy sessions, when resistance arises, or when processing therapeutic relationship.',
    difficulty_level: 'advanced'
  },
  {
    category: 'mindfulness',
    skill_name: 'Somatic Mindfulness Protocol',
    question: 'What is the complete protocol for mindfulness of body sensations?',
    answer: 'Step 1: Scan body systematically from head to toe. Step 2: Notice areas of tension, pain, or numbness. Step 3: Breathe into these areas without trying to change them. Step 4: Notice emotional connections to physical sensations. Step 5: Practice acceptance of body as it is.',
    skill_description: 'Clinical technique for developing body awareness and emotional-physical integration.',
    skill_purpose: 'To increase body awareness and understand the connection between emotions and physical sensations.',
    when_to_use: 'During trauma work, anxiety, depression, or when disconnected from body awareness.',
    difficulty_level: 'medium'
  },

  // DISTRESS TOLERANCE MODULE - Master Clinical Protocols
  {
    category: 'distress_tolerance',
    skill_name: 'Crisis Survival Hierarchy',
    question: 'What is the complete hierarchy for crisis survival skill selection?',
    answer: 'Level 1 (Emergency): TIPP for immediate crisis. Level 2 (Acute): ACCEPTS for short-term coping. Level 3 (Sustained): IMPROVE for ongoing crisis. Level 4 (Recovery): Self-soothing and meaning-making. Choose level based on crisis intensity and duration.',
    skill_description: 'Systematic approach to selecting appropriate crisis survival skills based on crisis severity.',
    skill_purpose: 'To match crisis intervention intensity to crisis level for optimal effectiveness.',
    when_to_use: 'During any crisis situation - match intervention to crisis intensity level.',
    difficulty_level: 'advanced'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Radical Acceptance of Death and Loss',
    question: 'How do you practice radical acceptance specifically for grief and loss?',
    answer: 'Acknowledge the reality of the loss. Allow the grief without trying to fix it. Notice resistance to the permanence. Practice willingness to feel the pain. Find meaning without minimizing loss. Allow love and grief to coexist.',
    skill_description: 'Specialized application of radical acceptance for processing grief and significant losses.',
    skill_purpose: 'To process grief fully while reducing additional suffering from resistance to loss.',
    when_to_use: 'During grief, death of loved ones, relationship endings, and major life transitions.',
    difficulty_level: 'advanced'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Advanced Self-Soothing Protocol',
    question: 'What is the complete self-soothing protocol for severe distress?',
    answer: 'Vision: Safe place imagery or beauty. Sound: Calming music or nature sounds. Smell: Essential oils or comforting scents. Taste: Soothing drinks or comfort foods. Touch: Soft textures, warm baths, or gentle movement. Combine multiple senses for greater effect.',
    skill_description: 'Comprehensive sensory-based self-soothing for managing severe emotional distress.',
    skill_purpose: 'To provide comfort and regulation during intense emotional pain.',
    when_to_use: 'During emotional overwhelm, after trauma activation, or when needing nurturing comfort.',
    difficulty_level: 'easy'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Distraction with Wisdom Integration',
    question: 'How do you practice healthy distraction while maintaining emotional awareness?',
    answer: 'Choose activities that match emotional intensity. Set time limits for distraction. Check in with emotions periodically. Use bilateral activities when possible. Return to emotional processing when ready. Avoid harmful or addictive distractions.',
    skill_description: 'Wise use of distraction that creates space for healing while maintaining emotional connection.',
    skill_purpose: 'To provide temporary relief while preserving emotional awareness and processing capacity.',
    when_to_use: 'When emotions are too intense for direct processing but avoidance would be harmful.',
    difficulty_level: 'medium'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Intense Pain Survival',
    question: 'What is the protocol for surviving intense physical or emotional pain?',
    answer: 'Use TIPP immediately for crisis management. Practice radical acceptance of the pain. Break time into small chunks ("I can handle the next 5 minutes"). Use self-soothing continuously. Reach out for support. Focus on survival, not solving.',
    skill_description: 'Clinical protocol for surviving periods of intense pain without making situations worse.',
    skill_purpose: 'To get through intense pain periods safely without engaging in harmful behaviors.',
    when_to_use: 'During severe depression, trauma activation, chronic pain flares, or emotional crises.',
    difficulty_level: 'advanced'
  },

  // EMOTION REGULATION MODULE - Advanced Therapeutic Applications
  {
    category: 'emotion_regulation',
    skill_name: 'Emotion Regulation in Trauma',
    question: 'How do you adapt emotion regulation skills for trauma responses?',
    answer: 'Start with grounding and safety. Use gentler versions of opposite action. Practice self-validation extensively. Work with window of tolerance. Use titrated exposure. Integrate somatic awareness. Always prioritize safety over progress.',
    skill_description: 'Trauma-informed adaptation of emotion regulation techniques for trauma survivors.',
    skill_purpose: 'To provide effective emotion regulation without re-traumatization.',
    when_to_use: 'When working with trauma responses, PTSD symptoms, or complex trauma.',
    difficulty_level: 'advanced'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Advanced Emotion Identification',
    question: 'What is the complete protocol for precise emotion identification?',
    answer: 'Notice body sensations first. Identify emotion families (fear, anger, sadness, joy). Rate intensity 1-10. Distinguish primary from secondary emotions. Notice emotion mixtures. Consider context and triggers. Use emotion words wheel for precision.',
    skill_description: 'Comprehensive approach to developing sophisticated emotional awareness and vocabulary.',
    skill_purpose: 'To enable precise emotion regulation through accurate emotional awareness.',
    when_to_use: 'Daily for emotional literacy and during therapy for precise emotional processing.',
    difficulty_level: 'medium'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Mastery Activities Protocol',
    question: 'How do you design and implement effective mastery activities?',
    answer: 'Choose activities slightly above current skill level. Set specific, achievable goals. Practice regularly with progression. Notice competence building. Apply skills to meaningful life areas. Celebrate progress and learning.',
    skill_description: 'Systematic approach to building competence and positive emotions through skill development.',
    skill_purpose: 'To increase self-efficacy, positive emotions, and sense of meaning through achievement.',
    when_to_use: 'During depression, low self-esteem, or when lacking sense of purpose and competence.',
    difficulty_level: 'easy'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Complex Grief Processing',
    question: 'How do you regulate emotions during complicated grief?',
    answer: 'Allow contradictory emotions to coexist. Practice opposite action gently with guilt. Use self-soothing for overwhelming waves. Build meaning while honoring loss. Practice radical acceptance of permanent change. Seek support without pressure to "move on."',
    skill_description: 'Specialized emotion regulation techniques for processing complicated or traumatic grief.',
    skill_purpose: 'To navigate complex grief while maintaining emotional stability and honoring loss.',
    when_to_use: 'During complicated grief, traumatic loss, or when grief becomes overwhelming.',
    difficulty_level: 'advanced'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Emotional Memory Integration',
    question: 'How do you process traumatic emotional memories using DBT skills?',
    answer: 'Ground in present safety first. Use mindfulness to observe memory without becoming overwhelmed. Practice self-validation for past emotions. Use opposite action if trauma emotions don\'t fit current reality. Integrate meaning and growth.',
    skill_description: 'Clinical approach to processing traumatic memories while maintaining emotional stability.',
    skill_purpose: 'To heal from past trauma while building emotional resilience and integration.',
    when_to_use: 'During trauma therapy, EMDR sessions, or when traumatic memories surface.',
    difficulty_level: 'advanced'
  },

  // INTERPERSONAL EFFECTIVENESS MODULE - Master Clinical Applications
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Trauma-Informed Interpersonal Skills',
    question: 'How do you adapt interpersonal effectiveness for trauma survivors?',
    answer: 'Start with safety assessment. Use DEAR MAN with trauma-sensitive language. Practice boundaries gradually. Validate trauma responses in self and others. Build trust slowly. Respect autonomy and choice. Work within window of tolerance.',
    skill_description: 'Adaptation of interpersonal skills for trauma survivors and trauma-informed care.',
    skill_purpose: 'To build healthy relationships while respecting trauma impacts and promoting healing.',
    when_to_use: 'When working with trauma survivors or in trauma-informed therapeutic contexts.',
    difficulty_level: 'advanced'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Advanced Conflict Resolution',
    question: 'What is the complete protocol for resolving complex interpersonal conflicts?',
    answer: 'Step 1: Use distress tolerance skills first. Step 2: Validate the other person\'s perspective. Step 3: Use DEAR MAN for your needs. Step 4: Apply GIVE throughout. Step 5: Look for win-win solutions. Step 6: Use FAST to maintain self-respect. Step 7: Agree to disagree when necessary.',
    skill_description: 'Comprehensive approach to resolving complex conflicts while preserving relationships.',
    skill_purpose: 'To resolve conflicts effectively while maintaining relationships and self-respect.',
    when_to_use: 'During relationship conflicts, workplace disputes, or family disagreements.',
    difficulty_level: 'advanced'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Therapeutic Boundary Setting',
    question: 'How do you set boundaries in therapeutic and healing relationships?',
    answer: 'Identify your limits clearly. Communicate boundaries with compassion. Use DEAR MAN structure. Explain the therapeutic purpose. Be consistent in enforcement. Offer alternatives when possible. Practice self-care around boundary-setting.',
    skill_description: 'Specialized approach to boundary-setting within therapeutic and healing contexts.',
    skill_purpose: 'To maintain therapeutic frame while preserving caring relationships.',
    when_to_use: 'In therapeutic relationships, helping relationships, or when care becomes overwhelming.',
    difficulty_level: 'medium'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Cultural Humility in Relationships',
    question: 'How do you practice cultural humility in interpersonal effectiveness?',
    answer: 'Acknowledge your cultural perspective as one of many. Listen to understand rather than to be right. Validate different cultural approaches. Ask about cultural context when appropriate. Adapt communication styles respectfully. Learn from cultural differences.',
    skill_description: 'Integration of cultural sensitivity and humility into interpersonal effectiveness skills.',
    skill_purpose: 'To build effective relationships across cultural differences with respect and understanding.',
    when_to_use: 'In diverse relationships, therapeutic contexts, or when cultural differences create tension.',
    difficulty_level: 'medium'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Advanced Validation Techniques',
    question: 'What are advanced validation techniques for complex emotional situations?',
    answer: 'Level 1: Mindful presence with difficult emotions. Level 2: Reflect complexity accurately. Level 3: Validate unstated emotions. Level 4: Validate given trauma/biology. Level 5: Normalize without minimizing. Level 6: Treat as equal despite differences.',
    skill_description: 'Advanced validation skills for complex emotional and interpersonal situations.',
    skill_purpose: 'To provide deep emotional validation that promotes healing and connection.',
    when_to_use: 'During intense emotional processing, trauma work, or complex relationship dynamics.',
    difficulty_level: 'advanced'
  },

  // INTEGRATION AND SPECIALIZED APPLICATIONS
  {
    category: 'mindfulness',
    skill_name: 'Mindfulness-Based Exposure',
    question: 'How do you combine mindfulness with exposure therapy principles?',
    answer: 'Start with mindful grounding. Approach feared situation mindfully. Observe anxiety without fighting it. Stay present with difficult sensations. Notice anxiety naturally decreasing. Practice self-compassion throughout exposure.',
    skill_description: 'Integration of mindfulness principles with exposure therapy for anxiety and trauma.',
    skill_purpose: 'To reduce avoidance and fear through mindful exposure to difficult experiences.',
    when_to_use: 'During anxiety treatment, trauma therapy, or when working with avoidance patterns.',
    difficulty_level: 'advanced'
  },
  {
    category: 'distress_tolerance',
    skill_name: 'Spiritual Distress Tolerance',
    question: 'How do you integrate spiritual practices with distress tolerance?',
    answer: 'Use prayer or meditation as IMPROVE techniques. Find spiritual meaning in suffering. Practice spiritual acceptance of what cannot be changed. Use spiritual community for support. Integrate spiritual values in crisis decisions.',
    skill_description: 'Integration of spiritual and religious practices with DBT distress tolerance skills.',
    skill_purpose: 'To draw on spiritual resources for strength and meaning during crisis situations.',
    when_to_use: 'When spiritual/religious practices are important and during existential crises.',
    difficulty_level: 'medium'
  },
  {
    category: 'emotion_regulation',
    skill_name: 'Somatic Emotion Regulation',
    question: 'How do you regulate emotions through body-based interventions?',
    answer: 'Notice where emotions live in your body. Use movement to shift emotional energy. Practice grounding through physical sensation. Use temperature and touch for regulation. Integrate breathing with body awareness.',
    skill_description: 'Body-based approaches to emotion regulation through somatic awareness and intervention.',
    skill_purpose: 'To regulate emotions through the body-mind connection and somatic awareness.',
    when_to_use: 'When traditional cognitive approaches are insufficient or when trauma affects body connection.',
    difficulty_level: 'medium'
  },
  {
    category: 'interpersonal_effectiveness',
    skill_name: 'Systems-Level Interpersonal Skills',
    question: 'How do you apply interpersonal effectiveness at family or organizational levels?',
    answer: 'Understand system dynamics and roles. Use DEAR MAN with system awareness. Validate different system perspectives. Address system patterns, not just individual behavior. Work toward system-wide solutions.',
    skill_description: 'Application of interpersonal effectiveness principles to larger system change.',
    skill_purpose: 'To create positive change in family systems, organizations, or community contexts.',
    when_to_use: 'In family therapy, organizational change, or community building contexts.',
    difficulty_level: 'advanced'
  }
];

async function expandUltimateDBTSkills() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting ultimate master clinical DBT expansion...');
    
    // Insert all ultimate master clinical DBT skills
    for (const skill of ultimateDBTSkills) {
      await client.query(
        `INSERT INTO dbt_flash_cards (category, skill_name, question, answer, skill_description, skill_purpose, when_to_use, difficulty_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [skill.category, skill.skill_name, skill.question, skill.answer, 
         skill.skill_description, skill.skill_purpose, skill.when_to_use, skill.difficulty_level]
      );
    }
    
    // Get final ultimate stats
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
    
    console.log('\n✅ Ultimate Master Clinical DBT Library Complete!');
    console.log(`📚 Total Cards: ${totalCount.rows[0].total}`);
    console.log('\n📊 Ultimate Distribution by Category and Difficulty:');
    
    categoryStats.rows.forEach(row => {
      console.log(`   ${row.category} - ${row.difficulty_level}: ${row.count} cards`);
    });
    
    console.log('\n🎯 Ultimate Clinical Features:');
    console.log('   • Complete trauma-informed adaptations');
    console.log('   • Advanced somatic and body-based techniques');
    console.log('   • Cultural humility and diversity integration');
    console.log('   • Spiritual and existential applications');
    console.log('   • Systems-level interpersonal skills');
    console.log('   • Complex grief and loss processing');
    console.log('   • Master-level integration protocols');
    console.log('   • Evidence-based exposure techniques');
    console.log('   • Advanced therapeutic relationship skills');
    
  } catch (error) {
    console.error('❌ Error expanding ultimate DBT skills:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the ultimate expansion
expandUltimateDBTSkills().catch(console.error);