import React, { useState } from 'react'
import { RefreshCw, Trash2, Film, Pencil, Check, X } from 'lucide-react'
import { ModelType, MODELS } from '../utils/falAi'

interface Sequence {
  id: string;
  prompt: string;
  images: string[];
}

interface StoryboardSequenceProps {
  sequence: Sequence;
  onRegenerateImage: (index: number) => void;
  onGenerateKling: (index: number, duration: 5 | 10) => void;
  onClear: () => void;
  onUpdatePrompt: (prompt: string) => void;
  regeneratingIndices?: Set<number>;
  selectedModel: ModelType;
}

export const StoryboardSequence: React.FC<StoryboardSequenceProps> = ({ 
  sequence,
  onRegenerateImage,
  onGenerateKling,
  onClear,
  onUpdatePrompt,
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
    <div className="relative bg-slate-800/50 rounded-lg p-4">
      {/* Model and Prompt Section */}
      <div className="mb-8 grid grid-cols-5 gap-4">
        <div className="col-span-4">
          <div className="text-xs text-gray-400 mb-2">
            Generated with: {MODELS.find(m => m.id === selectedModel)?.name || selectedModel}
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
        <div className="col-span-1"></div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-5 gap-4">
        {sequence.images.map((url, index) => (
          <div key={index} className="relative aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden group">
            {url.endsWith('.mp4') ? (
              <video
                src={url}
                className="w-full h-full object-cover"
                controls
                autoPlay
                loop
                muted
              />
            ) : (
              <img
                src={url}
                alt={`Generated frame ${index + 1}`}
                className="w-full h-full object-cover"
              />
            )}
            {/* Overlay with buttons */}
            <div className="absolute inset-0 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onRegenerateImage(index)}
                disabled={regeneratingIndices.has(index)}
                className="py-3 px-4 bg-black/70 hover:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center transition-colors border-y border-slate-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Regenerate this image"
              >
                <RefreshCw
                  size={20}
                  className={`text-white ${regeneratingIndices.has(index) ? 'animate-spin' : ''}`}
                />
                <span className="ml-3 text-white text-sm font-medium">Regenerate</span>
              </button>
              {!url.endsWith('.mp4') && (
                <>
                  <div className="h-2"></div>
                  <button
                    onClick={() => onGenerateKling(index, 5)}
                    disabled={regeneratingIndices.has(index)}
                    className="py-3 px-4 bg-black/70 hover:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center transition-colors border-y border-slate-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate 5s video"
                  >
                    <Film size={20} className="text-white" />
                    <span className="ml-3 text-white text-sm font-medium">Kling (5s)</span>
                  </button>
                  <div className="h-2"></div>
                  <button
                    onClick={() => onGenerateKling(index, 10)}
                    disabled={regeneratingIndices.has(index)}
                    className="py-3 px-4 bg-black/70 hover:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center transition-colors border-y border-slate-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate 10s video"
                  >
                    <Film size={20} className="text-white" />
                    <span className="ml-3 text-white text-sm font-medium">Kling (10s)</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {/* Video Frame Placeholder */}
        <div className="relative aspect-[9/16] bg-gray-800/50 rounded-lg overflow-hidden flex items-center justify-center">
          <Film size={32} className="text-gray-600" />
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