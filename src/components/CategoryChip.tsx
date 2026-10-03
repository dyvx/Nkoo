'use client';
import { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { Category } from '@/types';
import { Icon } from './ui';
export function CategoryChip({
  category,
  selected,
  onClick,
}: {
  category: Pick<Category, 'id' | 'shortName' | 'icon'>;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={clsx('category-chip', selected && 'active')}
      onClick={onClick}
      aria-pressed={selected}
    >
      <Icon name={category.icon} size={15} />
      {category.shortName}
    </button>
  );
}
export default function CategoryRail({
  categories,
  selected,
  onSelect,
  allLabel = 'For you',
}: {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
  allLabel?: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  return (
    <div className="category-rail-wrapper">
      <div className="category-rail" ref={rail} aria-label="Filter by category">
        <CategoryChip
          category={{ id: 'all', shortName: allLabel, icon: 'sparkles' }}
          selected={selected === 'all'}
          onClick={() => onSelect('all')}
        />
        {categories.map((c) => (
          <CategoryChip
            category={c}
            key={c.id}
            selected={selected === c.id}
            onClick={() => onSelect(c.id)}
          />
        ))}
      </div>
      <button
        className="rail-next"
        aria-label="More categories"
        onClick={() => rail.current?.scrollBy({ left: 200, behavior: 'smooth' })}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
