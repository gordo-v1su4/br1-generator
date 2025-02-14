import { useState } from 'react';
import { StoryboardPrompt } from './components/StoryboardPrompt';
import { StoryboardSequence } from './components/StoryboardSequence';
import { ModelSelector } from './components/ModelSelector';
import { generateImages, generateSingleImage, ModelType } from './utils/falAi';
import { generateKlingVideo } from './utils/klingVideo';
import { composeVideoWithAudio } from './utils/ffmpegCompose';

interface Sequence {
  id: string;
  prompt: string;
  images: string[];
  audioUrl?: string;
  videoUrls?: string[];
  videoDurations?: (5 | 10)[];
  composedVideoUrl?: string;
}

function App() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>('realistic-vision');
  const [regeneratingIndices, setRegeneratingIndices] = useState<Set<number>>(new Set());

  const handleGenerateSequence = async (prompt: string) => {
    setIsLoading(true);
    try {
      const images = await generateImages(prompt, selectedModel);
      const newSequence: Sequence = {
        id: window.crypto.randomUUID(),
        prompt,
        images,
        audioUrl: ''
      };
      setSequences([newSequence, ...sequences]);
    } catch (error) {
      console.error('Error generating sequence:', error);
      alert('Failed to generate images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateImage = async (sequenceId: string, imageIndex: number) => {
    setRegeneratingIndices(prev => new Set([...prev, imageIndex]));
    
    try {
      const sequence = sequences.find(seq => seq.id === sequenceId);
      if (!sequence) return;
      
      const newImage = await generateSingleImage(sequence.prompt, selectedModel);
      setSequences(prevSequences => {
        return prevSequences.map(seq => {
          if (seq.id === sequenceId) {
            const newImages = [...seq.images];
            newImages[imageIndex] = newImage;
            return { ...seq, images: newImages };
          }
          return seq;
        });
      });
    } catch (error) {
      console.error('Error regenerating image:', error);
    } finally {
      setRegeneratingIndices(prev => {
        const next = new Set(prev);
        next.delete(imageIndex);
        return next;
      });
    }
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

  const handleUpdateAudio = (sequenceId: string, audioUrl: string) => {
    setSequences(prevSequences =>
      prevSequences.map(seq =>
        seq.id === sequenceId
          ? { ...seq, audioUrl }
          : seq
      )
    );
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

  const handleComposeVideo = async (sequenceId: string): Promise<string | undefined> => {
    try {
      const sequence = sequences.find(seq => seq.id === sequenceId);
      if (!sequence) throw new Error('Sequence not found');
      if (!sequence.videoUrls) throw new Error('No video to compose');
      if (!sequence.audioUrl) throw new Error('No audio to compose with');
      if (!sequence.videoDurations) throw new Error('No video duration specified');

      // Get the first valid video URL and its duration
      const videoIndex = sequence.videoUrls.findIndex(url => url !== null);
      if (videoIndex === -1) throw new Error('No valid video found');

      const videoUrl = sequence.videoUrls[videoIndex];
      const duration = sequence.videoDurations[videoIndex];

      // Compose video with audio
      const composedVideoUrl = await composeVideoWithAudio({
        videoUrl,
        audioUrl: sequence.audioUrl,
        duration
      });

      // Update the sequence with the composed video URL
      setSequences(prevSequences =>
        prevSequences.map(seq =>
          seq.id === sequenceId
            ? { ...seq, composedVideoUrl }
            : seq
        )
      );

      // Create a video element to replace the image
      const videoElement = document.createElement('video');
      videoElement.src = composedVideoUrl;
      videoElement.autoplay = true;
      videoElement.loop = true;
      videoElement.muted = true;
      videoElement.className = 'w-full h-full object-cover rounded-lg';

      // Replace the image with the video
      const imageElement = document.querySelector(`[data-frame-index="${videoIndex}"] img`);
      if (imageElement && imageElement.parentNode) {
        imageElement.parentNode.replaceChild(videoElement, imageElement);
      }

      return composedVideoUrl;
    } catch (error) {
      console.error('Error composing video:', error);
      alert('Failed to compose video. Please try again.');
      return undefined;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300">
      <div className="max-w-[1400px] mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 mt-[5px] tracking-wide bg-[length:200%_auto] bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-transparent bg-clip-text animate-gradient">BRAINROT SEQUENCE GENERATOR</h1>
        <div className="space-y-4">
          <ModelSelector selectedModel={selectedModel} onModelSelect={setSelectedModel} />
          <StoryboardPrompt onGenerate={handleGenerateSequence} isLoading={isLoading} />
          <div className="space-y-4">
            {sequences.map((sequence) => (
              <StoryboardSequence
                key={sequence.id}
                sequence={sequence}
                onRegenerateImage={(imageIndex) => handleRegenerateImage(sequence.id, imageIndex)}
                onGenerateKling={(index, duration) => handleGenerateKling(sequence.id, index, duration)}
                onUpdateAudio={(audioUrl) => handleUpdateAudio(sequence.id, audioUrl)}
                onClear={() => handleClearSequence(sequence.id)}
                onUpdatePrompt={(prompt) => handleUpdatePrompt(sequence.id, prompt)}
                onComposeVideo={() => handleComposeVideo(sequence.id)}
                regeneratingIndices={regeneratingIndices}
                selectedModel={selectedModel}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;