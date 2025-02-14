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
  imageData: string | Blob;
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

const uploadImage = async (imageData: string | Blob): Promise<string> => {
  try {
    // If imageData is a base64 string, convert it to a blob
    const blob = typeof imageData === 'string' 
      ? await fetch(imageData).then(r => r.blob())
      : imageData;

    // Create a File object from the blob
    const file = new File([blob], "source_image.png", { type: "image/png" });
    
    // Upload to FAL storage
    const url = await fal.storage.upload(file);
    console.log("Image uploaded successfully:", url);
    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateKlingVideo = async (
  config: KlingGenerationConfig,
  onQueueUpdate?: (update: QueueUpdate) => void
): Promise<KlingGenerationResult> => {
  try {
    // First upload the image
    const image_url = await uploadImage(config.imageData);

    const result = await fal.subscribe("fal-ai/kling-video/v1.6/pro/image-to-video", {
      input: {
        prompt: config.prompt,
        image_url: image_url,
        duration: config.duration,
        aspect_ratio: config.aspect_ratio || "16:9"
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
        onQueueUpdate?.(update);
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
