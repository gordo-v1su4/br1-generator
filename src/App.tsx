import { useState, useEffect, Component } from 'react';
import { StoryboardPrompt } from './components/StoryboardPrompt';
import { StoryboardSequence } from './components/StoryboardSequence';
import { ModelSelector } from './components/ModelSelector';
import { generateImages, generateSingleImage, ModelType } from './utils/falAi';
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

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-gray-300 p-8">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
          <pre className="bg-gray-800 p-4 rounded">{this.state.error?.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  console.log('App component rendering...'); // Debug log

  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>('realistic-vision');
  const [regeneratingIndices, setRegeneratingIndices] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [activeSequence, setActiveSequence] = useState<Sequence | null>(null);

  useEffect(() => {
    // Check if environment variables are loaded
    console.log('Environment variables check:', {
      falApiKey: !!import.meta.env.VITE_FAL_API_KEY,
      openaiApiKey: !!import.meta.env.VITE_OPENAI_API_KEY
    });
  }, []);

  const handleGenerateSequence = async (prompt: string, narrative: string, dialogues: string[], imagePrompts: string[]) => {
    console.log('Generating sequence with:', { prompt, narrative, dialogues, imagePrompts }); // Debug log
    setIsLoading(true);
    setError(null);
    
    try {
      const images = await Promise.all(imagePrompts.map(prompt => generateImages(prompt, selectedModel)));
      console.log('Generated images:', images); // Debug log
      
      const newSequence: Sequence = {
        id: window.crypto.randomUUID(),
        prompt,
        narrative,
        dialogues,
        images: images.flat(),
        audioUrls: new Array(images.flat().length).fill(null)
      };
      setSequences(prevSequences => [newSequence, ...prevSequences]);
      setActiveSequence(newSequence);
    } catch (error) {
      console.error('Error generating sequence:', error);
      setError('Failed to generate images. Please try again.');
      alert('Failed to generate images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateImage = async (index: number, prompt: string, seed?: number, expandedPrompt?: string) => {
    if (!activeSequence) return;

    setRegeneratingIndices(prev => new Set(prev.add(index)));
    try {
      const result = await generateSingleImage({
        prompt,
        seed,
        expandedPrompt,
        modelType: selectedModel
      });

      setSequences(prev => prev.map(seq => {
        if (seq.id === activeSequence.id) {
          const newImages = [...seq.images];
          const newSeeds = [...(seq.imageSeeds || [])];
          const newExpandedPrompts = [...(seq.expandedPrompts || [])];
          
          newImages[index] = result.imageUrl;
          newSeeds[index] = result.seed;
          newExpandedPrompts[index] = result.expandedPrompt;
          
          return {
            ...seq,
            images: newImages,
            imageSeeds: newSeeds,
            expandedPrompts: newExpandedPrompts
          };
        }
        return seq;
      }));
    } catch (error) {
      console.error('Error regenerating image:', error);
      setError('Failed to regenerate image. Please try again.');
    } finally {
      setRegeneratingIndices(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const handleUpdateDialogue = (sequenceId: string, index: number, dialogue: string) => {
    setSequences(prev => prev.map(seq => {
      if (seq.id === sequenceId) {
        const newDialogues = [...seq.dialogues];
        newDialogues[index] = dialogue;
        return {
          ...seq,
          dialogues: newDialogues
        };
      }
      return seq;
    }));
  };

  const handleGenerateKling = async (sequenceId: string, index: number, duration: 5 | 10) => {
    setRegeneratingIndices(prev => new Set(prev).add(index));

    try {
      const sequence = sequences.find(seq => seq.id === sequenceId);
      if (!sequence) throw new Error('Sequence not found');
      if (!sequence.images[index]) throw new Error('No image found at index');

      const result = await generateKlingVideo(
        sequence.prompt,
        sequence.images[index],
        duration
      );
      
      setSequences(prevSequences => {
        return prevSequences.map(seq => {
          if (seq.id === sequenceId) {
            const newVideoUrls = [...(seq.videoUrls || Array(seq.images.length).fill(null))];
            const newDurations = [...(seq.videoDurations || Array(seq.images.length).fill(5))];
            newVideoUrls[index] = result.video.url;
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
      console.error('Error generating video:', error);
      alert('Failed to generate video. Please try again.');
    } finally {
      setRegeneratingIndices(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const handleUpdateAudio = (audioUrl: string, index: number) => {
    setSequences(prev => prev.map(seq => {
      if (seq.id === activeSequence?.id) {
        const newAudioUrls = [...(seq.audioUrls || new Array(seq.images.length).fill(null))];
        newAudioUrls[index] = audioUrl;
        return {
          ...seq,
          audioUrls: newAudioUrls
        };
      }
      return seq;
    }));
  };

  const handleComposeVideo = async () => {
    if (!activeSequence) return;

    // Compose video with multiple audio tracks
    const videoUrls = activeSequence.videoUrls || [];
    const audioUrls = activeSequence.audioUrls || [];
    
    // TODO: Implement video composition with multiple audio tracks
    // This will need to be handled by your video composition service
  };

  const handleClearSequence = (id: string) => {
    setSequences(sequences.filter(seq => seq.id !== id));
  };

  const handleUpdatePrompt = async (id: string, prompt: string) => {
    const sequence = sequences.find(seq => seq.id === id);
    if (!sequence) return;

    setSequences(
      sequences.map(seq =>
        seq.id === id ? { ...seq, prompt } : seq
      )
    );
  };

  const handleUpdateNarrative = async (id: string, narrative: string) => {
    const sequence = sequences.find(seq => seq.id === id);
    if (!sequence) return;

    setSequences(
      sequences.map(seq =>
        seq.id === id ? { ...seq, narrative } : seq
      )
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-gray-300">
        <div className="max-w-[1400px] mx-auto p-8">
          <h1 className="text-4xl font-bold mb-8 mt-[5px] tracking-wide bg-[length:200%_auto] bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-transparent bg-clip-text animate-gradient">
            BRAINROT SEQUENCE GENERATOR
          </h1>
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <ModelSelector selectedModel={selectedModel} onModelSelect={setSelectedModel} />
            <StoryboardPrompt onGenerate={handleGenerateSequence} isLoading={isLoading} />
            <div className="space-y-4">
              {sequences.map(sequence => (
                <StoryboardSequence
                  key={sequence.id}
                  sequence={sequence}
                  onRegenerateImage={(index, prompt, seed, expandedPrompt) => handleRegenerateImage(index, prompt, seed, expandedPrompt)}
                  onGenerateKling={(index, duration) => handleGenerateKling(sequence.id, index, duration)}
                  onUpdateAudio={(audioUrl, index) => handleUpdateAudio(audioUrl, index)}
                  onUpdateDialogue={(index, dialogue) => handleUpdateDialogue(sequence.id, index, dialogue)}
                  onClear={() => handleClearSequence(sequence.id)}
                  onUpdatePrompt={(prompt) => handleUpdatePrompt(sequence.id, prompt)}
                  onUpdateNarrative={(narrative) => handleUpdateNarrative(sequence.id, narrative)}
                  onCompose={() => handleComposeVideo()}
                  regeneratingIndices={regeneratingIndices}
                  selectedModel={selectedModel}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;