import React, { useState } from 'react'
import { PlusCircle, Loader, Loader2 } from 'lucide-react'
import { generateNarrative } from '../utils/narrativeGenerator'

interface StoryboardPromptProps {
  onGenerate: () => void
  isLoading: boolean
  isGenerating: boolean
  prompt: string
  setPrompt: (prompt: string) => void
}

export const StoryboardPrompt: React.FC<StoryboardPromptProps> = ({ onGenerate, isLoading, isGenerating, prompt, setPrompt }) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !isGenerating) {
      onGenerate();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your scene..."
            className="w-full h-12 px-4 py-2 text-gray-200 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none overflow-x-hidden"
            disabled={isLoading || isGenerating}
          />
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-progress-bar"></div>
              </div>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || isGenerating || !prompt.trim()}
          className="h-12 px-8 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading...</span>
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