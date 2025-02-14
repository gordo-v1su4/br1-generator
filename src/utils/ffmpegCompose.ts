import { fal } from "@fal-ai/client";

interface ComposeInput {
  videoUrl: string | Blob | File;
  audioUrl: string | Blob | File;
  duration: 5 | 10;
}

interface Keyframe {
  timestamp: number;
  duration: number;
  url: string | Blob | File;
}

interface Track {
  id: string;
  type: 'video' | 'audio';
  keyframes: Keyframe[];
}

interface ComposeRequestInput {
  tracks: Track[];
}

interface Resolution {
  aspect_ratio: string;
  width: number;
  height: number;
}

interface VideoFormat {
  container: string;
  video_codec: string;
  profile: string;
  level: number;
  pixel_format: string;
  bitrate: number;
}

interface AudioTrack {
  codec: string;
  channels: number;
  sample_rate: number;
  bitrate: number;
}

interface Video {
  media_type: 'video';
  url: string;
  content_type: string;
  file_name: string;
  file_size: number;
  duration: number;
  bitrate: number;
  codec: string;
  container: string;
  fps: number;
  frame_count: number;
  timebase: string;
  resolution: Resolution;
  format: VideoFormat;
  audio?: AudioTrack;
  start_frame_url: string;
  end_frame_url: string;
}

interface FfmpegComposeOutput {
  video_url: string;
  thumbnail_url: string;
  video?: Video;
}

export const composeVideoWithAudio = async (input: ComposeInput): Promise<string> => {
  try {
    const durationMs = input.duration * 1000;

    // First submit the request
    const { request_id } = await fal.queue.submit("fal-ai/ffmpeg-api/compose", {
      input: {
        tracks: [
          {
            id: "video",
            type: "video",
            keyframes: [
              {
                timestamp: 0,
                duration: durationMs,
                url: input.videoUrl
              }
            ]
          },
          {
            id: "audio",
            type: "audio",
            keyframes: [
              {
                timestamp: 0,
                duration: durationMs,
                url: input.audioUrl
              }
            ]
          }
        ]
      }
    });

    // Then get the result
    const result = await fal.queue.result<FfmpegComposeOutput>("fal-ai/ffmpeg-api/compose", {
      requestId: request_id
    });

    if (!result.data.video_url) {
      throw new Error('No video URL in FFMPEG composition result');
    }

    return result.data.video_url;
  } catch (error) {
    console.error("Error in FFMPEG composition:", error);
    throw error;
  }
};
