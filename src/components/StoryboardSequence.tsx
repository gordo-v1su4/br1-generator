import React, { useState } from 'react';
import { RefreshCw, Trash2, Film, Pencil, Check, X, Play, Download } from 'lucide-react';
import { ModelType } from '../utils/falAi';
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

export function StoryboardSequence({ sequence, onRegenerateImage, onGenerateKling, onUpdateAudio, onClear, onUpdatePrompt, onUpdateNarrative, onUpdateDialogue, onCompose, onComposeVideo, regeneratingIndices, selectedModel }: StoryboardSequenceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(sequence.prompt);
  const [editedNarrative, setEditedNarrative] = useState(sequence.narrative);
  const [isNarrativeExpanded, setIsNarrativeExpanded] = useState(false);
  const [editingDialogueIndex, setEditingDialogueIndex] = useState<number | null>(null);
  const [editedDialogues, setEditedDialogues] = useState<string[]>(sequence.dialogues || []);

  const handleRegenerateImage = (index: number) => {
    onRegenerateImage(
      index, 
      editedDialogues[index], 
      sequence.imageSeeds?.[index],
      sequence.expandedPrompts?.[index]
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-start justify-between">
        <div className="flex flex-col gap-4 flex-grow">
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400">Generated with: <span className="border border-gray-600 rounded px-1.5 py-0.5">{selectedModel}</span></div>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="bg-gray-800 text-white px-3 py-2 rounded-lg flex-grow"
                />
                <button onClick={() => {
                  onUpdatePrompt(editedPrompt);
                  onUpdateNarrative(editedNarrative);
                  setIsEditing(false);
                }} className="p-2 hover:bg-gray-700 rounded-lg">
                  <Check className="w-5 h-5" />
                </button>
                <button onClick={() => {
                  setEditedPrompt(sequence.prompt);
                  setEditedNarrative(sequence.narrative);
                  setIsEditing(false);
                }} className="p-2 hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">{sequence.prompt}</h3>
                <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-gray-700 rounded-lg">
                  <Pencil className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Collapsible Narrative Section */}
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
              <div className="p-3 bg-gray-700/30">
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
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            <Trash2 className="w-5 h-5" />
            Clear
          </button>
          {sequence.videoUrls && sequence.videoUrls.some(url => url !== null) && (
            <button
              onClick={async () => {
                const composedUrl = await onCompose();
                if (composedUrl) {
                  window.open(composedUrl, '_blank');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Play className="w-5 h-5" />
              Compose Video
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        {/* Left side: Image grid */}
        <div className="flex-1 grid grid-cols-5 gap-4">
          {sequence.images.map((image, index) => (
            <div 
              key={index} 
              className="relative flex flex-col gap-2"
            >
              <div className="relative aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden">
                {sequence.videoUrls?.[index] ? (
                  <video
                    src={sequence.videoUrls[index] || ''}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  image && (
                    <img
                      src={image}
                      alt={`Frame ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 flex justify-between items-center">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleRegenerateImage(index)}
                      className="p-1.5 hover:bg-gray-700 rounded-lg"
                      disabled={regeneratingIndices.has(index)}
                    >
                      <RefreshCw className={`w-4 h-4 ${regeneratingIndices.has(index) ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => onGenerateKling(index, 5)}
                      className="p-1.5 hover:bg-gray-700 rounded-lg flex items-center"
                      disabled={regeneratingIndices.has(index)}
                    >
                      <Film className="w-4 h-4" />
                      <span className="text-xs">5s</span>
                    </button>
                  </div>
                  {sequence.videoDurations && sequence.videoDurations[index] && (
                    <span className="text-xs bg-blue-500 px-1.5 py-0.5 rounded">
                      {sequence.videoDurations[index]}s
                    </span>
                  )}
                </div>
              </div>

              {/* Dialogue and TTS section */}
              <div className="space-y-2">
                {/* Dialogue box */}
                <div className="relative">
                  {editingDialogueIndex === index ? (
                    <div className="flex gap-2">
                      <textarea
                        value={editedDialogues[index]}
                        onChange={(e) => {
                          const newDialogues = [...editedDialogues];
                          newDialogues[index] = e.target.value;
                          setEditedDialogues(newDialogues);
                        }}
                        className="w-full px-2 py-1 bg-gray-700 rounded text-sm min-h-[60px] resize-none"
                        placeholder="Enter dialogue..."
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => {
                            onUpdateDialogue(index, editedDialogues[index]);
                            setEditingDialogueIndex(null);
                          }}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditedDialogues(sequence.dialogues);
                            setEditingDialogueIndex(null);
                          }}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative bg-gray-700 p-2 rounded text-sm">
                      {sequence.dialogues?.[index]}
                      <button
                        onClick={() => setEditingDialogueIndex(index)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Individual TTS Panel */}
                <TTSPanel
                  text={sequence.dialogues?.[index] || ''}
                  onAudioGenerated={(url) => onUpdateAudio(url, index)}
                  initialAudioUrl={sequence.audioUrls?.[index]}
                />
              </div>
            </div>
          ))}
          {/* Final Video Placeholder */}
          <div className="relative aspect-[9/16] bg-gray-800/50 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Film className="w-8 h-8 text-gray-600" />
              <span className="text-sm text-gray-500">Final Video</span>
            </div>
          </div>
        </div>

        {/* Right side: Composition Section */}
        <div className="flex flex-col gap-4">
          {sequence.videoUrls?.some(url => url) && sequence.audioUrls?.some(url => url) && (
            <button
              onClick={onComposeVideo}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
            >
              <Film className="w-5 h-5" />
              <span>Compose Videos and Audio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}