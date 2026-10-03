'use client';
import { memo, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Bookmark,
  BookmarkCheck,
  FolderPlus,
  Share2,
  EyeOff,
  ArrowUpRight,
} from 'lucide-react';
import clsx from 'clsx';
import type { Video } from '@/types';
import { formatCount, formatDuration, timeAgo } from '@/lib/utils';
import { useCatalog, useLibrary } from './AppProviders';
import { Dropdown, PlaylistModal, ShareModal, Verified } from './ui';
function VideoCardComponent({
  video,
  progress,
  priority = false,
  compact = false,
  removeHistory = false,
}: {
  video: Video;
  progress?: number;
  priority?: boolean;
  compact?: boolean;
  removeHistory?: boolean;
}) {
  const { creators, categories } = useCatalog();
  const { state, toggleSaved, removeHistory: remove } = useLibrary();
  const [share, setShare] = useState(false);
  const [playlist, setPlaylist] = useState(false);
  const creator = creators.find((c) => c.id === video.creatorId);
  const category = categories.find((c) => c.id === video.categoryId);
  const saved = state.savedIds.includes(video.id);
  return (
    <article className={clsx('video-card', compact && 'compact-card')}>
      <Link
        href={progress ? `/watch/${video.id}` : `/video/${video.id}`}
        className="video-thumbnail"
        aria-label={`${progress ? 'Continue watching' : 'View'} ${video.title}`}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          width={640}
          height={360}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
        <div className="thumbnail-shade" />
        <span className="card-hover-play">
          <Play size={22} fill="currentColor" />
        </span>
        {progress !== undefined && (
          <span className="resume-label">
            <Play size={10} fill="currentColor" /> Resume
          </span>
        )}
        <span className="video-duration">{formatDuration(video.duration)}</span>
        {progress !== undefined && (
          <span className="watch-progress">
            <i style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }} />
          </span>
        )}
        {saved && (
          <span className="saved-indicator" aria-label="Saved">
            <BookmarkCheck size={12} />
          </span>
        )}
      </Link>
      <div className="video-card-info">
        <div className="video-title-row">
          <Link href={`/video/${video.id}`} className="video-title">
            {video.title}
          </Link>
          <Dropdown
            label={`More options for ${video.title}`}
            items={[
              {
                label: saved ? 'Remove from saved' : 'Save to library',
                icon: saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />,
                onClick: () => toggleSaved(video.id),
              },
              {
                label: 'Add to playlist',
                icon: <FolderPlus size={16} />,
                onClick: () => setPlaylist(true),
              },
              { label: 'Share video', icon: <Share2 size={16} />, onClick: () => setShare(true) },
              ...(removeHistory
                ? [
                    {
                      label: 'Remove from history',
                      icon: <EyeOff size={16} />,
                      onClick: () => remove(video.id),
                      danger: true,
                    },
                  ]
                : []),
            ]}
          />
        </div>
        <Link href={`/creators/${video.creatorId}`} className="video-creator">
          {creator?.name}
          {creator?.verified && <Verified />}
        </Link>
        <div className="video-meta">
          <span>{formatCount(video.views)} views</span>
          <span className="meta-dot">·</span>
          <span>{timeAgo(video.publishedAt)}</span>
        </div>
        {compact && <span className="compact-category">{category?.shortName}</span>}
      </div>
      <ShareModal video={video} open={share} onClose={() => setShare(false)} />
      <PlaylistModal videoId={video.id} open={playlist} onClose={() => setPlaylist(false)} />
    </article>
  );
}
export const VideoCard = memo(VideoCardComponent);
export function VideoGrid({
  videos,
  priority = false,
  progressMap,
  removeHistory = false,
  className = '',
}: {
  videos: Video[];
  priority?: boolean;
  progressMap?: Record<string, number>;
  removeHistory?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx('video-grid', className)}>
      {videos.map((v, i) => (
        <VideoCard
          key={v.id}
          video={v}
          priority={priority && i < 4}
          progress={progressMap?.[v.id]}
          removeHistory={removeHistory}
        />
      ))}
    </div>
  );
}
export function VideoRow({ video }: { video: Video }) {
  const { creators, categories } = useCatalog();
  const creator = creators.find((c) => c.id === video.creatorId);
  const category = categories.find((c) => c.id === video.categoryId);
  const { state, toggleSaved } = useLibrary();
  return (
    <article className="video-row">
      <Link href={`/video/${video.id}`} className="video-thumbnail">
        <img src={video.thumbnail} alt={video.title} loading="lazy" width={640} height={360} />
        <span className="card-hover-play">
          <Play size={22} fill="currentColor" />
        </span>
        <span className="video-duration">{formatDuration(video.duration)}</span>
      </Link>
      <div className="video-row-info">
        <Link href={`/search?category=${video.categoryId}`} className="eyebrow">
          {category?.name}
        </Link>
        <Link href={`/video/${video.id}`} className="video-title">
          {video.title}
        </Link>
        <Link href={`/creators/${video.creatorId}`} className="video-creator">
          {creator?.name}
          {creator?.verified && <Verified />}
        </Link>
        <div className="video-meta">
          {formatCount(video.views)} views <span>·</span> {timeAgo(video.publishedAt)}
        </div>
        <p>{video.description}</p>
      </div>
      <div className="video-row-actions">
        <button
          className={clsx('icon-button', state.savedIds.includes(video.id) && 'selected')}
          onClick={() => toggleSaved(video.id)}
          aria-label={state.savedIds.includes(video.id) ? 'Remove from saved' : 'Save video'}
        >
          {state.savedIds.includes(video.id) ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}
        </button>
        <Link href={`/video/${video.id}`} className="icon-button" aria-label="View video">
          <ArrowUpRight size={19} />
        </Link>
      </div>
    </article>
  );
}
