'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ThumbsUp,
  Share2,
  Bookmark,
  BookmarkCheck,
  Plus,
  Check,
  FolderPlus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import clsx from 'clsx';
import type { Video, Creator } from '@/types';
import { formatCount, fullDate } from '@/lib/utils';
import { useCatalog, useLibrary } from './AppProviders';
import { Avatar, Verified, ShareModal, PlaylistModal } from './ui';
export function CreatorCard({ creator }: { creator: Creator }) {
  const { state, toggleFollow } = useLibrary();
  const followed = state.followedCreatorIds.includes(creator.id);
  return (
    <div className="creator-card">
      <Link href={`/creators/${creator.id}`} className="creator-card-info">
        <Avatar creator={creator} size={44} />
        <span>
          <strong>
            {creator.name}
            {creator.verified && <Verified />}
          </strong>
          <small>{formatCount(creator.followers + Number(followed))} followers</small>
        </span>
      </Link>
      <button
        className={clsx('btn', followed ? 'secondary' : 'primary', 'follow-button')}
        onClick={() => toggleFollow(creator.id)}
      >
        {followed ? <Check size={15} /> : <Plus size={15} />} {followed ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}
export default function DetailsPanel({ video }: { video: Video }) {
  const { creators, categories } = useCatalog();
  const { state, toggleSaved, toggleLike } = useLibrary();
  const [share, setShare] = useState(false);
  const [playlist, setPlaylist] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const saved = state.savedIds.includes(video.id);
  const liked = state.likedIds.includes(video.id);
  const creator = creators.find((c) => c.id === video.creatorId);
  const category = categories.find((c) => c.id === video.categoryId);
  return (
    <div className="details-panel">
      <Link className="details-category" href={`/search?category=${video.categoryId}`}>
        {category?.name}
      </Link>
      <h1>{video.title}</h1>
      <div className="details-metadata">
        <span>{formatCount(video.views)} views</span>
        <span>·</span>
        <span>{fullDate(video.publishedAt)}</span>
        <span className="original-pill">DEMO ORIGINAL</span>
      </div>
      <div className="details-actions">
        <button
          className={clsx('btn secondary', liked && 'selected')}
          onClick={() => toggleLike(video.id)}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike video' : 'Like video'}
        >
          <ThumbsUp size={17} fill={liked ? 'currentColor' : 'none'} />
          {formatCount(video.likes + Number(liked))}
        </button>
        <button className="btn secondary" onClick={() => setShare(true)}>
          <Share2 size={17} /> Share
        </button>
        <button
          className={clsx('btn secondary', saved && 'selected')}
          onClick={() => toggleSaved(video.id)}
          aria-pressed={saved}
        >
          {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />} {saved ? 'Saved' : 'Save'}
        </button>
        <button className="btn secondary playlist-action" onClick={() => setPlaylist(true)}>
          <FolderPlus size={17} /> Add to playlist
        </button>
      </div>
      {creator && <CreatorCard creator={creator} />}
      <div className="description-panel">
        <span className="eyebrow">THE STORY</span>
        <p>{video.description}</p>
        {expanded && (
          <div className="demo-disclosure">
            <strong>A note about this experience</strong>
            <p>
              Every title, creator, and story on Veyra is fictional. The player shows a 20-second,
              silent visual preview made from original AI-generated artwork. Card durations
              represent the imaginary full films. No external catalog, streaming service, or account
              is connected.
            </p>
          </div>
        )}
        <button
          className="description-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : 'About this demo'}{' '}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <div className="video-tags">
          {video.tags.map((t) => (
            <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}>
              #{t.toLowerCase().replaceAll(' ', '')}
            </Link>
          ))}
        </div>
      </div>
      <ShareModal video={video} open={share} onClose={() => setShare(false)} />
      <PlaylistModal videoId={video.id} open={playlist} onClose={() => setPlaylist(false)} />
    </div>
  );
}
