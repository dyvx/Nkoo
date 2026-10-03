/** The only product configuration file. No backend is contacted by this demo. */
export const APP_CONFIG = {
  brand: {
    name: 'Veyra',
    tagline: 'Stay curious.',
    accent: '#bcf279',
    description: 'Good stories. Fresh perspectives. A little more wonder.',
  },
  api: { baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '' },
  providers: { catalog: 'mock', source: 'mock' } as const,
  demoDate: '2026-10-01T12:00:00Z',
  storageKey: 'veyra:demo:v1',
  navigation: {
    discover: [
      { label: 'Home', href: '/', icon: 'home' },
      { label: 'Trending', href: '/search?sort=popular', icon: 'trending' },
      { label: 'Categories', href: '/categories', icon: 'grid' },
      { label: 'New releases', href: '/search?sort=latest', icon: 'sparkles' },
    ],
    library: [
      { label: 'My library', href: '/library', icon: 'library' },
      { label: 'Continue watching', href: '/library?tab=continue', icon: 'play' },
      { label: 'Saved videos', href: '/library?tab=saved', icon: 'bookmark' },
      { label: 'History', href: '/library?tab=history', icon: 'history' },
      { label: 'Playlists', href: '/library?tab=playlists', icon: 'playlist' },
    ],
    mobile: [
      { label: 'Home', href: '/', icon: 'home' },
      { label: 'Explore', href: '/categories', icon: 'compass' },
      { label: 'Search', href: '/search', icon: 'search' },
      { label: 'Library', href: '/library', icon: 'library' },
      { label: 'You', href: '/profile', icon: 'user' },
    ],
    pinnedCategories: ['travel', 'design', 'music'],
  },
  player: {
    previewDuration: 20,
    defaultQuality: 'Auto',
    defaultRate: 1,
    defaultVolume: 0.8,
    controlsIdleMs: 2800,
    rates: [0.5, 0.75, 1, 1.25, 1.5, 2],
    seekStep: 5,
    allowPictureInPicture: true,
  },
  discovery: { featuredCount: 3, categoryListCount: 3 },
  search: { debounceMs: 220, recentLimit: 6 },
  home: { featuredId: 'v01', collectionCategoryId: 'travel', trendingCount: 4, sectionCount: 4 },
};
