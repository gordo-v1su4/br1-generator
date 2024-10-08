import * as fal from "@fal-ai/serverless-client";

// Initialize fal client with API key
fal.config({
  credentials: import.meta.env.VITE_FAL_AI_API_KEY,
});

export async function generateImages(prompt: string): Promise<string[]> {
  try {
    const result = await fal.subscribe("fal-ai/realistic-vision", {
      input: {
        loras: [{
          path: "https://civitai.com/api/download/models/209105?type=Model&format=SafeTensor",
          scale: 0.6
        }],
        format: "png",
        prompt: prompt,
        embeddings: [],
        image_size: {
          width: 1080,
          height: 608
        },
        model_name: "SG161222/RealVisXL_V4.0",
        num_images: 8,
        guidance_scale: 5,
        negative_prompt: "(worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bw, bad photo, bad photography, bad art:1.4), (watermark, signature, text font, username, error, logo, words, letters, digits, autograph, trademark, name:1.2), (blur, blurry, grainy), morbid, ugly, asymmetrical, mutated malformed, mutilated, poorly lit, bad shadow, draft, cropped, out of frame, cut off, censored, jpeg artifacts, out of focus, glitch, duplicate, (airbrushed, cartoon, anime, semi-realistic, cgi, render, blender, digital art, manga, amateur:1.3), (3D ,3D Game, 3D Game Scene, 3D Character:1.1), (bad hands, bad anatomy, bad body, bad face, bad teeth, bad arms, bad legs, deformities:1.3)",
        num_inference_steps: 35,
        enable_safety_checker: true,
        safety_checker_version: "v1"
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    // Assuming the result contains an array of image URLs
    return result.images.map((image: any) => image.url);
  } catch (error) {
    console.error('Error generating images:', error);
    throw error;
  }
}