import React from 'react'

interface VideoPlayerProps {
  src: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  return (
    <video
      src={src}
      controls
      className="w-full h-64 bg-black rounded-lg"
    >
      Your browser does not support the video tag.
    </video>
  )
}

export default VideoPlayer