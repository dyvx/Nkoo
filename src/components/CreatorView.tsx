'use client';
import { useState } from 'react';
import { Check, Plus, Users, Clapperboard } from 'lucide-react';
import type { Creator, SortOrder } from '@/types';
import { useCatalog, useLibrary } from './AppProviders';
import { Avatar, Verified, SelectField } from './ui';
import { VideoGrid } from './VideoCard';
import { formatCount } from '@/lib/utils';
import { SORT_OPTIONS } from './FilterBar';
export default function CreatorView({ creator }: { creator: Creator }) {
  const { videos } = useCatalog();
  const { state, toggleFollow } = useLibrary();
  const [sort, setSort] = useState<SortOrder>('latest');
  const followed = state.followedCreatorIds.includes(creator.id);
  const films = videos
    .filter((v) => v.creatorId === creator.id)
    .sort((a, b) =>
      sort === 'popular'
        ? b.views - a.views
        : sort === 'duration'
          ? a.duration - b.duration
          : sort === 'oldest'
            ? a.publishedAt.localeCompare(b.publishedAt)
            : sort === 'recommended'
              ? b.trendingScore - a.trendingScore
              : b.publishedAt.localeCompare(a.publishedAt),
    );
  return (
    <div className="creator-page">
      <div className="creator-banner">
        <img src={films[0]?.poster} alt="" />
        <span />
      </div>
      <div className="creator-profile">
        <Avatar creator={creator} size={80} />
        <div>
          <span className="eyebrow accent-text">INDEPENDENT DEMO CREATOR</span>
          <h1>
            {creator.name}
            {creator.verified && <Verified />}
          </h1>
          <span className="creator-handle">@{creator.handle}</span>
          <p>{creator.bio}</p>
          <div className="creator-statline">
            <span>
              <Users size={14} />
              {formatCount(creator.followers + Number(followed))} followers
            </span>
            <span>
              <Clapperboard size={14} />
              {films.length} films
            </span>
          </div>
        </div>
        <button
          className={`btn ${followed ? 'secondary' : 'primary'}`}
          onClick={() => toggleFollow(creator.id)}
        >
          {followed ? <Check size={16} /> : <Plus size={16} />}{' '}
          {followed ? 'Following' : 'Follow creator'}
        </button>
      </div>
      <div className="creator-videos-heading">
        <h2>Stories by {creator.name}</h2>
        <SelectField
          label="Sort creator videos"
          value={sort}
          onChange={(v) => setSort(v as SortOrder)}
          options={SORT_OPTIONS}
        />
      </div>
      <VideoGrid videos={films} priority />
    </div>
  );
}
