import type { LibraryState } from '@/types';
import { APP_CONFIG } from '@/lib/config';
export const mockLibrary: LibraryState = {
  savedIds: ['v03', 'v06', 'v11'],
  likedIds: [],
  followedCreatorIds: [],
  history: [
    { videoId: 'v01', progress: 8.4, duration: 20, watchedAt: '2026-10-01T10:32:00Z' },
    { videoId: 'v07', progress: 13, duration: 20, watchedAt: '2026-09-30T18:15:00Z' },
  ],
  playlists: [
    {
      id: 'p01',
      title: 'The weekend queue',
      description: 'A little adventure, a little inspiration.',
      videoIds: ['v01', 'v02', 'v04', 'v08'],
      updatedAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'p02',
      title: 'Make something',
      description: 'For when the creative spark needs a little help.',
      videoIds: ['v05', 'v07', 'v12'],
      updatedAt: '2026-09-30T10:00:00Z',
    },
  ],
  preferences: {
    theme: 'dark',
    autoplay: false,
    resumePlayback: true,
    captions: false,
    playbackRate: APP_CONFIG.player.defaultRate,
    quality: APP_CONFIG.player.defaultQuality,
  },
  user: {
    id: 'demo-user',
    name: 'Alex Morgan',
    username: 'alexmorgan',
    email: 'alex@demo.invalid',
    bio: 'A collector of good stories and new perspectives.',
    joinedAt: '2026-05-14',
    initials: 'AM',
  },
  recentSearches: ['Cinematic', 'Slow living', 'Architecture'],
  recentlyViewedIds: ['v02', 'v07'],
};
