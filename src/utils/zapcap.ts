import { ZapCap } from "zapcap";

const zapcap = new ZapCap({
  apiKey: import.meta.env.VITE_ZAPCAP_API_KEY,
});

export interface CaptionTaskResult {
  taskId: string;
  videoUrl: string;
}

async function fetchVideoBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.statusText}`);
  }
  return await response.blob();
}

export async function addCaptionsToVideo(videoUrl: string): Promise<CaptionTaskResult> {
  try {
    // First fetch the video as a blob
    const videoBlob = await fetchVideoBlob(videoUrl);
    
    // Create a File object from the blob
    const videoFile = new File([videoBlob], 'video.mp4', { type: 'video/mp4' });

    // Upload the video
    const { data: { id: videoId } } = await zapcap.uploadVideo(videoFile);

    // Get the first available template (assuming it's a caption template)
    const { data: templates } = await zapcap.getTemplates();
    const templateId = templates[0].id;

    // Create a video task
    const { data: { taskId } } = await zapcap.createVideoTask(videoId, templateId);

    // Poll for render completion
    const stream = await zapcap.helpers.pollForRender(videoId, taskId, {
      retryFrequencyMs: 5000, // Poll every 5 seconds
      timeoutMs: 120000, // Timeout after 120 seconds
    });

    // Get the URL of the rendered video
    const { data: { url: renderedVideoUrl } } = await zapcap.getVideo(videoId);

    return {
      taskId,
      videoUrl: renderedVideoUrl
    };
  } catch (error) {
    console.error('Error adding captions:', error);
    throw error;
  }
}

export async function checkCaptionStatus(videoId: string, taskId: string): Promise<boolean> {
  try {
    const { data: { status } } = await zapcap.getVideoTask(videoId, taskId);
    return status === 'completed';
  } catch (error) {
    console.error('Error checking caption status:', error);
    return false;
  }
}
