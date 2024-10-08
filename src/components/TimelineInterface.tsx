import React, { useState, useRef, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { AbsoluteFill, Sequence } from 'remotion';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, Upload, Share, Download, Scissors, Type, Music, Eye, EyeOff, Undo, Redo, Trash, Video, Image as ImageIcon } from 'lucide-react';

interface TimelineInterfaceProps {
  images: string[];
}

const TimelineComposition: React.FC<{ images: string[]; videos: string[]; currentTime: number }> = ({ images, videos, currentTime }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {images.map((image, index) => (
        <Sequence key={`image-${index}`} from={index * 150} durationInFrames={150}>
          <AbsoluteFill>
            <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </AbsoluteFill>
        </Sequence>
      ))}
      {videos.map((video, index) => (
        <Sequence key={`video-${index}`} from={index * 150} durationInFrames={150}>
          <AbsoluteFill>
            <video src={video} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const TimelineInterface: React.FC<TimelineInterfaceProps> = ({ images }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videos, setVideos] = useState<string[]>([]);
  const playerRef = useRef<PlayerRef>(null);

  const generateVideo = async (imageUrl: string, index: number) => {
    // TODO: Implement video generation using klingai.com API
    console.log(`Generating video for image at index ${index}`);
    // Placeholder: Set a dummy video URL
    const newVideos = [...videos];
    newVideos[index] = 'https://example.com/generated-video.mp4';
    setVideos(newVideos);
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime((prevTime) => prevTime + 1/30);
      }, 1000/30);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  };

  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-gray-800 p-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </div>
        <div className="flex items-center space-x-4">
          <Upload className="w-5 h-5" />
          <span className="text-sm">Uploaded</span>
          <span className="text-sm">1080p • 25 FPS</span>
        </div>
        <div className="flex items-center space-x-4">
          <Share className="w-5 h-5" />
          <Download className="w-5 h-5" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Media</h2>
          <div className="grid grid-cols-2 gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img src={image} className="w-full h-auto rounded" alt={`Thumbnail ${index + 1}`} />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => generateVideo(image, index)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded"
                  >
                    <Video size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center w-full justify-center">
            <ImageIcon className="mr-2" size={16} />
            Add Media
          </button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col bg-gray-900">
          <div className="flex-1 p-4">
            <Player
              ref={playerRef}
              component={TimelineComposition}
              inputProps={{ images, videos, currentTime }}
              durationInFrames={images.length * 150}
              compositionWidth={1080}
              compositionHeight={608}
              fps={30}
              style={{
                width: '100%',
                height: 'calc(100% - 40px)',
              }}
              controls
            />
          </div>

          {/* Timeline */}
          <div className="h-64 bg-gray-800 p-2">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm">{formatTime(currentTime)} / {formatTime(images.length * 5)}</div>
              <div className="flex space-x-2">
                <button className="bg-gray-700 hover:bg-gray-600 p-1 rounded" onClick={() => setCurrentTime(0)}>
                  <SkipBack size={16} />
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 p-1 rounded" onClick={handlePlayPause}>
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 p-1 rounded" onClick={() => setCurrentTime(images.length * 5)}>
                  <SkipForward size={16} />
                </button>
              </div>
            </div>
            <div className="relative h-40 bg-gray-900 rounded overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-blue-600 w-0.5" style={{ left: `${(currentTime / (images.length * 5)) * 100}%` }}></div>
              <div className="flex flex-col">
                <div className="flex">
                  {images.map((image, index) => (
                    <div key={`image-${index}`} className="flex-shrink-0 w-24 h-20 relative group">
                      <img src={image} className="w-full h-full object-cover" alt={`Timeline thumbnail ${index + 1}`} />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Scissors className="w-4 h-4 text-white cursor-pointer" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex mt-1">
                  {videos.map((video, index) => (
                    <div key={`video-${index}`} className="flex-shrink-0 w-24 h-20 relative group bg-gray-700 flex items-center justify-center">
                      {video ? (
                        <video src={video} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-500 text-xs">Generating...</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom toolbar */}
          <div className="bg-gray-800 p-2 flex justify-between items-center">
            <div className="flex space-x-2">
              <button className="bg-gray-700 hover:bg-gray-600 p-1 rounded"><Undo size={16} /></button>
              <button className="bg-gray-700 hover:bg-gray-600 p-1 rounded"><Redo size={16} /></button>
            </div>
            <div className="flex space-x-2">
              <button className="bg-gray-700 hover:bg-gray-600 p-1 rounded"><Scissors size={16} /></button>
              <button className="bg-gray-700 hover:bg-gray-600 p-1 rounded"><Type size={16} /></button>
              <button className="bg-gray-700 hover:bg-gray-600 p-1 rounded"><Music size={16} /></button>
              <button className="bg-gray-700 hover:bg-gray-600 p-1 rounded"><Eye size={16} /></button>
              <button className="bg-gray-700 hover:bg-gray-600 p-1 rounded"><Trash size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default TimelineInterface;