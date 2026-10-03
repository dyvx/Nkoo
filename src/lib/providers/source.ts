import type { Video, VideoSource } from '@/types';
export interface VideoSourceProvider {
  getSource(video: Video, signal?: AbortSignal): Promise<VideoSource>;
}
