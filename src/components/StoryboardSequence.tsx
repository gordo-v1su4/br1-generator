import React, { useState } from 'react';
import { RefreshCw, Trash2, Film, Pencil, Check, X } from 'lucide-react';
import { ModelType } from '../utils/falAi';
import { TTSPanel } from './TTSPanel';

interface Sequence {
  id: string;
  prompt: string;
  images: string[];
  audioUrls: string[];
}

interface StoryboardSequenceProps {
  sequence: Sequence;
  onRegenerateImage: (index: number) => void;
  onGenerateKling: (index: number, duration: 5 | 10) => void;
  onUpdateAudio: (index: number, audioUrl: string) => void;
  onClear: () => void;
  onUpdatePrompt: (prompt: string) => void;
  regeneratingIndices?: Set<number>;
  selectedModel: ModelType;
}

export const StoryboardSequence: React.FC<StoryboardSequenceProps> = ({ 
  sequence,
  onRegenerateImage,
  onGenerateKling,
  onUpdateAudio,
  onClear,
  onUpdatePrompt,
  regeneratingIndices = new Set(),
  selectedModel
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(sequence.prompt);
  const [selectedAudioIndex, setSelectedAudioIndex] = useState(0);

  const handleSavePrompt = () => {
    onUpdatePrompt(editedPrompt);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedPrompt(sequence.prompt);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        {/* Left side: Image grid */}
        <div className="flex-1 grid grid-cols-5 gap-4">
          {sequence.images.map((imageUrl, index) => (
            <div key={index} className="relative aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden group">
              {imageUrl.endsWith('.mp4') ? (
                <video
                  src={imageUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-[9/16] bg-slate-800 rounded-lg"
                />
              ) : (
                <img
                  src={imageUrl}
                  alt={`Generated frame ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Processing overlay */}
              {regeneratingIndices.has(index) && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-white/20 border-t-white/90 rounded-full animate-spin"></div>
                    <div className="text-white/90 text-sm animate-pulse">Processing...</div>
                  </div>
                </div>
              )}

              {/* Overlay buttons - only show when not processing */}
              {!regeneratingIndices.has(index) && (
                <div className="absolute inset-x-0 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                  <div className="relative group/tooltip">
                    <button
                      onClick={() => onRegenerateImage(index)}
                      className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/90 backdrop-blur-sm transition-all"
                    >
                      <RefreshCw size={20} />
                    </button>
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-lg text-xs text-white/90 opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                      Regenerate image
                    </div>
                  </div>
                  <div className="relative group/tooltip">
                    <button
                      onClick={() => onGenerateKling(index, 5)}
                      className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/90 backdrop-blur-sm transition-all"
                    >
                      <div className="flex items-center">
                        <Film size={20} />
                        <span className="ml-1 text-xs">5</span>
                      </div>
                    </button>
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-lg text-xs text-white/90 opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                      Generate 5s Kling video
                    </div>
                  </div>
                  <div className="relative group/tooltip">
                    <button
                      onClick={() => onGenerateKling(index, 10)}
                      className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/90 backdrop-blur-sm transition-all"
                    >
                      <div className="flex items-center">
                        <Film size={20} />
                        <span className="ml-1 text-xs">10</span>
                      </div>
                    </button>
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-lg text-xs text-white/90 opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                      Generate 10s Kling video
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {/* Video Frame Placeholder */}
          <div className="relative aspect-[9/16] bg-gray-800/50 rounded-lg overflow-hidden flex items-center justify-center">
            <Film size={32} className="text-gray-600" />
          </div>
        </div>

        {/* Right side: TTS */}
        <div className="w-96">
          {/* Model and Prompt Section */}
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-2">
              Generated with: {selectedModel}
            </div>
            {isEditing ? (
              <div className="relative">
                <input
                  type="text"
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="w-full px-3 py-1.5 pr-16 bg-slate-700 text-white border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Edit your prompt..."
                  autoFocus
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    onClick={handleSavePrompt}
                    className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md"
                    title="Save prompt"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md"
                    title="Cancel edit"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-full px-3 py-1.5 pr-12 bg-slate-700 text-white border border-slate-600 rounded-md">
                  <p className="text-sm text-gray-300">{sequence.prompt}</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-600 text-gray-400 hover:text-white rounded-md transition-colors"
                  title="Edit prompt"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}
          </div>

          {/* TTS Panel */}
          <TTSPanel 
            onAudioGenerated={(url) => {
              // Create a new array with the updated audio URL
              const newAudioUrls = Array.from(sequence.audioUrls);
              newAudioUrls[selectedAudioIndex] = url;
              onUpdateAudio(selectedAudioIndex, url);
            }}
            initialAudioUrl={sequence.audioUrls[selectedAudioIndex]}
          />
        </div>
      </div>
      {/* Clear Button */}
      <button
        onClick={onClear}
        className="absolute top-4 right-4 p-1.5 hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded-md transition-colors"
        title="Clear sequence"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}