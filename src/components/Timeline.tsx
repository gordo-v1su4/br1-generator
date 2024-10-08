import React from 'react';
import {Player} from '@remotion/player';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';

interface TimelineProps {
  images: string[];
}

const ImageSequence: React.FC<{src: string}> = ({src}) => {
  return (
    <AbsoluteFill>
      <img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

const TimelineComposition: React.FC<{images: string[]}> = ({images}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const durationPerImage = 5 * fps; // 5 seconds per image

  return (
    <AbsoluteFill style={{backgroundColor: 'white'}}>
      {images.map((image, index) => (
        <Sequence key={index} from={index * durationPerImage} durationInFrames={durationPerImage}>
          <ImageSequence src={image} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const Timeline: React.FC<TimelineProps> = ({images}) => {
  return (
    <Player
      component={TimelineComposition}
      inputProps={{images}}
      durationInFrames={images.length * 5 * 30} // 5 seconds per image at 30 fps
      compositionWidth={1080}
      compositionHeight={608}
      fps={30}
      style={{
        width: '100%',
        height: 'auto',
        aspectRatio: '16/9',
      }}
      controls
    />
  );
};

export default Timeline;