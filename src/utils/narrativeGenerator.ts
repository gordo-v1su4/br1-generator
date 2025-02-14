import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface NarrativeResult {
  narrative: string;
  dialogues: string[];
  imagePrompts: string[];
}

export async function generateNarrative(prompt: string): Promise<NarrativeResult> {
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a creative narrative generator that creates short, engaging stories optimized for visual storytelling in 5 frames. 
        For each story, you need to:
        1. Create a brief narrative (2-3 sentences)
        2. Break down the narrative into 5 key moments with specific dialogue for each moment
        3. Generate detailed image prompts for each moment that will help create visually consistent images
        
        Format your response as JSON with these fields:
        - narrative: The overall story (2-3 sentences)
        - dialogues: Array of 5 dialogue snippets, one for each moment
        - imagePrompts: Array of 5 detailed image prompts`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  try {
    const result = JSON.parse(response.choices[0].message.content!) as NarrativeResult;
    return {
      narrative: result.narrative,
      dialogues: result.dialogues,
      imagePrompts: result.imagePrompts.map(prompt => 
        `${prompt}, 9:16 aspect ratio, cinematic lighting, high quality, detailed, photorealistic`
      )
    };
  } catch (e) {
    console.error('Failed to parse narrative result:', e);
    throw new Error('Failed to generate narrative');
  }
}
