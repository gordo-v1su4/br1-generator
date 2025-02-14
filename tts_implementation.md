# TTS Implementation Files from Commit b090e1140878eb49ba84467a9dad21373c555b50

## src/utils/tts.ts
```typescript
import { fal } from "@fal-ai/client";
import { TTSLanguage, TTSVoice } from './types';

// Result type matching FAL.ai API response
interface TTSResult {
  audio: {
    url: string;
  };
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
```

## src/utils/types.ts (TTS-related parts)
```typescript
// TTS Types
export type TTSLanguage = 
  | 'american-english'
  | 'british-english'
  | 'french'
  | 'german'
  | 'italian'
  | 'polish'
  | 'portuguese'
  | 'spanish'
  | 'turkish';

export type TTSVoice = 
  | 'af_nova'   // American Female Nova
  | 'af_rachel' // American Female Rachel
  | 'af_domi'   // American Female Domi
  | 'am_adam'   // American Male Adam
  | 'am_josh'   // American Male Josh
  | 'am_henry'  // American Male Henry
  | 'bf_emma'   // British Female Emma
  | 'bf_lily'   // British Female Lily
  | 'bm_james'  // British Male James
  | 'bm_thomas' // British Male Thomas
  | 'ff_lea'    // French Female Lea
  | 'ff_julie'  // French Female Julie
  | 'fm_paul'   // French Male Paul
  | 'gf_elena'  // German Female Elena
  | 'gm_klaus'  // German Male Klaus
  | 'if_elisa'  // Italian Female Elisa
  | 'im_marco'  // Italian Male Marco
  | 'pf_julia'  // Polish Female Julia
  | 'pm_jan'    // Polish Male Jan
  | 'ptf_ana'   // Portuguese Female Ana
  | 'ptm_joao'  // Portuguese Male Joao
  | 'sf_lucia'  // Spanish Female Lucia
  | 'sf_maria'  // Spanish Female Maria
  | 'sm_pedro'  // Spanish Male Pedro
  | 'tf_ayse'   // Turkish Female Ayse
  | 'tm_ahmet'; // Turkish Male Ahmet

export interface VoiceOption {
  id: TTSVoice;
  name: string;
}

// Runtime map of voices by language
export const voicesByLanguage: Record<TTSLanguage, TTSVoice[]> = {
  'american-english': ['af_nova', 'af_rachel', 'af_domi', 'am_adam', 'am_josh', 'am_henry'],
  'british-english': ['bf_emma', 'bf_lily', 'bm_james', 'bm_thomas'],
  'french': ['ff_lea', 'ff_julie', 'fm_paul'],
  'german': ['gf_elena', 'gm_klaus'],
  'italian': ['if_elisa', 'im_marco'],
  'polish': ['pf_julia', 'pm_jan'],
  'portuguese': ['ptf_ana', 'ptm_joao'],
  'spanish': ['sf_lucia', 'sf_maria', 'sm_pedro'],
  'turkish': ['tf_ayse', 'tm_ahmet']
};
```

## src/components/TTSPanel.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { generateTTS } from '../utils/tts';
import { TTSVoice } from '../utils/types';
import { Play, Loader2 } from 'lucide-react';

interface TTSPanelProps {
  onAudioGenerated: (url: string) => void;
  initialAudioUrl?: string;
  text?: string;
  voice?: TTSVoice;
}

export function TTSPanel({ onAudioGenerated, initialAudioUrl, text = '', voice = 'af_nova' }: TTSPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(initialAudioUrl);

  useEffect(() => {
    if (initialAudioUrl) {
      setAudioUrl(initialAudioUrl);
    }
  }, [initialAudioUrl]);

  const handleGenerateTTS = async () => {
    if (!text) return;
    
    try {
      setIsGenerating(true);
      const url = await generateTTS(text, voice, (progress) => {
        console.log('TTS Progress:', progress);
      });
      setAudioUrl(url);
      onAudioGenerated(url);
    } catch (error) {
      console.error('Error generating TTS:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      {audioUrl ? (
        <audio src={audioUrl} controls className="w-full h-8" />
      ) : (
        <button
          onClick={handleGenerateTTS}
          disabled={isGenerating || !text}
          className="flex items-center gap-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Generate Voice
            </>
          )}
        </button>
      )}
    </div>
  );
}
```
