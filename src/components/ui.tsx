'use client';
import { useEffect, useRef, useState, useId, type ReactNode, type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Home,
  TrendingUp,
  Grid2X2,
  Sparkles,
  Library,
  Play,
  Bookmark,
  History,
  ListVideo,
  Compass,
  Search,
  User,
  Mountain,
  Headphones,
  Shapes,
  Utensils,
  Leaf,
  Clapperboard,
  Orbit,
  Gamepad2,
  X,
  ChevronDown,
  ArrowRight,
  Check,
  FolderPlus,
  Share2,
  Link2,
  CheckCircle2,
  MoreHorizontal,
  type LucideProps,
} from 'lucide-react';
import clsx from 'clsx';
import type { Creator, Video } from '@/types';
import { APP_CONFIG } from '@/lib/config';
import { useLibrary, useToast } from './AppProviders';
export const iconMap: Record<string, ComponentType<LucideProps>> = {
  home: Home,
  trending: TrendingUp,
  grid: Grid2X2,
  sparkles: Sparkles,
  library: Library,
  play: Play,
  bookmark: Bookmark,
  history: History,
  playlist: ListVideo,
  compass: Compass,
  search: Search,
  user: User,
  mountain: Mountain,
  headphones: Headphones,
  shapes: Shapes,
  utensils: Utensils,
  leaf: Leaf,
  film: Clapperboard,
  orbit: Orbit,
  gamepad: Gamepad2,
};
export function Icon({ name, ...props }: LucideProps & { name: string }) {
  const Component = iconMap[name] || Play;
  return <Component size={19} strokeWidth={1.7} {...props} />;
}
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label={`${APP_CONFIG.brand.name} home`}>
      <svg className="brand-mark" viewBox="0 0 36 36" aria-hidden="true">
        <path d="M3 7h9l9 24h-9z" fill="currentColor" />
        <path d="M23 7h10L21 31h-9z" fill="currentColor" />
      </svg>
      {!compact && (
        <span>
          {APP_CONFIG.brand.name.toLowerCase()}
          <span className="brand-period">.</span>
        </span>
      )}
    </Link>
  );
}
export function Avatar({
  creator,
  size = 32,
}: {
  creator: Pick<Creator, 'initials' | 'avatarColor'>;
  size?: number;
}) {
  return (
    <span
      className="creator-avatar"
      style={{ width: size, height: size, background: creator.avatarColor, fontSize: size * 0.3 }}
      aria-hidden="true"
    >
      {creator.initials}
    </span>
  );
}
export function Verified() {
  return <CheckCircle2 className="verified" size={12} aria-label="Verified demo creator" />;
}
export function Modal({
  open,
  onClose,
  title,
  children,
  className = '',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const prior = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () =>
      Array.from(
        dialog.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex="0"]',
        ) || [],
      ).filter((el) => el.offsetParent !== null);
    const timeout = setTimeout(() => {
      const input = dialog.current?.querySelector<HTMLElement>('[data-autofocus]');
      (input || focusable()[0] || dialog.current)?.focus();
    }, 30);
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
      }
      if (e.key === 'Tab') {
        const nodes = focusable();
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (!nodes.length) {
          e.preventDefault();
          dialog.current?.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', key);
      prior?.focus();
    };
  }, [open]);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={clsx('modal', className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialog}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  checked?: boolean;
}
export function Dropdown({
  items,
  label = 'Open menu',
  children,
  className = '',
}: {
  items: MenuItem[];
  label?: string;
  children?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    menu.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  return (
    <div className={clsx('dropdown', className)} ref={root}>
      <button
        ref={button}
        className={children ? 'dropdown-trigger' : 'icon-button small'}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        {children || <MoreHorizontal size={20} />}
      </button>
      {open && (
        <div
          className="dropdown-menu"
          id={id}
          role="menu"
          ref={menu}
          onKeyDown={(e) => {
            const buttons = Array.from(menu.current?.querySelectorAll('button') || []);
            const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
            if (e.key === 'Escape') {
              setOpen(false);
              button.current?.focus();
            }
            if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
              e.preventDefault();
              const next =
                e.key === 'Home'
                  ? 0
                  : e.key === 'End'
                    ? buttons.length - 1
                    : (index + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
              buttons[next]?.focus();
            }
          }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              className={clsx('menu-item', item.danger && 'danger')}
              onClick={() => {
                item.onClick();
                setOpen(false);
                button.current?.focus();
              }}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.checked && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export function EmptyState({
  icon = 'search',
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={30} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function LoadingSkeleton({ count = 8, list = false }: { count?: number; list?: boolean }) {
  return (
    <div className={list ? 'video-list' : 'video-grid'} aria-label="Loading videos" role="status">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={list ? 'skeleton-card skeleton-list' : 'skeleton-card'}>
          <div className="skeleton skeleton-image" />
          <div className="skeleton-lines">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-subtitle" />
            <div className="skeleton skeleton-meta" />
          </div>
        </div>
      ))}
    </div>
  );
}
export function SectionHeader({
  title,
  subtitle,
  href,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  icon?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        <h2>
          {icon && <Icon name={icon} size={20} />} {title}
        </h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="section-header-actions">
        {children}
        {href && (
          <Link href={href} className="text-link">
            View all <ArrowRight size={15} />
          </Link>
        )}
      </div>
    </div>
  );
}
export function ShareModal({
  video,
  open,
  onClose,
}: {
  video: Video;
  open: boolean;
  onClose: () => void;
}) {
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/video/${video.id}`
      : `/video/${video.id}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      notify('Link copied to clipboard');
    } catch {
      notify('Select the link and copy it with your keyboard', 'info');
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Good stories are better shared">
      <p className="modal-description">Send someone a little inspiration.</p>
      <div className="share-preview">
        <img src={video.thumbnail} alt="" />
        <div>
          <span className="eyebrow">SHARE THIS FILM</span>
          <h3>{video.title}</h3>
        </div>
      </div>
      <label className="field-label" htmlFor="share-url">
        Video link
      </label>
      <div className="copy-field">
        <input id="share-url" value={url} readOnly onFocus={(e) => e.target.select()} />
        <button className="btn primary" onClick={copy}>
          {copied ? <Check size={16} /> : <Link2 size={16} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
        <button
          className="btn secondary full-width"
          onClick={async () => {
            try {
              await navigator.share({ title: video.title, url });
            } catch {}
          }}
        >
          <Share2 size={16} /> Share with an app
        </button>
      )}
    </Modal>
  );
}
export function PlaylistModal({
  videoId,
  open,
  onClose,
}: {
  videoId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { state, togglePlaylistVideo, createPlaylist } = useLibrary();
  const [title, setTitle] = useState('');
  return (
    <Modal open={open} onClose={onClose} title="Add to a playlist">
      <p className="modal-description">Keep good finds together. Changes save automatically.</p>
      <div className="playlist-options">
        {state.playlists.map((p) => (
          <button
            className="playlist-option"
            key={p.id}
            aria-pressed={p.videoIds.includes(videoId)}
            onClick={() => togglePlaylistVideo(p.id, videoId)}
          >
            <span className="playlist-option-icon">
              <ListVideo size={21} />
            </span>
            <span>
              <strong>{p.title}</strong>
              <small>{p.videoIds.length} videos</small>
            </span>
            <span className={clsx('check-box', p.videoIds.includes(videoId) && 'checked')}>
              {p.videoIds.includes(videoId) && <Check size={15} />}
            </span>
          </button>
        ))}
      </div>
      <form
        className="inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) {
            const id = createPlaylist(title.trim());
            togglePlaylistVideo(id, videoId);
            setTitle('');
          }
        }}
      >
        <input
          aria-label="New playlist name"
          placeholder="Create a new playlist"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
        />
        <button className="btn secondary" type="submit" disabled={!title.trim()}>
          <FolderPlus size={18} />
          <span>Create</span>
        </button>
      </form>
      <button className="btn primary full-width" onClick={onClose}>
        Done <Check size={17} />
      </button>
    </Modal>
  );
}
export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="preference-row">
      <div>
        <strong>{label}</strong>
        {description && <p>{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={clsx('toggle', checked && 'on')}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}
export function SelectField({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="select-field">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={15} />
    </label>
  );
}
