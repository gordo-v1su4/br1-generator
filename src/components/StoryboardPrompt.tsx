import React, { useState } from 'react'
import { PlusCircle, Loader } from 'lucide-react'

interface StoryboardPromptProps {
  onGenerate: (prompt: string) => void
  isLoading: boolean
}

export const StoryboardPrompt: React.FC<StoryboardPromptProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onGenerate(prompt.trim())
      setPrompt('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative bg-slate-800/50 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your sequence of images..."
            disabled={isLoading}
            className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75"
          />
          {isLoading && (
            <div className="absolute bottom-0 left-0 h-0.5 w-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-progress-infinite" />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[180px]"
        >
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <PlusCircle className="w-5 h-5" />
          )}
          {isLoading ? 'Generating...' : 'Generate Sequence'}
        </button>
      </div>
    </form>
  )
}