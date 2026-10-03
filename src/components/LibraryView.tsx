'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, ListVideo, Trash2, ArrowUpRight, Check } from 'lucide-react';
import clsx from 'clsx';
import { useCatalog, useLibrary } from './AppProviders';
import type { Playlist, Video } from '@/types';
import { APP_CONFIG } from '@/lib/config';
import { VideoCard, VideoGrid } from './VideoCard';
import { EmptyState, Modal, SectionHeader } from './ui';
export function PlaylistCard({ playlist, onClick }: { playlist: Playlist; onClick: () => void }) {
  const { videos } = useCatalog();
  const cover = videos.find((v) => v.id === playlist.videoIds[0]);
  return (
    <button className="playlist-card" onClick={onClick}>
      <div className="playlist-card-cover">
        {cover ? (
          <img src={cover.thumbnail} alt="" loading="lazy" />
        ) : (
          <div className="playlist-blank">
            <ListVideo size={38} />
          </div>
        )}
        <div className="playlist-cover-shade" />
        <span className="playlist-count">
          <ListVideo size={17} />
          {playlist.videoIds.length} videos
        </span>
        <span className="playlist-hover">
          <ArrowUpRight size={26} />
        </span>
      </div>
      <div className="playlist-card-info">
        <h3>{playlist.title}</h3>
        <p>{playlist.description || 'A collection of your favorite finds.'}</p>
      </div>
    </button>
  );
}
export default function LibraryView() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = params.get('tab') || 'all';
  const { videos } = useCatalog();
  const { state, clearHistory, createPlaylist, deletePlaylist } = useLibrary();
  const [create, setCreate] = useState(false);
  const [clear, setClear] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const byIds = (ids: string[]) =>
    ids.map((id) => videos.find((v) => v.id === id)).filter((v): v is Video => !!v);
  const saved = byIds(state.savedIds);
  const history = byIds(state.history.map((h) => h.videoId));
  const continuing = byIds(
    state.history
      .filter((h) => h.progress / h.duration < 0.95 && h.progress > 0)
      .map((h) => h.videoId),
  );
  const viewed = byIds(state.recentlyViewedIds);
  const progress = Object.fromEntries(
    state.history.map((h) => [h.videoId, h.progress / h.duration]),
  );
  const playlist = state.playlists.find((p) => p.id === selected);
  const tabs = [
    { id: 'all', label: 'Overview' },
    { id: 'continue', label: 'Continue watching', count: continuing.length },
    { id: 'saved', label: 'Saved videos', count: saved.length },
    { id: 'history', label: 'History', count: history.length },
    { id: 'playlists', label: 'Playlists', count: state.playlists.length },
  ];
  const explore = (
    <Link className="btn primary" href="/search">
      Find your next watch <ArrowUpRight size={16} />
    </Link>
  );
  return (
    <div className="library-page">
      <div className="page-heading library-heading">
        <div>
          <span className="eyebrow accent-text">GOOD STORIES, KEPT CLOSE</span>
          <h1>Your corner of {APP_CONFIG.brand.name}.</h1>
          <p>Pick up a story, revisit a favorite, or make room for your next discovery.</p>
        </div>
        <button className="btn primary" onClick={() => setCreate(true)}>
          <Plus size={17} /> New playlist
        </button>
      </div>
      <div className="page-tabs" aria-label="Library sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={clsx(tab === t.id && 'active')}
            aria-pressed={tab === t.id}
            onClick={() =>
              router.replace(t.id === 'all' ? '/library' : `/library?tab=${t.id}`, {
                scroll: false,
              })
            }
          >
            {t.label}
            {t.count !== undefined && <span>{t.count}</span>}
          </button>
        ))}
      </div>
      {(tab === 'all' || tab === 'continue') && (
        <section className="content-section first-section">
          <SectionHeader
            title="Pick up where you left off"
            subtitle="Your place is saved. Take your time."
            icon="play"
            href={tab === 'all' ? '/library?tab=continue' : undefined}
          />
          {continuing.length ? (
            <div className="continue-grid">
              {continuing.map((v) => (
                <VideoCard key={v.id} video={v} compact progress={progress[v.id]} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="play"
              title="Every story starts somewhere"
              description="Start watching a film and you can pick it up right here."
              action={explore}
            />
          )}
        </section>
      )}
      {(tab === 'all' || tab === 'saved') && (
        <section className="content-section">
          <SectionHeader
            title="Worth keeping"
            subtitle="The ones you want to come back to."
            icon="bookmark"
            href={tab === 'all' ? '/library?tab=saved' : undefined}
          />
          {saved.length ? (
            <VideoGrid videos={tab === 'all' ? saved.slice(0, 4) : saved} />
          ) : (
            <EmptyState
              icon="bookmark"
              title="Make room for your favorites"
              description="Tap the bookmark on any video to save it to your personal collection."
              action={explore}
            />
          )}
        </section>
      )}
      {(tab === 'all' || tab === 'playlists') && (
        <section className="content-section">
          <SectionHeader
            title="Your collections"
            subtitle="Little rabbit holes, neatly organized."
            icon="playlist"
            href={tab === 'all' ? '/library?tab=playlists' : undefined}
          />
          {state.playlists.length ? (
            <div className="playlist-grid">
              {state.playlists.map((p) => (
                <PlaylistCard playlist={p} key={p.id} onClick={() => setSelected(p.id)} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="playlist"
              title="A collection waiting to happen"
              description="Keep your discoveries together. Make your first playlist."
              action={
                <button className="btn primary" onClick={() => setCreate(true)}>
                  <Plus size={16} /> Create a playlist
                </button>
              }
            />
          )}
        </section>
      )}
      {(tab === 'all' || tab === 'history') && (
        <section className="content-section">
          <SectionHeader
            title="Your recent watches"
            subtitle="A little reminder of where your curiosity took you."
            icon="history"
            href={tab === 'all' ? '/library?tab=history' : undefined}
          >
            {tab === 'history' && history.length > 0 && (
              <button className="btn ghost" onClick={() => setClear(true)}>
                <Trash2 size={15} /> Clear history
              </button>
            )}
          </SectionHeader>
          {history.length ? (
            <VideoGrid videos={tab === 'all' ? history.slice(0, 4) : history} removeHistory />
          ) : (
            <EmptyState
              icon="history"
              title="A fresh page in your story"
              description="Videos you watch will appear here. Your history stays on this device."
              action={explore}
            />
          )}
        </section>
      )}
      {(tab === 'all' || tab === 'history') && viewed.length > 0 && (
        <section className="content-section">
          <SectionHeader
            title="Recently viewed"
            subtitle="Good finds you’ve taken a closer look at."
          />
          <VideoGrid videos={viewed.slice(0, 8)} />
        </section>
      )}
      <div className="privacy-note">
        <span className="privacy-symbol">
          <Check size={13} />
        </span>{' '}
        Just for you. Your library is stored locally on this device.
      </div>
      <Modal open={create} onClose={() => setCreate(false)} title="A new home for good finds">
        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim()) {
              createPlaylist(title.trim(), description.trim());
              setTitle('');
              setDescription('');
              setCreate(false);
            }
          }}
        >
          <p className="modal-description">
            A mood, a weekend, a spark of inspiration. Give your collection a name.
          </p>
          <label>
            Playlist name
            <input
              required
              minLength={1}
              maxLength={60}
              placeholder="e.g. A slower Sunday"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-autofocus
            />
          </label>
          <label>
            Description <span className="optional">optional</span>
            <textarea
              maxLength={200}
              placeholder="What brings these stories together?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>
          <div className="modal-form-actions">
            <button type="button" className="btn secondary" onClick={() => setCreate(false)}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={!title.trim()}>
              <Plus size={16} /> Create playlist
            </button>
          </div>
        </form>
      </Modal>
      <Modal open={clear} onClose={() => setClear(false)} title="Start with a clean slate?">
        <p className="modal-description">
          This clears your watch history, recently viewed films, and continue watching. Your saved
          videos and playlists will stay right where they are.
        </p>
        <div className="modal-form-actions">
          <button className="btn secondary" onClick={() => setClear(false)}>
            Keep my history
          </button>
          <button
            className="btn danger-button"
            onClick={() => {
              clearHistory();
              setClear(false);
            }}
          >
            Clear history
          </button>
        </div>
      </Modal>
      <Modal
        open={!!playlist}
        onClose={() => setSelected(null)}
        title={playlist?.title || 'Your playlist'}
        className="playlist-detail-modal"
      >
        {playlist && (
          <>
            <p className="modal-description">
              {playlist.description || 'A collection of your favorite finds.'}
            </p>
            <div className="playlist-detail-toolbar">
              <span>{playlist.videoIds.length} videos</span>
              <button
                className="btn ghost danger"
                onClick={() => {
                  deletePlaylist(playlist.id);
                  setSelected(null);
                }}
              >
                <Trash2 size={14} /> Delete playlist
              </button>
            </div>
            {playlist.videoIds.length ? (
              <VideoGrid videos={byIds(playlist.videoIds)} />
            ) : (
              <EmptyState
                icon="playlist"
                title="It’s a good place to start"
                description="Open any video’s options menu to add it to this collection."
                action={
                  <Link className="btn primary" href="/search" onClick={() => setSelected(null)}>
                    Discover videos <ArrowUpRight size={16} />
                  </Link>
                }
              />
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
