import { mockVideos } from '@/data/mockVideos';
import { mockCategories } from '@/data/mockCategories';
import { mockCreators } from '@/data/mockCreators';
import { APP_CONFIG } from '@/lib/config';
import type { VideoCatalogProvider } from './catalog';
import type { VideoSourceProvider } from './source';
import type { CatalogQuery, Video, VideoSource } from '@/types';
export class MockCatalogProvider implements VideoCatalogProvider {
  async getVideos(query: CatalogQuery = {}, signal?: AbortSignal): Promise<Video[]> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    let result = [...mockVideos];
    if (query.category && query.category !== 'all')
      result = result.filter((v) => v.categoryId === query.category);
    if (query.creator) result = result.filter((v) => v.creatorId === query.creator);
    const tokens = query.query?.toLowerCase().trim().split(/\s+/).filter(Boolean) || [];
    if (tokens.length)
      result = result.filter((v) => {
        const creator = mockCreators.find((c) => c.id === v.creatorId);
        const category = mockCategories.find((c) => c.id === v.categoryId);
        const text = [v.title, v.description, ...v.tags, creator?.name, category?.name]
          .join(' ')
          .toLowerCase();
        return tokens.every((token) => text.includes(token));
      });
    switch (query.sort) {
      case 'popular':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'latest':
        result.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
        break;
      case 'oldest':
        result.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
        break;
      case 'duration':
        result.sort((a, b) => a.duration - b.duration);
        break;
      default:
        result.sort((a, b) => b.trendingScore - a.trendingScore);
    }
    return query.limit ? result.slice(0, query.limit) : result;
  }
  async getVideo(id: string) {
    return mockVideos.find((v) => v.id === id) || null;
  }
  async getCategories() {
    return [...mockCategories];
  }
  async getCreators() {
    return [...mockCreators];
  }
  async getCreator(id: string) {
    return mockCreators.find((c) => c.id === id) || null;
  }
}
export class MockSourceProvider implements VideoSourceProvider {
  async getSource(video: Video, signal?: AbortSignal): Promise<VideoSource> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    if (!video.mediaKey) throw new Error('Demo video is missing a local media reference.');
    const url = `/media/${video.mediaKey}.mp4`;
    return {
      type: 'file',
      url,
      mimeType: 'video/mp4; codecs="avc1.64001F"',
      poster: video.poster,
      duration: APP_CONFIG.player.previewDuration,
      isPreview: true,
      renditions: [
        {
          quality: '720p',
          label: '720p · Demo preview',
          url,
          mimeType: 'video/mp4; codecs="avc1.64001F"',
        },
      ],
      fallbacks: [{ url: `/media/${video.mediaKey}.webm`, mimeType: 'video/webm; codecs="vp9"' }],
    };
  }
}
