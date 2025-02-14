import { fal } from "@fal-ai/client";
import { TTSLanguage, TTSVoice } from './types';

// Input type for Kokoro TTS endpoint
interface KokoroInput {
  prompt: string;
  voice: TTSVoice;
}

// Result type matching FAL.ai API response
interface TTSResult {
  audio: {
    url: string;
  };
}

// Full endpoint type following FAL.ai's structure
interface KokoroEndpoint {
  data: TTSResult;
  error?: string;
}

export async function generateTTS(
  prompt: string,
  voice: TTSVoice,
  onProgress?: (progress: string) => void
): Promise<string> {
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  // Get language from voice ID prefix
  const languageMap: Record<string, TTSLanguage> = {
    'a': 'american-english',
    'b': 'british-english',
    'f': 'french',
    'g': 'german',
    'i': 'italian',
    'p': 'polish',
    'pt': 'portuguese',
    's': 'spanish',
    't': 'turkish'
  };
  
  const language = languageMap[voice.charAt(0)] || 'american-english';

  try {
    // Use subscribe to handle progress updates
    const result = await fal.subscribe(`fal-ai/kokoro/${language}`, {
      input: {
        prompt,
        voice
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS" && onProgress && 'logs' in update) {
          update.logs?.forEach(log => onProgress(log.message));
        }
      }
    });

    if (!result.data?.audio?.url) {
      throw new Error('No audio URL in response');
    }

    return result.data.audio.url;
  } catch (error) {
    console.error('Failed to generate TTS:', error);
    throw error;
  }
}
