export type SortOrder = 'recommended' | 'popular' | 'latest' | 'oldest' | 'duration';
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  poster: string;
  mediaKey?: string;
  creatorId: string;
  categoryId: string;
  tags: string[];
  duration: number;
  views: number;
  likes: number;
  publishedAt: string;
  trendingScore: number;
  featured?: { eyebrow: string; headline: string; summary: string };
}
export interface Category {
  id: string;
  name: string;
  shortName: string;
  description: string;
  image: string;
  thumbnail?: string;
  icon: string;
  featured: boolean;
}
export interface Creator {
  id: string;
  name: string;
  handle: string;
  initials: string;
  avatarColor: string;
  bio: string;
  followers: number;
  verified: boolean;
}
export interface Playlist {
  id: string;
  title: string;
  description: string;
  videoIds: string[];
  updatedAt: string;
}
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  joinedAt: string;
  initials: string;
}
export type Theme = 'dark' | 'light' | 'system';
export interface Preferences {
  theme: Theme;
  autoplay: boolean;
  resumePlayback: boolean;
  captions: boolean;
  playbackRate: number;
  quality: string;
}
export interface WatchEntry {
  videoId: string;
  progress: number;
  duration: number;
  watchedAt: string;
}
export interface LibraryState {
  savedIds: string[];
  likedIds: string[];
  followedCreatorIds: string[];
  history: WatchEntry[];
  playlists: Playlist[];
  preferences: Preferences;
  user: User;
  recentSearches: string[];
  recentlyViewedIds: string[];
}
export interface VideoRendition {
  quality: string;
  label: string;
  url: string;
  mimeType: string;
}
export interface VideoSource {
  type: 'file' | 'demo';
  poster: string;
  duration: number;
  url?: string;
  mimeType?: string;
  renditions: VideoRendition[];
  fallbacks?: { url: string; mimeType: string }[];
  tracks?: { kind: 'captions' | 'subtitles'; language: string; label: string; url: string }[];
  isPreview: boolean;
}
export interface CatalogQuery {
  query?: string;
  category?: string;
  creator?: string;
  sort?: SortOrder;
  limit?: number;
}
export interface CatalogSnapshot {
  videos: Video[];
  categories: Category[];
  creators: Creator[];
}
