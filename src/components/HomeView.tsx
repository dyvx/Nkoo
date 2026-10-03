'use client';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shuffle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { APP_CONFIG } from '@/lib/config';
import { useCatalog, useLibrary } from './AppProviders';
import HeroSection from './HeroSection';
import CategoryRail from './CategoryChip';
import { VideoCard, VideoGrid } from './VideoCard';
import { EmptyState, SectionHeader, SelectField } from './ui';
export default function HomeView() {
  const { videos, categories } = useCatalog();
  const { state } = useLibrary();
  const params = useSearchParams();
  const router = useRouter();
  const category = params.get('category') || 'all';
  const [period, setPeriod] = useState('week');
  const filtered = useMemo(
    () => (category === 'all' ? videos : videos.filter((v) => v.categoryId === category)),
    [videos, category],
  );
  const featured = videos
    .filter((v) => v.featured)
    .sort((a, b) =>
      a.id === APP_CONFIG.home.featuredId ? -1 : b.id === APP_CONFIG.home.featuredId ? 1 : 0,
    );
  const recent = [...filtered]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, APP_CONFIG.home.sectionCount);
  const trending = [...filtered]
    .filter((v) => category !== 'all' || v.id !== APP_CONFIG.home.featuredId)
    .filter((v) =>
      period === 'today'
        ? Date.parse(v.publishedAt) >= Date.parse(APP_CONFIG.demoDate) - 86400000
        : period === 'week'
          ? Date.parse(v.publishedAt) >= Date.parse(APP_CONFIG.demoDate) - 7 * 86400000
          : true,
    )
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, APP_CONFIG.home.trendingCount);
  const popular = [...filtered]
    .sort((a, b) => b.views - a.views)
    .slice(0, APP_CONFIG.home.sectionCount);
  const recommended = [...filtered]
    .filter((v) => !trending.some((t) => t.id === v.id))
    .sort(
      (a, b) =>
        Number(state.followedCreatorIds.includes(b.creatorId)) * 30 +
        b.trendingScore -
        (Number(state.followedCreatorIds.includes(a.creatorId)) * 30 + a.trendingScore),
    )
    .slice(0, APP_CONFIG.home.sectionCount);
  const continueEntries = state.history.filter(
    (e) => e.progress / e.duration < 0.95 && e.progress > 0,
  );
  const continueVideos = continueEntries
    .map((e) => videos.find((v) => v.id === e.videoId))
    .filter((v) => !!v)
    .slice(0, 4);
  return (
    <div className="home-page">
      <div className="page-heading home-heading">
        <div>
          <span className="eyebrow accent-text">A LITTLE MORE WONDER, EVERY DAY</span>
          <h1>Less scrolling. More discovering.</h1>
          <p>Independent stories, fresh perspectives, and your next favorite watch.</p>
        </div>
        <button
          className="btn secondary surprise-button"
          onClick={() => {
            const list = filtered.length ? filtered : videos;
            router.push(`/video/${list[Math.floor(Math.random() * list.length)].id}`);
          }}
        >
          <Shuffle size={15} /> Surprise me
        </button>
      </div>
      <CategoryRail
        categories={categories}
        selected={category}
        onSelect={(id) =>
          router.replace(id === 'all' ? '/' : `/?category=${id}`, { scroll: false })
        }
      />
      {category === 'all' ? (
        <HeroSection featured={featured} />
      ) : (
        <div className="filtered-banner">
          <div>
            <span className="eyebrow accent-text">FOLLOW YOUR CURIOSITY</span>
            <h2>{categories.find((c) => c.id === category)?.name || 'Your collection'}</h2>
            <p>{categories.find((c) => c.id === category)?.description}</p>
          </div>
          <span>
            {filtered.length} films to discover <ArrowUpRight size={24} />
          </span>
        </div>
      )}
      <section className="content-section">
        <SectionHeader
          title="Trending now"
          subtitle="The ones worth talking about."
          icon="trending"
          href={`/search?sort=popular${category !== 'all' ? `&category=${category}` : ''}`}
        >
          <SelectField
            value={period}
            onChange={setPeriod}
            label="Trending period"
            options={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This week' },
              { value: 'month', label: 'This month' },
            ]}
          />
        </SectionHeader>
        {trending.length ? (
          <VideoGrid videos={trending} priority />
        ) : (
          <EmptyState
            title="A quieter day in this category"
            description="Try this week or this month for more great finds."
            icon="trending"
          />
        )}
      </section>
      {category === 'all' && continueVideos.length > 0 && (
        <section className="content-section">
          <SectionHeader
            title="Pick up where you left off"
            icon="play"
            href="/library?tab=continue"
          />
          <div className="continue-grid">
            {continueVideos.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                compact
                progress={
                  (continueEntries.find((e) => e.videoId === v.id)?.progress || 0) /
                  (continueEntries.find((e) => e.videoId === v.id)?.duration || 20)
                }
              />
            ))}
          </div>
        </section>
      )}
      <section className="content-section">
        <SectionHeader
          title="Fresh off the upload"
          subtitle="New stories. New perspectives."
          icon="sparkles"
          href={`/search?sort=latest${category !== 'all' ? `&category=${category}` : ''}`}
        />
        <VideoGrid videos={recent} />
      </section>
      {recommended.length > 0 && (
        <section className="content-section">
          <SectionHeader
            title="A little more your thing"
            subtitle="Handpicked for your curious side."
            href={`/search${category !== 'all' ? `?category=${category}` : ''}`}
          />
          <VideoGrid videos={recommended} />
        </section>
      )}
      <div className="editorial-strip">
        <div>
          <span className="eyebrow accent-text">GO DOWN A NEW RABBIT HOLE</span>
          <h2>Different worlds. Same curiosity.</h2>
          <p>Explore stories outside your usual feed.</p>
        </div>
        <Link className="btn secondary" href="/categories">
          Explore categories <ArrowUpRight size={17} />
        </Link>
        <span className="editorial-star" aria-hidden="true">
          ✳
        </span>
      </div>
      <section className="content-section">
        <SectionHeader
          title="All-time favorites"
          subtitle="Good stories never get old."
          href={`/search?sort=popular${category !== 'all' ? `&category=${category}` : ''}`}
        />
        <VideoGrid videos={popular} />
      </section>
    </div>
  );
}
