import OpenAI from 'openai';

// Create a single instance of OpenAI
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Keep track of in-flight requests
const pendingRequests = new Map<string, Promise<NarrativeResult>>();

export interface NarrativeResult {
  narrative: string;
  dialogues: string[];
  imagePrompts: string[];
}

export async function generateNarrative(prompt: string): Promise<NarrativeResult> {
  // Check if there's already a pending request for this prompt
  const existingRequest = pendingRequests.get(prompt);
  if (existingRequest) {
    console.log('Using existing request for prompt:', prompt);
    return existingRequest;
  }

  console.log('Starting new narrative generation for prompt:', prompt);
  
  const request = (async () => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are a creative storyteller. Given a prompt, create a 5-scene narrative with detailed visual descriptions for each scene. 
            Format the response as JSON with the following structure:
            {
              "narrative": "Overall story narrative",
              "imagePrompts": ["Scene 1 visual description", "Scene 2 visual description", "Scene 3 visual description", "Scene 4 visual description", "Scene 5 visual description"]
            }
            Make each scene description vivid and detailed, focusing on visual elements that would work well for image generation.
            Each scene should flow naturally from one to the next, telling a cohesive story.
            Keep each scene description under 200 words but make them detailed and specific.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      console.log('Received response from OpenAI');

      const result = JSON.parse(response.choices[0].message.content || '{}');

      if (!result.narrative || !result.imagePrompts || result.imagePrompts.length !== 5) {
        throw new Error('Invalid response format from OpenAI');
      }

      return {
        narrative: result.narrative,
        imagePrompts: result.imagePrompts.map(prompt => 
          `${prompt}, 9:16 aspect ratio, cinematic lighting, high quality, detailed, photorealistic`
        ),
        dialogues: Array(5).fill('') // Initialize with empty dialogues
      };
    } catch (e) {
      console.error('Failed to generate or parse narrative:', e);
      throw new Error(e instanceof Error ? e.message : 'Failed to generate narrative');
    } finally {
      // Clean up the pending request
      pendingRequests.delete(prompt);
    }
  })();

  // Store the pending request
  pendingRequests.set(prompt, request);
  
  return request;
}

export async function generateStoryPrompts(prompt: string): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are a creative storyteller and visual designer. Create a 5-scene narrative that tells a compelling story. 
          For each scene, write a concise one-sentence description focused on the visual elements, followed by expanded details for image generation.
          Keep the initial description under 20 words. Make it dynamic and visual.
          The expanded details should include artistic style, mood, lighting, and composition in 9:16 vertical format.`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
  });

  const scenes = completion.choices[0].message.content?.split(/Scene \d+: /).filter(Boolean) || [];
  return scenes.map(scene => scene.trim());
}

export async function generateExpandedPrompts(basePrompt: string, narrative: string, count: number): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Given a base prompt and narrative, create ${count} detailed scene descriptions that would work well for image generation.
          Format the response as JSON with the following structure:
          {
            "prompts": ["Scene 1", "Scene 2", "Scene 3", "Scene 4", "Scene 5"]
          }
          Each scene should be a detailed visual description that captures a key moment in the story.
          Focus on visual elements, mood, lighting, and composition.
          Keep each description under 200 words but make them detailed and specific.`
        },
        {
          role: "user",
          content: `Base prompt: ${basePrompt}\nNarrative: ${narrative}`
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    if (!result.prompts || result.prompts.length !== count) {
      throw new Error('Invalid response format from OpenAI');
    }

    return result.prompts;
  } catch (error) {
    console.error('Error generating expanded prompts:', error);
    throw error;
  }
}
