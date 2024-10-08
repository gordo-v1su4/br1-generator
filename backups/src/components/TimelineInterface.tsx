import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { AbsoluteFill, Sequence } from 'remotion';
import { Play, SkipBack, SkipForward, Video, Sliders, Image, Crop, Plus, ChevronLeft, Upload, Share, Download, Scissors, Type, Music, Eye, EyeOff, Undo, Redo, Trash } from 'lucide-react';

interface TimelineInterfaceProps {
  images: string[];
}

const TimelineComposition: React.FC<{ images: string[] }> = ({ images }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {images.map((image, index) => (
        <Sequence key={index} from={index * 150} durationInFrames={150}>
          <AbsoluteFill>
            <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const TimelineInterface: React.FC<TimelineInterfaceProps> = ({ images }) => {
  const [currentTime, setCurrentTime] = useState(0);

  return (
    <div className="bg-[#1e1e1e] text-gray-300 min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-[#2d2d2d] p-2 flex justify-between items-center">
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
        <div className="w-64 bg-[#252525] p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Media</h2>
          <div className="grid grid-cols-2 gap-2">
            {images.map((image, index) => (
              <img key={index} src={image} className="w-full h-auto rounded" alt={`Thumbnail ${index + 1}`} />
            ))}
          </div>
          <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center w-full justify-center">
            <Plus className="mr-2" size={16} />
            Add Media
          </button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <Player
              component={TimelineComposition}
              inputProps={{ images }}
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
          <div className="h-64 bg-[#2d2d2d] p-2">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm">{formatTime(currentTime)} / {formatTime(images.length * 5)}</div>
              <div className="flex space-x-2">
                <button className="bg-[#3a3a3a] hover:bg-[#4a4a4a] p-1 rounded"><SkipBack size={16} /></button>
                <button className="bg-blue-600 hover:bg-blue-700 p-1 rounded"><Play size={16} /></button>
                <button className="bg-[#3a3a3a] hover:bg-[#4a4a4a] p-1 rounded"><SkipForward size={16} /></button>
              </div>
            </div>
            <div className="relative h-40 bg-[#1e1e1e] rounded overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-blue-600 w-0.5"></div>
              <div className="flex">
                {images.map((image, index) => (
                  <div key={index} className="flex-shrink-0 w-24 h-20 relative group">
                    <img src={image} className="w-full h-full object-cover" alt={`Timeline thumbnail ${index + 1}`} />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Scissors className="w-4 h-4 text-white cursor-pointer" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#3a3a3a] flex items-center px-2 space-x-2">
                <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center text-xs">B&W</div>
                <div className="flex-grow h-4 bg-purple-500 rounded"></div>
              </div>
            </div>
          </div>

          {/* Bottom toolbar */}
          <div className="bg-[#2d2d2d] p-2 flex justify-between items-center">
            <div className="flex space-x-2">
              <button className="bg-[#3a3a3a] hover:bg-[#4a4a4a] p-1 rounded"><Undo size={16} /></button>
              <button className="bg-[#3a3a3a] hover:bg-[#4a4a4a] p-1 rounded"><Redo size={16} /></button>
            </div>
            <div className="flex space-x-2">
              <button className="bg-[#3a3a3a] hover:bg-[#4a4a4a] p-1 rounded"><Scissors size={16} /></button>
              <button className="bg-[#3a3a3a] hover:bg-[#4a4a4a] p-1 rounded"><Type size={16} /></button>
              <button className="bg-[#3a3a3a] hover:bg-[#4a4a4a] p-1 rounded"><Music size={16} /></button>
              <button className="bg-[#3a3a3a] hover:bg-[#4a4a4a] p-1 rounded"><Eye size={16} /></button>
              <button className="bg-[#3a3a3a] hover:bg-[#4a4a4a] p-1 rounded"><Trash size={16} /></button>
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