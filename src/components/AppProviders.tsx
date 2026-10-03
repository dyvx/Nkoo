'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Check, X, Info } from 'lucide-react';
import type { CatalogSnapshot, LibraryState, Preferences, User, WatchEntry } from '@/types';
import { mockLibrary } from '@/data/mockUser';
import { APP_CONFIG } from '@/lib/config';
import { catalogProvider } from '@/lib/providers';

type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'info';
  action?: { label: string; onClick: () => void };
};
const ToastContext = createContext<{
  notify: (message: string, type?: 'success' | 'info', action?: ToastMessage['action']) => void;
}>({ notify: () => {} });
export const useToast = () => useContext(ToastContext);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const notify = useCallback(
    (message: string, type: 'success' | 'info' = 'success', action?: ToastMessage['action']) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-2), { id, message, type, action }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
    },
    [],
  );
  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div className="toast" key={t.id} role="status">
            <span className="toast-symbol">
              {t.type === 'success' ? <Check size={17} /> : <Info size={17} />}
            </span>
            <span>{t.message}</span>
            {t.action && (
              <button
                className="toast-action"
                onClick={() => {
                  t.action?.onClick();
                  setToasts((p) => p.filter((x) => x.id !== t.id));
                }}
              >
                {t.action.label}
              </button>
            )}
            <button
              className="icon-button small"
              aria-label="Dismiss notification"
              onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
const CatalogContext = createContext<
  (CatalogSnapshot & { provider: typeof catalogProvider }) | null
>(null);
export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error('Catalog provider missing');
  return value;
}
interface LibraryContextType {
  state: LibraryState;
  ready: boolean;
  toggleSaved: (id: string) => void;
  toggleLike: (id: string) => void;
  toggleFollow: (id: string) => void;
  recordWatch: (id: string, progress: number, duration: number) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
  recordView: (id: string) => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
  updateUser: (patch: Partial<User>) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  createPlaylist: (title: string, description?: string) => string;
  deletePlaylist: (id: string) => void;
  togglePlaylistVideo: (playlistId: string, videoId: string) => void;
  resetDemo: () => void;
}
const LibraryContext = createContext<LibraryContextType | null>(null);
export function useLibrary() {
  const value = useContext(LibraryContext);
  if (!value) throw new Error('Library provider missing');
  return value;
}
function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LibraryState>(mockLibrary);
  const [ready, setReady] = useState(false);
  const { notify } = useToast();
  useEffect(() => {
    try {
      const raw = localStorage.getItem(APP_CONFIG.storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<LibraryState>;
        if (
          Array.isArray(saved.savedIds) &&
          Array.isArray(saved.history) &&
          Array.isArray(saved.playlists)
        ) {
          setState({
            ...mockLibrary,
            ...saved,
            preferences: { ...mockLibrary.preferences, ...saved.preferences },
            user: { ...mockLibrary.user, ...saved.user },
          });
        }
      }
    } catch {
      /* Invalid or unavailable storage falls back to demo defaults. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(state));
      } catch {
        /* Private browsing remains fully usable in memory. */
      }
    }
  }, [state, ready]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const apply = () => {
      document.documentElement.dataset.theme =
        state.preferences.theme === 'system'
          ? media.matches
            ? 'light'
            : 'dark'
          : state.preferences.theme;
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [state.preferences.theme]);
  const toggleSaved = useCallback(
    (id: string) => {
      const saved = state.savedIds.includes(id);
      setState((prev) => ({
        ...prev,
        savedIds: prev.savedIds.includes(id)
          ? prev.savedIds.filter((x) => x !== id)
          : [id, ...prev.savedIds],
      }));
      notify(saved ? 'Removed from saved videos' : 'Saved to your library');
    },
    [state.savedIds, notify],
  );
  const toggleLike = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      likedIds: prev.likedIds.includes(id)
        ? prev.likedIds.filter((x) => x !== id)
        : [...prev.likedIds, id],
    }));
  }, []);
  const toggleFollow = useCallback(
    (id: string) => {
      const followed = state.followedCreatorIds.includes(id);
      setState((prev) => ({
        ...prev,
        followedCreatorIds: prev.followedCreatorIds.includes(id)
          ? prev.followedCreatorIds.filter((x) => x !== id)
          : [...prev.followedCreatorIds, id],
      }));
      notify(followed ? 'Creator unfollowed' : 'Creator added to your follows');
    },
    [state.followedCreatorIds, notify],
  );
  const recordWatch = useCallback((videoId: string, progress: number, duration: number) => {
    if (!duration || progress < 0.1) return;
    setState((prev) => {
      const old = prev.history.find((e) => e.videoId === videoId);
      if (old && Math.abs(old.progress - progress) < 0.75 && old.duration === duration) return prev;
      const entry: WatchEntry = {
        videoId,
        progress: Math.min(progress, duration),
        duration,
        watchedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        history: [entry, ...prev.history.filter((e) => e.videoId !== videoId)].slice(0, 100),
      };
    });
  }, []);
  const removeHistory = useCallback(
    (id: string) => setState((p) => ({ ...p, history: p.history.filter((e) => e.videoId !== id) })),
    [],
  );
  const recordView = useCallback(
    (id: string) =>
      setState((p) =>
        p.recentlyViewedIds[0] === id
          ? p
          : {
              ...p,
              recentlyViewedIds: [id, ...p.recentlyViewedIds.filter((x) => x !== id)].slice(0, 20),
            },
      ),
    [],
  );
  const clearHistory = useCallback(() => {
    setState((p) => ({ ...p, history: [], recentlyViewedIds: [] }));
    notify('Watch history cleared');
  }, [notify]);
  const updatePreferences = useCallback(
    (patch: Partial<Preferences>) =>
      setState((p) => ({ ...p, preferences: { ...p.preferences, ...patch } })),
    [],
  );
  const updateUser = useCallback(
    (patch: Partial<User>) => {
      setState((p) => ({ ...p, user: { ...p.user, ...patch } }));
      notify('Profile updated');
    },
    [notify],
  );
  const addRecentSearch = useCallback((query: string) => {
    const q = query.trim();
    if (q)
      setState((p) => ({
        ...p,
        recentSearches: [
          q,
          ...p.recentSearches.filter((s) => s.toLowerCase() !== q.toLowerCase()),
        ].slice(0, APP_CONFIG.search.recentLimit),
      }));
  }, []);
  const clearRecentSearches = useCallback(
    () => setState((p) => ({ ...p, recentSearches: [] })),
    [],
  );
  const createPlaylist = useCallback(
    (title: string, description = '') => {
      const id = `p${Date.now()}`;
      setState((p) => ({
        ...p,
        playlists: [
          ...p.playlists,
          { id, title, description, videoIds: [], updatedAt: new Date().toISOString() },
        ],
      }));
      notify('Playlist created');
      return id;
    },
    [notify],
  );
  const deletePlaylist = useCallback(
    (id: string) => {
      setState((p) => ({ ...p, playlists: p.playlists.filter((x) => x.id !== id) }));
      notify('Playlist deleted');
    },
    [notify],
  );
  const togglePlaylistVideo = useCallback((playlistId: string, videoId: string) => {
    setState((p) => ({
      ...p,
      playlists: p.playlists.map((list) =>
        list.id === playlistId
          ? {
              ...list,
              videoIds: list.videoIds.includes(videoId)
                ? list.videoIds.filter((x) => x !== videoId)
                : [...list.videoIds, videoId],
              updatedAt: new Date().toISOString(),
            }
          : list,
      ),
    }));
  }, []);
  const resetDemo = useCallback(() => {
    setState(structuredClone(mockLibrary));
    notify('Your demo has been reset');
  }, [notify]);
  const value = useMemo(
    () => ({
      state,
      ready,
      toggleSaved,
      toggleLike,
      toggleFollow,
      recordWatch,
      removeHistory,
      clearHistory,
      recordView,
      updatePreferences,
      updateUser,
      addRecentSearch,
      clearRecentSearches,
      createPlaylist,
      deletePlaylist,
      togglePlaylistVideo,
      resetDemo,
    }),
    [
      state,
      ready,
      toggleSaved,
      toggleLike,
      toggleFollow,
      recordWatch,
      removeHistory,
      clearHistory,
      recordView,
      updatePreferences,
      updateUser,
      addRecentSearch,
      clearRecentSearches,
      createPlaylist,
      deletePlaylist,
      togglePlaylistVideo,
      resetDemo,
    ],
  );
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}
export default function AppProviders({
  catalog,
  children,
}: {
  catalog: CatalogSnapshot;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ ...catalog, provider: catalogProvider }), [catalog]);
  return (
    <CatalogContext.Provider value={value}>
      <ToastProvider>
        <LibraryProvider>{children}</LibraryProvider>
      </ToastProvider>
    </CatalogContext.Provider>
  );
}
