import React, { useState, useMemo, useEffect } from 'react';
import { TTSLanguage, TTSVoice, voicesByLanguage } from '../utils/types';
import { generateTTS } from '../utils/tts';

interface TTSPanelProps {
  onAudioGenerated: (url: string) => void;
  initialAudioUrl?: string;
}

export const TTSPanel: React.FC<TTSPanelProps> = ({ onAudioGenerated, initialAudioUrl }) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<TTSLanguage>('american-english');
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice>('af_nova');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState(initialAudioUrl);

  // Get available voices for the selected language
  const voices = useMemo(() => {
    return (voicesByLanguage[language] || []).map(voiceId => ({
      id: voiceId,
      label: voiceId
        .replace(/^[abfgipst][fm]_/, '')
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }));
  }, [language]);

  // Update selected voice when language changes
  useEffect(() => {
    if (voices.length > 0) {
      setSelectedVoice(voices[0].id);
    }
  }, [language, voices]);

  // Update audio URL when initialAudioUrl changes
  useEffect(() => {
    setAudioUrl(initialAudioUrl);
  }, [initialAudioUrl]);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    
    try {
      const url = await generateTTS(text, selectedVoice, (msg) => {
        console.log('Progress:', msg);
      });
      setAudioUrl(url);
      onAudioGenerated(url);
    } catch (error) {
      console.error('Failed to generate audio:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-start">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 h-20 px-2 py-1 bg-gray-700 text-white rounded-md text-sm resize-none"
          placeholder="Enter narration text..."
          disabled={isGenerating}
        />
        <div className="flex flex-col gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as TTSLanguage)}
            className="w-32 px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
            disabled={isGenerating}
          >
            {Object.keys(voicesByLanguage).map((lang) => (
              <option key={lang} value={lang}>
                {lang.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value as TTSVoice)}
            className="w-32 px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
            disabled={isGenerating}
          >
            {voices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim()}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
      {audioUrl && (
        <audio 
          src={audioUrl} 
          controls 
          className="w-full mt-2"
        />
      )}
    </div>
  );
};
