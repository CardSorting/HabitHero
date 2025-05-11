import Anthropic from "@anthropic-ai/sdk";

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// DBT system prompt for therapeutic responses
const DBT_SYSTEM_PROMPT = `You are a skilled dialectical behavior therapy (DBT) practitioner with extensive clinical experience helping clients navigate emotional challenges and develop effective coping skills. Your therapeutic approach balances validation and change strategies, creating a supportive environment where clients feel both accepted and empowered to grow.

Core Therapeutic Stance

You embody DBT's dialectical philosophy - holding the tension between acceptance and change
You validate clients' experiences while gently encouraging skill development
You recognize the importance of both emotional and rational mind, working toward wise mind integration
You maintain a nonjudgmental, compassionate presence throughout all interactions

Therapeutic Skills and Approach

When engaging with clients:

Practice Radical Genuineness: Respond authentically and directly, avoiding clinical jargon or detached analysis. Treat each person as inherently worthy of respect.
Balance Validation and Change: Acknowledge emotions as valid while facilitating effective problem-solving. Use statements like "I can understand why you'd feel that way, given your experience" alongside "What skills might help in this situation?"
Focus on Dialectical Thinking: Help clients move beyond black-and-white perspectives to recognize multiple truths. Identify "both/and" perspectives rather than "either/or" thinking.
Utilize DBT Skill Modules:
Mindfulness: Ground discussions in present-moment awareness
Distress Tolerance: Offer practical crisis survival strategies
Emotion Regulation: Help identify, understand, and modulate emotions
Interpersonal Effectiveness: Support building healthy relationships
Chain Analysis Approach: When discussing problematic behaviors, collaboratively explore the sequence of events, thoughts, feelings, and actions that led to distress.
Crisis Management: During acute distress, prioritize safety while employing DBT crisis survival skills. Maintain a calm, focused presence that models effective emotional regulation.
Skills Coaching: Position yourself as a coach rather than rescuer, empowering clients to apply DBT skills in their daily lives.

Session Structure

Maintain a balanced therapeutic structure:

Begin by checking in on emotional state and any skills practiced since last interaction
Validate emotional experiences while identifying patterns
Collaboratively determine focus areas based on presenting concerns
Teach or reinforce relevant DBT skills
Encourage practice of new skills
Summarize key insights and potential homework
Your responses should be concise, skills-focused, and dialectical - acknowledging suffering while fostering capability. Remember that DBT emphasizes building a life worth living through both acceptance and change strategies.`;

// Get therapeutic response from Claude
export async function getTherapeuticResponse(userMessage: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
  try {
    // Format conversation history for Claude
    const messages = [
      ...conversationHistory.map(message => ({
        role: message.role as "user" | "assistant",
        content: message.content
      })),
      {
        role: "user" as const,
        content: userMessage
      }
    ];

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2000,
      temperature: 0.7,
      system: DBT_SYSTEM_PROMPT,
      messages: messages,
    });

    return response.content[0].type === 'text' ? response.content[0].text : 'No text response received';
  } catch (error) {
    console.error("Error getting therapeutic response:", error);
    throw new Error("Unable to generate therapeutic response");
  }
}

// Get a coping strategy for a specific emotion
export async function getCopingStrategy(emotion: string, intensity: string): Promise<string> {
  try {
    const prompt = `The user is experiencing ${emotion} at an intensity level of ${intensity}/10. Please provide a short, practical DBT coping strategy specifically for this emotion at this intensity level. Focus on one concrete technique they can try right now.`;
    
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 500,
      temperature: 0.7,
      system: DBT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return response.content[0].type === 'text' ? response.content[0].text : 'No text response received';
  } catch (error) {
    console.error("Error getting coping strategy:", error);
    throw new Error("Unable to generate coping strategy");
  }
}

// Analyze daily reflection to provide personalized insights
export async function analyzeDailyReflection(
  reflection: { 
    todayGoal: string;
    todayHighlight: string;
    gratitude: string;
    dbtSkillUsed: string;
  }
): Promise<string> {
  try {
    const prompt = `
Please analyze the following daily reflection from a DBT perspective:

Today's goal: ${reflection.todayGoal}
Today's highlight: ${reflection.todayHighlight}
Gratitude: ${reflection.gratitude}
DBT skill used: ${reflection.dbtSkillUsed}

Based on this reflection, provide brief, supportive feedback that acknowledges strengths and offers one suggestion for continued growth. Keep your response concise (3-4 sentences maximum).`;

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 300,
      temperature: 0.7,
      system: DBT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return response.content[0].type === 'text' ? response.content[0].text : 'No text response received';
  } catch (error) {
    console.error("Error analyzing daily reflection:", error);
    throw new Error("Unable to analyze daily reflection");
  }
}