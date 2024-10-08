import React, { useState } from 'react'
import { PlusCircle, Loader } from 'lucide-react'

interface StoryboardPromptProps {
  onGenerate: (prompt: string) => void
  isLoading: boolean
}

const StoryboardPrompt: React.FC<StoryboardPromptProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onGenerate(prompt.trim())
      setPrompt('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your storyboard sequence..."
        className="flex-grow px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader className="mr-2 animate-spin" />
        ) : (
          <PlusCircle className="mr-2" />
        )}
        {isLoading ? 'Generating...' : 'Generate Sequence'}
      </button>
    </form>
  )
}

export default StoryboardPrompt