'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Play, Bookmark, BookmarkCheck, ArrowUpRight, ChevronRight } from 'lucide-react';
import type { Category, Video } from '@/types';
import { useCatalog, useLibrary } from './AppProviders';
import { formatDuration } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/config';
export function CollectionCard({ category }: { category: Category }) {
  const { videos } = useCatalog();
  const count = videos.filter((v) => v.categoryId === category.id).length;
  return (
    <Link href={`/search?category=${category.id}`} className="collection-feature">
      <img src={category.image} alt={category.name} loading="eager" />
      <div className="collection-overlay" />
      <div className="collection-content">
        <span className="collection-eyebrow">
          <span /> THE WEEKEND EDIT
        </span>
        <div className="collection-bottom">
          <span className="eyebrow">CURATED FOR THE CURIOUS</span>
          <h2>
            A change
            <br />
            of scenery.
          </h2>
          <p>Big landscapes. Small escapes.</p>
          <div className="collection-footer">
            <span>Explore {count} films</span>
            <span className="round-arrow">
              <ArrowUpRight size={20} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
export default function HeroSection({ featured }: { featured: Video[] }) {
  const [index, setIndex] = useState(0);
  const video = featured[index % featured.length];
  const { state, toggleSaved } = useLibrary();
  const { creators, categories } = useCatalog();
  const creator = creators.find((c) => c.id === video.creatorId);
  const saved = state.savedIds.includes(video.id);
  const category =
    categories.find((c) => c.id === APP_CONFIG.home.collectionCategoryId) ||
    categories.find((c) => c.featured) ||
    categories[0];
  if (!video) return null;
  return (
    <section className="hero-layout" aria-label="Featured collection">
      <div className="hero-feature">
        <img
          className="hero-image"
          key={video.id}
          src={video.poster}
          alt=""
          fetchPriority="high"
          loading="eager"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="hero-eyebrow">
            <span className="live-dot" />
            {video.featured?.eyebrow}
          </span>
          <h2>
            {video.featured?.headline.split('\n').map((line, i) => <span key={i}>{line}</span>)}
          </h2>
          <p>{video.featured?.summary}</p>
          <div className="hero-buttons">
            <Link href={`/watch/${video.id}`} className="btn primary">
              <Play size={16} fill="currentColor" /> Watch now
            </Link>
            <button
              className="hero-save"
              aria-label={saved ? 'Remove featured video from saved' : 'Save featured video'}
              aria-pressed={saved}
              onClick={() => toggleSaved(video.id)}
            >
              {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>
          </div>
          <div className="hero-credit">
            <span>
              A film by <Link href={`/creators/${video.creatorId}`}>{creator?.name}</Link>
            </span>
            <i /> {formatDuration(video.duration)} <span className="quality-pill">4K</span>
          </div>
        </div>
        <div className="hero-carousel">
          <div className="hero-dots">
            {featured.map((v, i) => (
              <button
                key={v.id}
                aria-label={`Show featured film ${i + 1}: ${v.title}`}
                aria-pressed={index === i}
                className={index === i ? 'active' : ''}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <button
            className="hero-next"
            aria-label="Next featured film"
            onClick={() => setIndex((i) => (i + 1) % featured.length)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      {category && <CollectionCard category={category} />}
    </section>
  );
}
