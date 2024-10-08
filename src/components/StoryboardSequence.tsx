import React from 'react'
import { Trash2 } from 'lucide-react'

interface StoryboardSequenceProps {
  images: string[]
  onDelete: () => void
}

const StoryboardSequence: React.FC<StoryboardSequenceProps> = ({ images, onDelete }) => {
  return (
    <div className="relative">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((src, index) => (
          <div key={index} className="relative">
            <img src={src} alt={`Storyboard ${index + 1}`} className="w-full h-auto rounded-md shadow-md" />
            <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white px-2 py-1 rounded-br-md">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onDelete}
        className="absolute -top-4 right-0 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
      >
        <Trash2 size={20} />
      </button>
    </div>
  )
}

export default StoryboardSequence