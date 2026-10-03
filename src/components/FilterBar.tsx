'use client';
import { Grid2X2, List, X } from 'lucide-react';
import clsx from 'clsx';
import type { SortOrder } from '@/types';
import { SelectField } from './ui';
export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'popular', label: 'Most popular' },
  { value: 'latest', label: 'Recently added' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'duration', label: 'Shortest first' },
];
export default function FilterBar({
  count,
  query,
  loading,
  sort,
  onSort,
  view,
  onView,
  onClear,
}: {
  count: number;
  query: string;
  loading: boolean;
  sort: SortOrder;
  onSort: (s: SortOrder) => void;
  view: 'grid' | 'list';
  onView: (v: 'grid' | 'list') => void;
  onClear: () => void;
}) {
  return (
    <div className="filter-bar">
      <div className="result-count">
        <strong>
          {loading ? 'Finding good stories…' : `${count} ${count === 1 ? 'video' : 'videos'}`}
        </strong>
        {query && (
          <button className="query-chip" onClick={onClear} aria-label="Clear search query">
            “{query}” <X size={12} />
          </button>
        )}
      </div>
      <div className="filter-actions">
        <span className="sort-label">Sort by</span>
        <SelectField
          label="Sort search results"
          value={sort}
          onChange={(s) => onSort(s as SortOrder)}
          options={SORT_OPTIONS}
        />
        <div className="view-toggle" role="group" aria-label="Results layout">
          <button
            className={clsx(view === 'grid' && 'active')}
            onClick={() => onView('grid')}
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
          >
            <Grid2X2 size={17} />
          </button>
          <button
            className={clsx(view === 'list' && 'active')}
            onClick={() => onView('list')}
            aria-label="List view"
            aria-pressed={view === 'list'}
          >
            <List size={19} />
          </button>
        </div>
      </div>
    </div>
  );
}
