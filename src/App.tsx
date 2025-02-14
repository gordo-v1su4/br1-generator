import React, { useState } from 'react';
import { StoryboardPrompt } from './components/StoryboardPrompt';
import { StoryboardSequence } from './components/StoryboardSequence';
import { ModelSelector } from './components/ModelSelector';
import { generateImages, generateSingleImage, ModelType } from './utils/falAi';
import { generateKlingVideo } from './utils/klingVideo';

interface Sequence {
  id: string;
  prompt: string;
  images: string[];
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
        id: Date.now().toString(),
        prompt,
        images,
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
    // Add image index to regenerating set
    setRegeneratingIndices(prev => new Set(prev).add(index));

    try {
      const sequence = sequences.find(seq => seq.id === sequenceId);
      if (!sequence) throw new Error('Sequence not found');

      const imageUrl = sequence.images[index];
      if (!imageUrl) throw new Error('Image not found');

      const result = await generateKlingVideo({
        prompt: sequence.prompt,
        imageData: imageUrl,
        duration: duration.toString() as "5" | "10", // Duration comes directly from button click (5 or 10)
      }, (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Kling generation progress:", update);
        }
      });

      // Replace the image with the video URL in the sequence
      setSequences(prevSequences => {
        return prevSequences.map(seq => {
          if (seq.id === sequenceId) {
            const newImages = [...seq.images];
            newImages[index] = result.video.url;
            return { ...seq, images: newImages };
          }
          return seq;
        });
      });
      
    } catch (error) {
      console.error('Error generating Kling:', error);
    } finally {
      // Remove image index from regenerating set
      setRegeneratingIndices(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
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
                onClear={() => handleClearSequence(sequence.id)}
                onUpdatePrompt={(prompt) => handleUpdatePrompt(sequence.id, prompt)}
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