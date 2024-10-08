import React from 'react'
import { Upload } from 'lucide-react'

interface VideoUploaderProps {
  onUpload: (file: File) => void
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onUpload }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  return (
    <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
      <Upload className="w-12 h-12 text-gray-400 mb-2" />
      <p className="text-gray-500 mb-2">Drag and drop your video here</p>
      <label className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        Select Video
      </label>
    </div>
  )
}

export default VideoUploader