import React from 'react'
import { Trash2 } from 'lucide-react'

interface StoryboardImageProps {
  src: string
  onDelete: () => void
}

const StoryboardImage: React.FC<StoryboardImageProps> = ({ src, onDelete }) => {
  return (
    <div className="relative group">
      <img src={src} alt="Storyboard" className="w-full h-auto rounded-md shadow-md" />
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}

export default StoryboardImage