'use client';
import { Suspense, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Bell,
  Search,
  ChevronDown,
  Settings2,
  ArrowUpRight,
  Check,
  UserRound,
  Bookmark,
  CircleHelp,
} from 'lucide-react';
import clsx from 'clsx';
import { APP_CONFIG } from '@/lib/config';
import { useCatalog, useLibrary, useToast } from './AppProviders';
import { Icon, Logo, Modal, Dropdown } from './ui';
import SearchBar from './SearchBar';
export function Navbar() {
  const { state } = useLibrary();
  const { videos } = useCatalog();
  const [notifications, setNotifications] = useState(false);
  const [read, setRead] = useState(false);
  const [search, setSearch] = useState(false);
  const router = useRouter();
  const { notify } = useToast();
  const newest = [...videos].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3);
  return (
    <>
      <header className="navbar">
        <div className="navbar-brand">
          <Logo />
          <span className="demo-label">DEMO</span>
        </div>
        <div className="navbar-search">
          <SearchBar />
        </div>
        <nav className="top-links" aria-label="Quick navigation">
          <Link href="/categories">Discover</Link>
          <Link href="/library?tab=playlists">Collections</Link>
        </nav>
        <div className="navbar-actions">
          <button
            className="icon-button mobile-search-trigger"
            aria-label="Open search"
            onClick={() => setSearch(true)}
          >
            <Search size={21} />
          </button>
          <button
            className="icon-button notification-button"
            aria-label={read ? 'Notifications' : 'Notifications, 3 new'}
            onClick={() => setNotifications(true)}
          >
            <Bell size={20} />
            {!read && <i />}
          </button>
          <span className="nav-divider" />
          <Dropdown
            label="Account menu"
            className="account-dropdown"
            items={[
              {
                label: 'Your profile',
                icon: <UserRound size={17} />,
                onClick: () => router.push('/profile'),
              },
              {
                label: 'Saved videos',
                icon: <Bookmark size={17} />,
                onClick: () => router.push('/library?tab=saved'),
              },
              {
                label: 'Preferences',
                icon: <Settings2 size={17} />,
                onClick: () => router.push('/profile?tab=preferences'),
              },
              {
                label: 'About this demo',
                icon: <CircleHelp size={17} />,
                onClick: () =>
                  notify(
                    'A fictional streaming experience. No sign-in or external content.',
                    'info',
                  ),
              },
            ]}
          >
            <span className="user-avatar small-avatar">{state.user.initials}</span>
            <span className="nav-user-name">
              {state.user.name.split(' ')[0]}
              <ChevronDown size={13} />
            </span>
          </Dropdown>
        </div>
      </header>
      <Modal
        open={search}
        onClose={() => setSearch(false)}
        title="Find your next watch"
        className="search-modal"
      >
        <SearchBar
          large
          autofocus
          onSubmit={(q) => {
            setSearch(false);
            router.push(`/search?q=${encodeURIComponent(q)}`);
          }}
        />
        <p className="modal-description">
          Fresh perspectives. Independent stories. Something for every curious mind.
        </p>
      </Modal>
      <Modal
        open={notifications}
        onClose={() => setNotifications(false)}
        title="A few things you might like"
      >
        <div className="notification-top">
          <span>{read ? "You're all caught up" : '3 fresh finds for you'}</span>
          <button
            className="text-link"
            onClick={() => {
              setRead(true);
              notify('All notifications marked as read');
            }}
          >
            <Check size={14} /> Mark all as read
          </button>
        </div>
        {newest.map((v) => (
          <Link
            href={`/video/${v.id}`}
            onClick={() => setNotifications(false)}
            className="notification-item"
            key={v.id}
          >
            <img src={v.thumbnail} alt="" />
            <span>
              <small>NEW IN THE COLLECTION</small>
              <strong>{v.title}</strong>
              <em>{read ? 'Seen' : 'Just added'}</em>
            </span>
            {!read && <i />}
          </Link>
        ))}
        <p className="modal-footnote">Notifications are part of the local demo experience.</p>
      </Modal>
    </>
  );
}
function SidebarContent() {
  const pathname = usePathname();
  const params = useSearchParams();
  const { categories } = useCatalog();
  const { state } = useLibrary();
  const active = (href: string) => {
    const [path, query] = href.split('?');
    if (path !== pathname) return false;
    const target = new URLSearchParams(query);
    if (target.has('sort')) return target.get('sort') === params.get('sort');
    if (target.has('tab')) return target.get('tab') === params.get('tab');
    if (target.has('category')) return target.get('category') === params.get('category');
    return !query && !params.get('tab') && !params.get('sort');
  };
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar-scroll">
        <div className="nav-group">
          <span className="nav-group-label">DISCOVER</span>
          <nav>
            {APP_CONFIG.navigation.discover.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={clsx('sidebar-link', active(n.href) && 'active')}
                aria-current={active(n.href) ? 'page' : undefined}
              >
                <Icon name={n.icon} />
                <span>{n.label}</span>
                {n.label === 'New releases' && <span className="new-dot" />}
              </Link>
            ))}
          </nav>
        </div>
        <div className="sidebar-rule" />
        <div className="nav-group">
          <span className="nav-group-label">YOUR SPACE</span>
          <nav>
            {APP_CONFIG.navigation.library.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={clsx('sidebar-link', active(n.href) && 'active')}
                aria-current={active(n.href) ? 'page' : undefined}
              >
                <Icon name={n.icon} />
                <span>{n.label}</span>
                {n.icon === 'play' &&
                  state.history.filter((h) => h.progress / h.duration < 0.95).length > 0 && (
                    <span className="nav-count">
                      {state.history.filter((h) => h.progress / h.duration < 0.95).length}
                    </span>
                  )}
                {n.icon === 'bookmark' && state.savedIds.length > 0 && (
                  <span className="nav-count">{state.savedIds.length}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="sidebar-rule" />
        <div className="nav-group pinned-group">
          <span className="nav-group-label">YOUR DAILY INSPIRATION</span>
          <nav>
            {APP_CONFIG.navigation.pinnedCategories.map((id) => {
              const c = categories.find((x) => x.id === id);
              return c ? (
                <Link
                  key={id}
                  href={`/search?category=${id}`}
                  className={clsx('sidebar-link', params.get('category') === id && 'active')}
                >
                  <Icon name={c.icon} />
                  <span>{c.name}</span>
                </Link>
              ) : null;
            })}
          </nav>
          <Link href="/categories" className="browse-categories">
            Browse all categories <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="curiosity-note">
          <span className="note-star">✳</span>
          <h3>Stay curious.</h3>
          <p>
            There’s a whole world
            <br />
            worth watching.
          </p>
          <Link href="/search">
            Find something new <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
      <div className="sidebar-bottom">
        <Link href="/profile?tab=preferences" className="sidebar-link">
          <Settings2 size={18} />
          <span>Preferences</span>
        </Link>
        <p>A little more wonder. Every day.</p>
      </div>
    </aside>
  );
}
export function Sidebar() {
  return (
    <Suspense fallback={<aside className="sidebar" />}>
      <SidebarContent />
    </Suspense>
  );
}
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {APP_CONFIG.navigation.mobile.map((n) => {
        const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href);
        return (
          <Link
            href={n.href}
            key={n.href}
            className={clsx(active && 'active')}
            aria-current={active ? 'page' : undefined}
          >
            <Icon name={n.icon} size={21} />
            <span>{n.label}</span>
            {active && <i />}
          </Link>
        );
      })}
    </nav>
  );
}
export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <Sidebar />
      <main
        className={clsx('main-content', pathname.startsWith('/watch') && 'watch-main')}
        id="main-content"
      >
        <div className="page-container" key={pathname}>
          {children}
        </div>
        <footer className="page-footer">
          <span>© 2026 {APP_CONFIG.brand.name}. Stay curious.</span>
          <span>
            <i /> A fictional, independent streaming experience.
          </span>
        </footer>
      </main>
      <MobileNav />
    </div>
  );
}
