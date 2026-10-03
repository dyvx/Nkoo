'use client';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { useCatalog } from './AppProviders';
import type { Category } from '@/types';
import { Icon, SectionHeader } from './ui';
import { formatCount } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/config';
export function CategoryCard({
  category,
  featured = false,
}: {
  category: Category;
  featured?: boolean;
}) {
  const { videos } = useCatalog();
  const count = videos.filter((v) => v.categoryId === category.id).length;
  return (
    <Link
      href={`/search?category=${category.id}`}
      className={`category-card ${featured ? 'featured-category' : ''}`}
    >
      <img src={category.image} alt="" loading="lazy" />
      <div className="category-card-shade" />
      <div className="category-card-top">
        <span className="category-icon">
          <Icon name={category.icon} size={20} />
        </span>
        {featured && <span className="small-label">EDITOR’S PICK</span>}
      </div>
      <div className="category-card-bottom">
        <div>
          <h3>{category.name}</h3>
          {featured && <p>{category.description}</p>}
          <span>{count} demo videos</span>
        </div>
        <ArrowUpRight size={22} />
      </div>
    </Link>
  );
}
export default function CategoriesView() {
  const { categories, videos } = useCatalog();
  const featured = categories
    .filter((c) => c.featured)
    .slice(0, APP_CONFIG.discovery.featuredCount);
  const popular = [...categories]
    .sort(
      (a, b) =>
        videos.filter((v) => v.categoryId === b.id).reduce((n, v) => n + v.views, 0) -
        videos.filter((v) => v.categoryId === a.id).reduce((n, v) => n + v.views, 0),
    )
    .slice(0, APP_CONFIG.discovery.categoryListCount);
  const active = [...categories]
    .sort(
      (a, b) =>
        Math.max(
          ...videos.filter((v) => v.categoryId === b.id).map((v) => Date.parse(v.publishedAt)),
        ) -
        Math.max(
          ...videos.filter((v) => v.categoryId === a.id).map((v) => Date.parse(v.publishedAt)),
        ),
    )
    .slice(0, APP_CONFIG.discovery.categoryListCount);
  return (
    <div className="categories-page">
      <div className="page-heading">
        <span className="eyebrow accent-text">DIFFERENT WORLDS. SAME CURIOSITY.</span>
        <h1>Find your kind of wonder.</h1>
        <p>
          From wide-open landscapes to the tiniest details. There’s a story for every side of you.
        </p>
      </div>
      <section className="content-section first-section">
        <SectionHeader
          title="Start somewhere unexpected"
          subtitle="A few collections we think you’ll love."
          icon="compass"
        />
        <div className="featured-category-grid">
          {featured.map((c) => (
            <CategoryCard category={c} key={c.id} featured />
          ))}
        </div>
      </section>
      <section className="content-section">
        <SectionHeader
          title="Explore every corner"
          subtitle={`${categories.length} categories. ${videos.length} stories. Endless possibilities.`}
        />
        <div className="category-grid">
          {categories.map((c) => (
            <CategoryCard category={c} key={c.id} />
          ))}
        </div>
      </section>
      <div className="category-discovery-bottom">
        <section className="discovery-panel">
          <SectionHeader title="Popular right now" icon="trending" />
          {popular.map((c, i) => (
            <Link
              key={c.id}
              href={`/search?category=${c.id}&sort=popular`}
              className="category-ranking"
            >
              <span className="ranking-number">0{i + 1}</span>
              <img src={c.thumbnail || c.image} alt="" loading="lazy" />
              <div>
                <strong>{c.name}</strong>
                <span>
                  {formatCount(
                    videos.filter((v) => v.categoryId === c.id).reduce((n, v) => n + v.views, 0),
                  )}{' '}
                  demo views
                </span>
              </div>
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </section>
        <section className="discovery-panel">
          <SectionHeader title="Fresh perspectives" icon="sparkles" />
          {active.map((c) => (
            <Link
              key={c.id}
              href={`/search?category=${c.id}&sort=latest`}
              className="active-category"
            >
              <span className="active-category-icon">
                <Icon name={c.icon} size={23} />
              </span>
              <div>
                <strong>{c.name}</strong>
                <span>New stories waiting for you</span>
              </div>
              <span className="new-pill">NEW</span>
              <ArrowRight size={17} />
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
