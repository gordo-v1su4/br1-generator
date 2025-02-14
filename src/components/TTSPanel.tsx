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
    <div className="flex items-center gap-2">
      {audioUrl ? (
        <audio src={audioUrl} controls className="w-full h-6" />
      ) : (
        <button
          onClick={handleGenerateTTS}
          disabled={isGenerating || !text}
          className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              <span>Generate Voice</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
