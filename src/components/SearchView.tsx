'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { History, ArrowUpRight, TrendingUp, X } from 'lucide-react';
import type { Video, SortOrder } from '@/types';
import { APP_CONFIG } from '@/lib/config';
import { useCatalog, useLibrary } from './AppProviders';
import SearchBar from './SearchBar';
import CategoryRail from './CategoryChip';
import FilterBar from './FilterBar';
import { VideoGrid, VideoRow } from './VideoCard';
import { EmptyState, LoadingSkeleton } from './ui';
export default function SearchView() {
  const router = useRouter();
  const params = useSearchParams();
  const { provider, categories, videos } = useCatalog();
  const { state, addRecentSearch, clearRecentSearches } = useLibrary();
  const query = params.get('q') || '';
  const category = params.get('category') || 'all';
  const sort = (params.get('sort') || 'recommended') as SortOrder;
  const view = params.get('view') === 'list' ? 'list' : 'grid';
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const change = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (
        !value ||
        value === 'all' ||
        (key === 'sort' && value === 'recommended') ||
        (key === 'view' && value === 'grid')
      )
        next.delete(key);
      else next.set(key, value);
    });
    router.replace(`/search${next.size ? `?${next.toString()}` : ''}`, { scroll: false });
  };
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    const timer = setTimeout(async () => {
      try {
        const result = await provider.getVideos({ query, category, sort }, controller.signal);
        if (!controller.signal.aborted) {
          setResults(result);
          setLoading(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(true);
          setLoading(false);
        }
      }
    }, APP_CONFIG.search.debounceMs);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, category, sort, provider, refresh]);
  const suggestions = Array.from(new Set(videos.flatMap((v) => v.tags)))
    .filter((t) => !state.recentSearches.includes(t))
    .slice(0, 5);
  const selectedCategory = categories.find((c) => c.id === category);
  return (
    <div className="search-page">
      <div className="page-heading">
        <span className="eyebrow accent-text">THERE’S SOMETHING GOOD IN HERE</span>
        <h1>{selectedCategory ? selectedCategory.name : 'Follow your curiosity.'}</h1>
        <p>
          {selectedCategory
            ? selectedCategory.description
            : 'Find a new perspective, a favorite creator, or a story you didn’t know you needed.'}
        </p>
      </div>
      <SearchBar large initialValue={query} onSubmit={(q) => change({ q })} />
      {!query && (
        <div className="search-inspiration">
          {state.recentSearches.length > 0 && (
            <div className="search-tag-row">
              <span>
                <History size={14} /> Recent
              </span>
              {state.recentSearches.map((q) => (
                <button key={q} onClick={() => change({ q })}>
                  {q}
                  <ArrowUpRight size={12} />
                </button>
              ))}
              <button
                className="clear-recents"
                onClick={clearRecentSearches}
                aria-label="Clear recent searches"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <div className="search-tag-row">
            <span>
              <TrendingUp size={14} /> Try exploring
            </span>
            {suggestions.map((q) => (
              <button
                key={q}
                onClick={() => {
                  addRecentSearch(q);
                  change({ q });
                }}
              >
                {q}
                <ArrowUpRight size={12} />
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="search-divider" />
      <CategoryRail
        categories={categories}
        selected={category}
        allLabel="All videos"
        onSelect={(category) => change({ category })}
      />
      <FilterBar
        count={results.length}
        query={query}
        loading={loading}
        sort={sort}
        onSort={(sort) => change({ sort })}
        view={view}
        onView={(view) => change({ view })}
        onClear={() => change({ q: '' })}
      />
      {loading ? (
        <LoadingSkeleton list={view === 'list'} />
      ) : error ? (
        <EmptyState
          title="We couldn’t load the collection"
          description="Your local demo is still here. Give it another try."
          action={
            <button className="btn primary" onClick={() => setRefresh((v) => v + 1)}>
              Try again
            </button>
          }
        />
      ) : results.length ? (
        view === 'grid' ? (
          <VideoGrid videos={results} priority />
        ) : (
          <div className="video-list">
            {results.map((v) => (
              <VideoRow key={v.id} video={v} />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title="No stories found. Yet."
          description={`We couldn’t find a match${query ? ` for “${query}”` : ''}. Try a broader search or explore another category.`}
          action={
            <button
              className="btn primary"
              onClick={() => change({ q: '', category: 'all', sort: 'recommended' })}
            >
              Explore all videos <ArrowUpRight size={16} />
            </button>
          }
        />
      )}
    </div>
  );
}
