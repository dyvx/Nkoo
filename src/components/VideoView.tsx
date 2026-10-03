'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, ChevronRight, Info, Bookmark, BookmarkCheck } from 'lucide-react';
import type { Video } from '@/types';
import { APP_CONFIG } from '@/lib/config';
import { useCatalog, useLibrary, useToast } from './AppProviders';
import DetailsPanel from './DetailsPanel';
import { VideoCard, VideoGrid } from './VideoCard';
import { SectionHeader, Toggle } from './ui';
const VideoPlayer = dynamic(() => import('./player/VideoPlayer'), {
  ssr: false,
  loading: () => (
    <div className="player-loading-placeholder">
      <span className="skeleton" />
    </div>
  ),
});
export function RelatedVideos({ video, compact = false }: { video: Video; compact?: boolean }) {
  const { videos } = useCatalog();
  const related = [...videos]
    .filter((v) => v.id !== video.id)
    .sort(
      (a, b) =>
        Number(b.categoryId === video.categoryId) - Number(a.categoryId === video.categoryId) ||
        b.trendingScore - a.trendingScore,
    )
    .slice(0, compact ? 6 : 4);
  return compact ? (
    <div className="related-list">
      {related.map((v) => (
        <VideoCard video={v} key={v.id} compact />
      ))}
    </div>
  ) : (
    <VideoGrid videos={related} />
  );
}
export default function VideoView({ video, watch = false }: { video: Video; watch?: boolean }) {
  const { creators, videos } = useCatalog();
  const { state, updatePreferences, toggleSaved, recordView } = useLibrary();
  useEffect(() => recordView(video.id), [video.id, recordView]);
  const { notify } = useToast();
  const router = useRouter();
  const creator = creators.find((c) => c.id === video.creatorId);
  const more = videos
    .filter((v) => v.creatorId === video.creatorId && v.id !== video.id)
    .slice(0, 4);
  const next =
    videos.find((v) => v.categoryId === video.categoryId && v.id !== video.id) ||
    videos.find((v) => v.id !== video.id);
  const saved = state.savedIds.includes(video.id);
  return (
    <div className="video-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight size={13} />
        <Link href={`/search?category=${video.categoryId}`}>Discover</Link>
        <ChevronRight size={13} />
        <span>{watch ? 'Now playing' : 'The story'}</span>
      </nav>
      <div className="video-page-layout">
        <div className="video-primary">
          {watch ? (
            <VideoPlayer
              key={video.id}
              video={video}
              onEnded={() => {
                if (state.preferences.autoplay && next) {
                  notify('Up next: another good story');
                  router.push(`/watch/${next.id}`);
                } else notify('Demo preview complete. Replay or discover your next film.', 'info');
              }}
            />
          ) : (
            <div className="details-cover">
              <img src={video.poster} alt={video.title} fetchPriority="high" />
              <div className="details-cover-shade" />
              <span className="details-cover-badge">
                {APP_CONFIG.brand.name.toUpperCase()} ORIGINAL <i /> 4K
              </span>
              <Link
                href={`/watch/${video.id}`}
                className="details-play"
                aria-label={`Watch ${video.title}`}
              >
                <span>
                  <Play size={29} fill="currentColor" />
                </span>
                <strong>Watch the film</strong>
                <small>20-second demo preview</small>
              </Link>
              <button
                className="cover-save icon-button"
                onClick={() => toggleSaved(video.id)}
                aria-label={saved ? 'Remove from saved' : 'Save this film'}
              >
                {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </button>
            </div>
          )}
          {watch && (
            <div className="preview-notice">
              <Info size={14} />
              <span>
                A 20-second, silent visual preview. All stories and creators are fictional.
              </span>
            </div>
          )}
          <DetailsPanel video={video} />
        </div>
        <aside className="video-secondary">
          <div className="related-header">
            <h2>Up next</h2>
            {watch && (
              <Toggle
                label="Autoplay"
                checked={state.preferences.autoplay}
                onChange={(autoplay) => updatePreferences({ autoplay })}
              />
            )}
          </div>
          <RelatedVideos video={video} compact />
        </aside>
      </div>
      <section className="content-section">
        <SectionHeader
          title={`More from ${creator?.name || 'this creator'}`}
          href={`/creators/${video.creatorId}`}
        />
        <VideoGrid videos={more} />
      </section>
      <section className="content-section">
        <SectionHeader
          title="Keep following your curiosity"
          href={`/search?category=${video.categoryId}`}
        />
        <RelatedVideos video={video} />
      </section>
    </div>
  );
}
