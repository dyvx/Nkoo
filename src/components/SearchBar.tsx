'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowUpLeft, History, X, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { useCatalog, useLibrary } from './AppProviders';
export default function SearchBar({
  large = false,
  autofocus = false,
  initialValue = '',
  onSubmit,
  hideSuggestions = false,
}: {
  large?: boolean;
  autofocus?: boolean;
  initialValue?: string;
  onSubmit?: (q: string) => void;
  hideSuggestions?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { videos } = useCatalog();
  const { state, addRecentSearch, clearRecentSearches } = useLibrary();
  useEffect(() => setValue(initialValue), [initialValue]);
  useEffect(() => {
    if (autofocus) input.current?.focus();
  }, [autofocus]);
  useEffect(() => {
    if (large) return;
    const key = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) &&
        !target.isContentEditable
      ) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [large]);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  const q = value.trim().toLowerCase();
  const suggestions = q
    ? videos
        .filter(
          (v) =>
            v.title.toLowerCase().includes(q) || v.tags.some((t) => t.toLowerCase().includes(q)),
        )
        .slice(0, 4)
        .map((v) => v.title)
    : state.recentSearches.slice(0, 4);
  const submit = (query = value) => {
    setValue(query);
    setFocused(false);
    input.current?.blur();
    addRecentSearch(query);
    if (onSubmit) onSubmit(query);
    else router.push(`/search${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  };
  return (
    <div className={clsx('search-container', large && 'search-large')} ref={root}>
      <form
        className="search-form"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Search className="search-icon" size={large ? 22 : 19} />
        <input
          ref={input}
          type="search"
          aria-label={large ? 'Search the collection' : 'Search videos'}
          placeholder={large ? 'What are you curious about?' : 'Search for something good'}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setFocused(true);
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setFocused(false);
            if (e.key === 'ArrowDown' && focused) {
              e.preventDefault();
              root.current?.querySelector<HTMLButtonElement>('.suggestion-button')?.focus();
            }
          }}
          data-autofocus={autofocus || undefined}
          autoComplete="off"
        />
        {value && !large && (
          <button
            type="button"
            className="search-clear"
            aria-label="Clear search"
            onClick={() => {
              setValue('');
              input.current?.focus();
            }}
          >
            <X size={14} />
          </button>
        )}
        {large ? (
          <button className="btn primary search-submit" type="submit" aria-label="Search">
            <Search size={17} />
            <span>Search</span>
          </button>
        ) : (
          <kbd className="search-shortcut">/</kbd>
        )}
      </form>
      {focused && !hideSuggestions && (
        <div className="search-suggestions">
          <div className="suggestion-heading">
            <span>
              {q
                ? 'SUGGESTED FOR YOU'
                : state.recentSearches.length
                  ? 'RECENT SEARCHES'
                  : 'A LITTLE INSPIRATION'}
            </span>
            {!q && state.recentSearches.length > 0 && (
              <button onClick={clearRecentSearches}>Clear</button>
            )}
          </div>
          {(suggestions.length
            ? suggestions
            : q
              ? []
              : ['Cinematic', 'Nature', 'Creative process', 'Travel']
          ).map((s) => (
            <button type="button" className="suggestion-button" key={s} onClick={() => submit(s)}>
              {q ? (
                <Search size={16} />
              ) : state.recentSearches.length ? (
                <History size={16} />
              ) : (
                <TrendingUp size={16} />
              )}
              <span>{s}</span>
              <ArrowUpLeft size={15} />
            </button>
          ))}
          {q && !suggestions.length && (
            <button className="suggestion-button" onClick={() => submit()}>
              <Search size={16} />
              <span>Search for “{value}”</span>
              <ArrowUpLeft size={15} />
            </button>
          )}
          <div className="suggestion-footer">Good things are one search away.</div>
        </div>
      )}
    </div>
  );
}
