import React, { useState } from 'react'
import { PlusCircle, Loader } from 'lucide-react'
import { generateNarrative } from '../utils/narrativeGenerator'

interface StoryboardPromptProps {
  onGenerate: (prompt: string, narrative: string, dialogues: string[], imagePrompts: string[]) => void
  isLoading: boolean
}

export const StoryboardPrompt: React.FC<StoryboardPromptProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      try {
        const result = await generateNarrative(prompt.trim());
        onGenerate(prompt.trim(), result.narrative, result.dialogues, result.imagePrompts);
        setPrompt('');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your scene..."
            className="w-full h-12 px-4 py-2 text-gray-200 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="h-12 px-8 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              <span>Generate</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}