import React, { useState } from 'react'
import { PlusCircle, Loader } from 'lucide-react'
import StoryboardPrompt from './components/StoryboardPrompt'
import StoryboardSequence from './components/StoryboardSequence'
import TimelineInterface from './components/TimelineInterface'
import { generateImages } from './utils/falAi'

function App() {
  const [sequences, setSequences] = useState<string[][]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

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

  const handleSendToTimeline = () => {
    setShowTimeline(true)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300">
      {!showTimeline ? (
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-8">AI Storyboard Sequence Generator</h1>
          <div className="w-full max-w-6xl bg-gray-800 rounded-lg shadow-md p-6">
            <StoryboardPrompt onGenerate={handleGenerateSequence} isLoading={isLoading} />
            <div className="mt-8 space-y-12">
              {sequences.map((sequence, index) => (
                <StoryboardSequence
                  key={index}
                  images={sequence}
                  onDelete={() => handleDeleteSequence(index)}
                />
              ))}
            </div>
            {sequences.length > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleSendToTimeline}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                >
                  <PlusCircle className="mr-2" />
                  Send to Timeline
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <TimelineInterface images={sequences.flat()} />
      )}
    </div>
  )
}

export default App