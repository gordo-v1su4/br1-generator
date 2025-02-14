import { fal } from "@fal-ai/client";

type DurationEnum = "5" | "10";
type AspectRatioEnum = "16:9" | "9:16" | "1:1";
type QueueStatus = "IN_PROGRESS" | "COMPLETED" | "IN_QUEUE" | "FAILED";

interface QueueUpdate {
  status: QueueStatus;
  logs?: Array<{ message: string }>;
}

export interface KlingGenerationConfig {
  prompt: string;
  image_url: string;
  duration: DurationEnum;
  aspect_ratio?: AspectRatioEnum;
}

interface KlingFile {
  url: string;
  file_name?: string;
  file_size?: number;
  content_type?: string;
}

export interface KlingGenerationResult {
  video: KlingFile;
}

export const generateKlingVideo = async (
  prompt: string,
  imageUrl: string,
  duration: number
): Promise<KlingGenerationResult> => {
  try {
    const result = await fal.subscribe("fal-ai/kling-video/v1.6/pro/image-to-video", {
      input: {
        prompt,
        image_url: imageUrl,
        duration: duration.toString() as DurationEnum,
        aspect_ratio: "9:16" // Fixed for our use case
      },
      logs: true,
      onQueueUpdate: (update: QueueUpdate) => {
        console.log("Queue update:", update);
        if (update.status === "IN_PROGRESS" && update.logs) {
          update.logs.map(log => log.message).forEach(console.log);
        }
        if (update.status === "FAILED") {
          console.error("Generation failed:", update);
        }
      },
    });

    console.log("Generation result:", result);
    
    if (!result.data?.video?.url) {
      throw new Error("No video URL in response");
    }

    return result.data;
  } catch (error) {
    console.error("Error in generateKlingVideo:", error);
    throw error;
  }
};
