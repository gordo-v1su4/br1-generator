import { useState, useEffect, useCallback } from 'react';
import { StoryboardPrompt } from './components/StoryboardPrompt';
import { StoryboardSequence } from './components/StoryboardSequence';
import { ModelSelector } from './components/ModelSelector';
import { generateSequence, ModelType } from './utils/falAi';
import { generateNarrative } from './utils/narrativeGenerator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { generateImages, generateSingleImage } from './utils/falAi';
import { generateKlingVideo } from './utils/klingVideo';
import { composeVideoWithAudio } from './utils/ffmpegCompose';

interface Sequence {
  id: string;
  prompt: string;
  narrative: string;
  dialogues: string[];
  images: string[];
  audioUrls?: string[];
  videoUrls?: string[];
  videoDurations?: (5 | 10)[];
  composedVideoUrl?: string;
  imageSeeds?: number[];
  expandedPrompts?: string[];
}

function App() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>('realistic-vision');
  const [regeneratingIndices, setRegeneratingIndices] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [activeSequence, setActiveSequence] = useState<Sequence | null>(null);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    // Check if environment variables are loaded
    console.log('Environment variables check:', {
      falApiKey: !!import.meta.env.VITE_FAL_API_KEY,
      openaiApiKey: !!import.meta.env.VITE_OPENAI_API_KEY
    });
  }, []);

  const handleGenerate = async () => {
    if (!prompt || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setActiveSequence(null);

    try {
      // Generate the narrative first
      const narrativeResult = await generateNarrative(prompt);
      
      // Generate 5 expanded prompts
      const expandedPrompts = narrativeResult.imagePrompts;
      
      // Generate all 5 images in parallel
      const imagePromises = expandedPrompts.map(expandedPrompt => 
        generateSingleImage(expandedPrompt, selectedModel)
      );

      const images = await Promise.all(imagePromises);

      // Create initial sequence with empty dialogues
      const newSequence: Sequence = {
        id: Date.now().toString(),
        prompt,
        narrative: narrativeResult.narrative,
        expandedPrompts,
        images,
        dialogues: Array(5).fill(''),
        audioUrls: Array(5).fill(null)
      };

      setSequences(prev => [newSequence, ...prev]);
      setActiveSequence(newSequence);
      setPrompt('');
    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during generation');
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const handleRegenerateImage = async (index: number, prompt: string, seed?: number, expandedPrompt?: string) => {
    try {
      setRegeneratingIndices(prev => new Set([...prev, index]));
      const newImageUrl = await generateSingleImage(prompt, selectedModel);

      setSequences(prev =>
        prev.map(seq =>
          seq.id === activeSequence?.id
            ? {
                ...seq,
                images: seq.images.map((img, i) => (i === index ? newImageUrl : img)),
              }
            : seq
        )
      );
    } catch (error) {
      console.error('Error regenerating image:', error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate image. Please try again.');
    } finally {
      setRegeneratingIndices(prev => new Set([...prev].filter(i => i !== index)));
    }
  };

  const handleGenerateKling = async (index: number, duration: 5 | 10) => {
    if (!activeSequence) return;
    
    try {
      const videoResult = await generateKlingVideo(
        activeSequence.dialogues[index] || activeSequence.prompt,
        activeSequence.images[index],
        duration
      );
      
      setSequences(prevSequences => {
        return prevSequences.map(seq => {
          if (seq.id === activeSequence.id) {
            const newVideoUrls = [...(seq.videoUrls || Array(seq.images.length).fill(null))];
            const newDurations = [...(seq.videoDurations || Array(seq.images.length).fill(5))];
            newVideoUrls[index] = videoResult.video.url;
            newDurations[index] = duration;
            
            return {
              ...seq,
              videoUrls: newVideoUrls,
              videoDurations: newDurations
            };
          }
          return seq;
        });
      });
    } catch (error) {
      console.error('Error generating kling:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate video. Please try again.');
    }
  };

  const handleUpdateAudio = (audioUrl: string, index: number) => {
    if (!activeSequence) return;
    setSequences(prevSequences => {
      return prevSequences.map(seq => {
        if (seq.id === activeSequence.id) {
          const newAudioUrls = [...(seq.audioUrls || new Array(seq.images.length).fill(null))];
          newAudioUrls[index] = audioUrl;
          return {
            ...seq,
            audioUrls: newAudioUrls
          };
        }
        return seq;
      });
    });
  };

  const handleUpdateDialogue = (index: number, dialogue: string) => {
    if (!activeSequence) return;
    setSequences(prevSequences => {
      return prevSequences.map(seq => {
        if (seq.id === activeSequence.id) {
          const newDialogues = [...seq.dialogues];
          newDialogues[index] = dialogue;
          return {
            ...seq,
            dialogues: newDialogues
          };
        }
        return seq;
      });
    });
  };

  const handleClearSequence = () => {
    if (!activeSequence) return;
    setSequences(prev => prev.filter(seq => seq.id !== activeSequence.id));
    setActiveSequence(null);
  };

  const handleUpdatePrompt = async (newPrompt: string) => {
    if (!activeSequence) return;
    setSequences(prevSequences => {
      return prevSequences.map(seq => {
        if (seq.id === activeSequence.id) {
          return {
            ...seq,
            prompt: newPrompt
          };
        }
        return seq;
      });
    });
  };

  const handleUpdateNarrative = async (narrative: string) => {
    if (!activeSequence) return;
    setSequences(prevSequences => {
      return prevSequences.map(seq => {
        if (seq.id === activeSequence.id) {
          return {
            ...seq,
            narrative
          };
        }
        return seq;
      });
    });
  };

  const handleComposeVideo = async () => {
    if (!activeSequence) return;

    // Compose video with multiple audio tracks
    const videoUrls = activeSequence.videoUrls || [];
    const audioUrls = activeSequence.audioUrls || [];
    
    // TODO: Implement video composition with multiple audio tracks
    // This will need to be handled by your video composition service
  };

  const renderSequence = useCallback((sequence: Sequence) => (
    <StoryboardSequence
      key={sequence.id}
      sequence={sequence}
      onRegenerateImage={handleRegenerateImage}
      onGenerateKling={handleGenerateKling}
      onUpdateAudio={handleUpdateAudio}
      onClear={handleClearSequence}
      onUpdatePrompt={handleUpdatePrompt}
      onUpdateNarrative={handleUpdateNarrative}
      onUpdateDialogue={handleUpdateDialogue}
      onCompose={handleComposeVideo}
      regeneratingIndices={regeneratingIndices}
      selectedModel={selectedModel}
    />
  ), [handleRegenerateImage, handleGenerateKling, handleUpdateAudio, handleClearSequence, 
      handleUpdatePrompt, handleUpdateNarrative, handleUpdateDialogue, 
      handleComposeVideo, regeneratingIndices, selectedModel]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <ModelSelector selectedModel={selectedModel} onModelSelect={setSelectedModel} />
            <StoryboardPrompt 
              onGenerate={handleGenerate} 
              isLoading={isLoading} 
              isGenerating={isGenerating} 
              prompt={prompt} 
              setPrompt={setPrompt} 
            />
            <div className="space-y-4">
              {sequences.map(renderSequence)}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;