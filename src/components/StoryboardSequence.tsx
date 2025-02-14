import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Film, Pencil, Check, X, Play } from 'lucide-react';
import { ModelType } from '../utils/falAi';
import { TTSLanguage, TTSVoice, voicesByLanguage, languageVoices } from '../utils/types';
import { TTSPanel } from './TTSPanel';

interface Sequence {
  id: string;
  prompt: string;
  narrative: string;
  dialogues: string[];
  images: string[];
  imageSeeds?: number[];
  expandedPrompts?: string[];
  audioUrls?: string[];
  videoUrls?: string[];
  videoDurations?: (5 | 10)[];
  composedVideoUrl?: string;
}

interface StoryboardSequenceProps {
  sequence: Sequence;
  onUpdateSequence: (sequence: Sequence) => void;
  onRegenerateImage: (index: number, prompt: string, seed?: number, expandedPrompt?: string) => void;
  onGenerateKling: (index: number, duration: 5 | 10) => void;
  onUpdateAudio: (audioUrl: string, index: number) => void;
  onClear: () => void;
  onUpdatePrompt: (prompt: string) => void;
  onUpdateNarrative: (narrative: string) => void;
  onUpdateDialogue: (index: number, dialogue: string) => void;
  onCompose: () => void;
  onComposeVideo: () => void;
  regeneratingIndices: Set<number>;
  selectedModel: ModelType;
}

export function StoryboardSequence({ sequence, onUpdateSequence, onRegenerateImage, onGenerateKling, onUpdateAudio, onClear, onUpdatePrompt, onUpdateNarrative, onUpdateDialogue, onCompose, onComposeVideo, regeneratingIndices, selectedModel }: StoryboardSequenceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(sequence.prompt);
  const [editedNarrative, setEditedNarrative] = useState(sequence.narrative);
  const [isNarrativeExpanded, setIsNarrativeExpanded] = useState(false);
  const [editingDialogueIndex, setEditingDialogueIndex] = useState<number | null>(null);
  const [editedPrompts, setEditedPrompts] = useState<string[]>(sequence.expandedPrompts || Array(sequence.images.length).fill(''));
  const [selectedLanguage, setSelectedLanguage] = useState<TTSLanguage>('american-english');
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice>('af_nova');
  const [regeneratingIndicesState, setRegeneratingIndicesState] = useState(new Set<number>());

  useEffect(() => {
    const voices = voicesByLanguage[selectedLanguage];
    if (voices && voices.length > 0) {
      setSelectedVoice(voices[0]);
    }
  }, [selectedLanguage]);

  const handleRegenerateImage = async (index: number) => {
    if (regeneratingIndicesState.has(index)) return;
    
    try {
      onRegenerateImage(
        index, 
        editedPrompts[index] || sequence.dialogues[index],
        sequence.imageSeeds?.[index],
        sequence.expandedPrompts?.[index]
      );
      setRegeneratingIndicesState((prev) => new Set(prev).add(index));
    } catch (error) {
      console.error('Failed to regenerate image:', error);
    }
  };

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800/50 space-y-4 p-4">
      {/* Clear button at the top */}
      <div className="flex justify-end">
        <button
          onClick={onClear}
          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
          title="Clear sequence"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Voice and language selectors */}
      <div className="flex justify-end gap-2">
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value as TTSLanguage)}
          className="px-3 py-1 bg-gray-700 rounded text-sm"
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
          className="px-3 py-1 bg-gray-700 rounded text-sm"
        >
          {voicesByLanguage[selectedLanguage]?.map((voice) => {
            const voiceOption = languageVoices.find(v => v.id === voice);
            return (
              <option key={voice} value={voice}>
                {voiceOption?.name || voice.replace(/^[abfgipst][fm]_/, '').split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            );
          })}
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4 items-start justify-between">
          <div className="flex flex-col gap-4 flex-grow">
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-400">Generated with: <span className="border border-gray-600 rounded px-1.5 py-0.5">{selectedModel}</span></div>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    className="flex-grow px-4 py-2 bg-gray-700 rounded-lg"
                    placeholder="Enter prompt..."
                  />
                  <button onClick={() => {
                    onUpdatePrompt(editedPrompt);
                    setIsEditing(false);
                  }} className="p-2 hover:bg-gray-700 rounded-lg">
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={() => {
                    setEditedPrompt(sequence.prompt);
                    setIsEditing(false);
                  }} className="p-2 hover:bg-gray-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold flex-grow">{sequence.prompt}</h3>
                  <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-gray-700 rounded-lg">
                    <Pencil className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Collapsible Narrative Section with TTS */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setIsNarrativeExpanded(!isNarrativeExpanded)}
                className="w-full px-3 py-2 bg-gray-700/50 hover:bg-gray-700 flex items-center justify-between text-sm"
              >
                <span>Narrative</span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${isNarrativeExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isNarrativeExpanded && (
                <div className="p-3 bg-gray-700/30 space-y-3">
                  {isEditing ? (
                    <textarea
                      value={editedNarrative}
                      onChange={(e) => setEditedNarrative(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 rounded text-sm min-h-[100px] resize-none"
                      placeholder="Enter narrative..."
                    />
                  ) : (
                    <p className="text-sm text-gray-300">{sequence.narrative}</p>
                  )}
                  
                  {/* Narrative TTS Controls */}
                  <TTSPanel
                    text={sequence.narrative}
                    onAudioGenerated={(url) => onUpdateAudio(url, -1)}
                    initialAudioUrl={sequence.audioUrls?.[0]}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {sequence.images.map((image, index) => (
            <div key={index} className="space-y-2">
              <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-700">
                <img src={image} alt={`Generated ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {regeneratingIndicesState.has(index) && (
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm flex gap-2">
                  <button
                    onClick={() => handleRegenerateImage(index)}
                    disabled={regeneratingIndicesState.has(index)}
                    className="p-1 bg-gray-800/80 hover:bg-gray-700/80 rounded"
                  >
                    <RefreshCw className={`w-4 h-4 ${regeneratingIndicesState.has(index) ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => onGenerateKling(index, 5)}
                    className="p-1 hover:bg-white/20 rounded"
                    title="Generate video"
                  >
                    <Film className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="relative">
                {editingDialogueIndex === index ? (
                  <div className="space-y-2">
                    <div className="h-32 overflow-hidden px-3 py-2 text-xs bg-gray-700 rounded">
                      <div className="font-medium mb-1">Prompt:</div>
                      <div className="text-gray-300 text-xs line-clamp-4">
                        {editedPrompts[index].split('.')[0]}
                      </div>
                    </div>
                    <div className="h-24 px-3 py-2 text-xs bg-gray-700/50 rounded">
                      <div className="font-medium mb-1">Dialogue:</div>
                      <textarea
                        value={sequence.dialogues[index] || ''}
                        onChange={(e) => {
                          const text = e.target.value;
                          if (text.split(' ').length <= 15) {
                            onUpdateDialogue(index, text);
                          }
                        }}
                        className="w-full h-16 bg-transparent resize-none focus:outline-none text-xs"
                        placeholder="Enter a short dialogue (max 15 words)..."
                      />
                    </div>
                    <TTSPanel
                      text={sequence.dialogues[index] || ''}
                      voice={selectedVoice}
                      onAudioGenerated={(url) => onUpdateAudio(url, index)}
                      initialAudioUrl={sequence.audioUrls?.[index]}
                    />
                  </div>
                ) : (
                  <div 
                    onClick={() => setEditingDialogueIndex(index)}
                    className="space-y-2"
                  >
                    <div className="h-32 overflow-hidden px-3 py-2 text-xs bg-gray-700/50 rounded cursor-text hover:bg-gray-700/70">
                      <div className="font-medium mb-1">Prompt:</div>
                      <div className="text-gray-300 text-xs line-clamp-4">
                        {editedPrompts[index].split('.')[0]}
                      </div>
                    </div>
                    <div className="h-24 px-3 py-2 text-xs bg-gray-700/50 rounded cursor-text hover:bg-gray-700/70">
                      <div className="font-medium mb-1">Dialogue:</div>
                      <div className="text-gray-300 text-xs line-clamp-3">
                        {sequence.dialogues[index] || ''}
                      </div>
                    </div>
                    <TTSPanel
                      text={sequence.dialogues[index] || ''}
                      voice={selectedVoice}
                      onAudioGenerated={(url) => onUpdateAudio(url, index)}
                      initialAudioUrl={sequence.audioUrls?.[index]}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}