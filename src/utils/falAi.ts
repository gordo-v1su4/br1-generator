import { fal } from "@fal-ai/client";

// Initialize fal client with API key
fal.config({
  credentials: import.meta.env.VITE_FAL_AI_API_KEY,
});

// Common types
export interface ImageSize {
  width: number;
  height: number;
}

export interface GenerationResult {
  url: string;
  seed?: number;
}

// Base configuration interface
export interface BaseModelConfig {
  prompt: string;
  image_size: ImageSize;
  num_images: number;
  negative_prompt?: string;
  seed?: number;
}

// Realistic Vision specific configuration
export interface RealisticVisionConfig extends BaseModelConfig {
  loras: Array<{
    path: string;
    scale: number;
  }>;
  guidance_scale: number;
  num_inference_steps: number;
  enable_safety_checker: boolean;
  safety_checker_version: string;
}

// Default configurations
const defaultRealisticVisionConfig: Partial<RealisticVisionConfig> = {
  loras: [{
    path: "https://civitai.com/api/download/models/209105?type=Model&format=SafeTensor",
    scale: 0.6
  }],
  image_size: {
    width: 720,
    height: 1280
  },
  num_images: 4,
  guidance_scale: 5,
  num_inference_steps: 35,
  enable_safety_checker: true,
  safety_checker_version: "v1",
  negative_prompt: "(worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bw, bad photo, bad photography, bad art:1.4), (watermark, signature, text font, username, error, logo, words, letters, digits, autograph, trademark, name:1.2), (blur, blurry, grainy), morbid, ugly, asymmetrical, mutated malformed, mutilated, poorly lit, bad shadow, draft, cropped, out of frame, cut off, censored, jpeg artifacts, out of focus, glitch, duplicate, (airbrushed, cartoon, anime, semi-realistic, cgi, render, blender, digital art, manga, amateur:1.3), (3D ,3D Game, 3D Game Scene, 3D Character:1.1), (bad hands, bad anatomy, bad body, bad face, bad teeth, bad arms, bad legs, deformities:1.3)"
};

// Realistic Vision model generator
export async function generateRealisticVisionImages(
  prompt: string,
  customConfig: Partial<RealisticVisionConfig> = {}
): Promise<string[]> {
  try {
    const config: RealisticVisionConfig = {
      ...defaultRealisticVisionConfig,
      ...customConfig,
      prompt,
    } as RealisticVisionConfig;

    const { data } = await fal.subscribe("fal-ai/realistic-vision", {
      input: config,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(`Generation in progress...`);
          update.logs?.forEach(log => console.log(log.message));
        }
      },
    });

    if (!data.images) {
      throw new Error('No images were generated');
    }

    return data.images.map((image: any) => image.url);
  } catch (error) {
    console.error('Error generating images:', error);
    throw error;
  }
}

// Export the main function with the current implementation
export const generateImages = generateRealisticVisionImages;