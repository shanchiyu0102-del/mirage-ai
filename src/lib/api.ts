import { Shot, AIResponse, GenerationTask, StoryRequest } from '@/types';

export async function generateShotsAndCharacter(story: string): Promise<AIResponse> {
  const response = await fetch('/api/generate-shots', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ story })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate shots and character');
  }

  return response.json();
}

export async function generateCharacterImage(prompt: string): Promise<string> {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate character image');
  }

  const data = await response.json();
  return data.imageUrl;
}

export async function generateVideo(prompt: string, imageUrl: string, resolution: string = '480P'): Promise<string> {
  console.log('generateVideo called with:', { prompt, imageUrl, resolution });

  const response = await fetch('/api/generate-video', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, imageUrl, resolution })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('generateVideo failed:', response.status, errorText);
    throw new Error(errorText || 'Failed to generate video');
  }

  const data = await response.json();
  console.log('generateVideo response:', data);
  return data.videoUrl;
}

export async function mergeVideos(videoUrls: string[], resolution: string = '480P'): Promise<string> {
  console.log('mergeVideos called with:', { videoUrls, resolution });

  const response = await fetch('/api/merge-videos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoUrls, resolution })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('mergeVideos failed:', response.status, errorText);
    throw new Error(errorText || 'Failed to merge videos');
  }

  const data = await response.json();
  console.log('mergeVideos response:', data);
  return data.mergedVideoUrl;
}