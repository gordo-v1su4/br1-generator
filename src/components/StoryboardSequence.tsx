import React, { useState } from 'react';
import { RefreshCw, Trash2, Film, Pencil, Check, X, Play, Download } from 'lucide-react';
import { ModelType } from '../utils/falAi';
import { TTSPanel } from './TTSPanel';

interface Sequence {
  id: string;
  prompt: string;
  images: string[];
  audioUrl?: string;
  videoUrls?: string[];
  videoDurations?: (5 | 10)[];
  composedVideoUrl?: string;
}

interface StoryboardSequenceProps {
  sequence: Sequence;
  onRegenerateImage: (index: number) => void;
  onGenerateKling: (index: number, duration: 5 | 10) => void;
  onUpdateAudio: (audioUrl: string) => void;
  onClear: () => void;
  onUpdatePrompt: (prompt: string) => void;
  onCompose: () => Promise<string | undefined>;
  onComposeVideo: () => void;
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
  onCompose,
  onComposeVideo,
  regeneratingIndices = new Set(),
  selectedModel
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(sequence.prompt);

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
      <div className="flex gap-4 items-center justify-between">
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
              <button onClick={handleSavePrompt} className="p-2 hover:bg-gray-700 rounded-lg">
                <Check className="w-5 h-5" />
              </button>
              <button onClick={handleCancelEdit} className="p-2 hover:bg-gray-700 rounded-lg">
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
              className="relative aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden"
              data-frame-index={index}
            >
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
                    onClick={() => onRegenerateImage(index)}
                    className="p-1.5 hover:bg-gray-700 rounded-lg"
                    disabled={regeneratingIndices.has(index)}
                  >
                    <RefreshCw className={`w-4 h-4 ${regeneratingIndices.has(index) ? 'animate-spin' : ''}`} />
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onGenerateKling(index, 5)}
                      className="p-1.5 hover:bg-gray-700 rounded-lg flex items-center"
                      disabled={regeneratingIndices.has(index)}
                    >
                      <Film className="w-4 h-4" />
                      <span className="text-xs">5s</span>
                    </button>
                    <button
                      onClick={() => onGenerateKling(index, 10)}
                      className="p-1.5 hover:bg-gray-700 rounded-lg flex items-center"
                      disabled={regeneratingIndices.has(index)}
                    >
                      <Film className="w-4 h-4" />
                      <span className="text-xs">10s</span>
                    </button>
                  </div>
                </div>
                {sequence.videoDurations && sequence.videoDurations[index] && (
                  <span className="text-xs bg-blue-500 px-1.5 py-0.5 rounded">
                    {sequence.videoDurations[index]}s
                  </span>
                )}
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

        {/* Audio and Composition Section */}
        <div className="flex flex-col gap-4 mt-4">
          <TTSPanel onAudioGenerated={onUpdateAudio} initialAudioUrl={sequence.audioUrl} />
          {sequence.videoUrls?.some(url => url) && sequence.audioUrl && (
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