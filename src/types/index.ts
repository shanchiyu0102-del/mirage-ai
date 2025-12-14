export interface Shot {
  scene_number: number;
  description: string;
}

export interface StoryRequest {
  story_outline: string;
  video_ratio: '16:9' | '9:16';
  resolution: '480P' | '720P';
  style: 'cyberpunk' | 'pixar' | 'horror' | 'realistic' | 'chinese' | 'anime';
}

export interface AIResponse {
  shots: Shot[];
  character_prompt: string;
}

export interface GenerationTask {
  task_id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'UNKNOWN';
  result?: {
    url?: string;
    results?: Array<{ url: string }>;
  };
}

export type Page = 'story' | 'edit' | 'preview' | 'final';