import type { Video, Category, Creator, CatalogQuery } from '@/types';
export interface VideoCatalogProvider {
  getVideos(query?: CatalogQuery, signal?: AbortSignal): Promise<Video[]>;
  getVideo(id: string): Promise<Video | null>;
  getCategories(): Promise<Category[]>;
  getCreators(): Promise<Creator[]>;
  getCreator(id: string): Promise<Creator | null>;
}
