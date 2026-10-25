export type WorkflowStep = 1 | 2 | 3;

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';

export type VideoModel = 
  | 'Omni Flash' 
  | 'Veo 3.1 - Lite' 
  | 'Veo 3.1 - Fast' 
  | 'Veo 3.1 - Quality';

export interface VoiceOption {
  id: string;
  name: string;
  region: 'Bắc' | 'Trung' | 'Nam';
  gender: 'Nam' | 'Nữ';
  description: string;
  voiceCode?: string;
}

export interface ScriptFormConfig {
  gradeLevel: string;
  subject: string;
  lessonTitle: string;
  rawContent: string;
  voice: string;
  sceneCount: number;
  durationPerScene: number; // 5 - 12 seconds
  aspectRatio: AspectRatio;
  videoModel: VideoModel;
}

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  visualDescription: string;
  dialogue: string;
  imagePrompt: string;
  videoPrompt: string;
  duration: number; // seconds
  imageUrl?: string;
  imageStatus: 'idle' | 'generating' | 'completed' | 'failed';
  imageError?: string;
  videoUrl?: string;
  videoStatus: 'idle' | 'generating' | 'completed' | 'failed';
  videoProgress?: number;
  videoError?: string;
  isShortening?: boolean;
}

export interface ScriptGenerationResponse {
  lessonTitle: string;
  overview: string;
  scenes: {
    sceneNumber: number;
    title: string;
    visualDescription: string;
    dialogue: string;
    imagePrompt: string;
    videoPrompt: string;
    duration?: number;
  }[];
}

export interface FlowMediaSelectOptions {
  accept?: string;
  multiple?: boolean;
  type?: 'image' | 'video' | 'audio';
}

export interface FlowGenerateImageOptions {
  prompt: string;
  aspectRatio?: AspectRatio;
  model?: string; // 'Nano Banana Pro' | 'gemini-3-pro-image'
  seed?: number;
  subject?: string;
  lessonTitle?: string;
}

export interface FlowGenerateVideoOptions {
  prompt: string;
  firstFrameImageMediaId?: string;
  dialogue: string;
  model: VideoModel;
  duration: number;
  aspectRatio: AspectRatio;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}
