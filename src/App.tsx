import React, { useState } from 'react'
import StoryboardPrompt from './components/StoryboardPrompt'
import StoryboardSequence from './components/StoryboardSequence'
import ImageLoadingPlaceholder from './components/ImageLoadingPlaceholder'
import { generateImages } from './utils/falAi'

function App() {
  const [sequences, setSequences] = useState<string[][]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateSequence = async (prompt: string) => {
    setIsLoading(true)
    try {
      const newSequence = await generateImages(prompt)
      setSequences([...sequences, newSequence])
    } catch (error) {
      console.error('Error generating images:', error)
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSequence = (index: number) => {
    const newSequences = sequences.filter((_, i) => i !== index)
    setSequences(newSequences)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300">
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8">AI Storyboard Sequence Generator</h1>
        <div className="w-full max-w-6xl bg-gray-800 rounded-lg shadow-md p-6">
          <StoryboardPrompt onGenerate={handleGenerateSequence} isLoading={isLoading} />
          <div className="mt-8 space-y-12">
            {isLoading && <ImageLoadingPlaceholder />}
            {sequences.map((sequence, index) => (
              <StoryboardSequence
                key={index}
                images={sequence}
                onDelete={() => handleDeleteSequence(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App