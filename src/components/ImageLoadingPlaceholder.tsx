import React from 'react';

interface ImageLoadingPlaceholderProps {
  count?: number;
}

const ImageLoadingPlaceholder: React.FC<ImageLoadingPlaceholderProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative bg-gray-800 rounded-lg overflow-hidden"
          style={{ aspectRatio: '9/16' }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0">
            <div className="animate-pulse">
              <div className="h-full w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 background-animate"></div>
            </div>
          </div>
          
          {/* Loading spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          
          {/* Progress dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            <div className="animate-bounce delay-0 h-2 w-2 bg-blue-500 rounded-full"></div>
            <div className="animate-bounce delay-150 h-2 w-2 bg-blue-500 rounded-full"></div>
            <div className="animate-bounce delay-300 h-2 w-2 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageLoadingPlaceholder;
