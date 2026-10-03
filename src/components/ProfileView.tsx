'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Pencil,
  Bookmark,
  History,
  ListVideo,
  Moon,
  Sun,
  Monitor,
  Check,
  RotateCcw,
  Settings2,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import type { Theme, Video } from '@/types';
import { APP_CONFIG } from '@/lib/config';
import { fullDate, initials } from '@/lib/utils';
import { useCatalog, useLibrary } from './AppProviders';
import { Modal, SectionHeader, Toggle, SelectField, EmptyState } from './ui';
import { VideoGrid } from './VideoCard';
export default function ProfileView() {
  const { videos } = useCatalog();
  const { state, updateUser, updatePreferences, resetDemo } = useLibrary();
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get('tab') || 'overview';
  const [edit, setEdit] = useState(false);
  const [reset, setReset] = useState(false);
  const [name, setName] = useState(state.user.name);
  const [username, setUsername] = useState(state.user.username);
  const [bio, setBio] = useState(state.user.bio);
  const get = (ids: string[]) =>
    ids.map((id) => videos.find((v) => v.id === id)).filter((v): v is Video => !!v);
  const saved = get(state.savedIds).slice(0, 4);
  const history = get(state.history.map((h) => h.videoId)).slice(0, 4);
  const prefs = state.preferences;
  return (
    <div className="profile-page">
      <div className="page-heading">
        <span className="eyebrow accent-text">A SPACE THAT’S A LITTLE MORE YOU</span>
        <h1>{tab === 'preferences' ? 'Make yourself at home.' : 'Your world of good stories.'}</h1>
        <p>
          {tab === 'preferences'
            ? 'A few small preferences for a better viewing experience.'
            : 'Your discoveries, your favorites, your own kind of curiosity.'}
        </p>
      </div>
      <div className="profile-banner">
        <div className="user-avatar profile-avatar">{state.user.initials}</div>
        <div className="profile-identity">
          <span className="demo-account-pill">DEMO EXPLORER</span>
          <h2>{state.user.name}</h2>
          <span>@{state.user.username}</span>
          <p>{state.user.bio}</p>
        </div>
        <button
          className="btn secondary"
          onClick={() => {
            setName(state.user.name);
            setUsername(state.user.username);
            setBio(state.user.bio);
            setEdit(true);
          }}
        >
          <Pencil size={15} /> Edit profile
        </button>
      </div>
      <div className="profile-stats">
        <Link href="/library?tab=saved">
          <Bookmark size={19} />
          <strong>{state.savedIds.length}</strong>
          <span>Saved stories</span>
        </Link>
        <Link href="/library?tab=history">
          <History size={19} />
          <strong>{state.history.length}</strong>
          <span>Films explored</span>
        </Link>
        <Link href="/library?tab=playlists">
          <ListVideo size={19} />
          <strong>{state.playlists.length}</strong>
          <span>Collections made</span>
        </Link>
      </div>
      <div className="page-tabs">
        <button
          className={clsx(tab === 'overview' && 'active')}
          aria-pressed={tab === 'overview'}
          onClick={() => router.replace('/profile', { scroll: false })}
        >
          Overview
        </button>
        <button
          className={clsx(tab === 'preferences' && 'active')}
          aria-pressed={tab === 'preferences'}
          onClick={() => router.replace('/profile?tab=preferences', { scroll: false })}
        >
          <Settings2 size={15} /> Preferences
        </button>
      </div>
      {tab === 'preferences' ? (
        <div className="preferences-layout">
          <div>
            <section className="settings-panel">
              <div className="settings-panel-title">
                <Moon size={19} />
                <div>
                  <h2>A look that feels right</h2>
                  <p>Choose your preferred appearance.</p>
                </div>
              </div>
              <div className="theme-options">
                {[
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'system', label: 'System', icon: Monitor },
                ].map((t) => (
                  <button
                    key={t.id}
                    className={clsx('theme-option', prefs.theme === t.id && 'active')}
                    aria-pressed={prefs.theme === t.id}
                    onClick={() => updatePreferences({ theme: t.id as Theme })}
                  >
                    <t.icon size={25} />
                    <span>{t.label}</span>
                    {prefs.theme === t.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            </section>
            <section className="settings-panel">
              <div className="settings-panel-title">
                <Settings2 size={19} />
                <div>
                  <h2>Your viewing rhythm</h2>
                  <p>A few small things that make a difference.</p>
                </div>
              </div>
              <Toggle
                label="Autoplay the next video"
                description="Let another good story find you when one ends."
                checked={prefs.autoplay}
                onChange={(autoplay) => updatePreferences({ autoplay })}
              />
              <Toggle
                label="Pick up where you left off"
                description="Resume films from your last saved position."
                checked={prefs.resumePlayback}
                onChange={(resumePlayback) => updatePreferences({ resumePlayback })}
              />
              <Toggle
                label="Prefer captions"
                description="Enable captions when a future source includes them. Demo previews are silent."
                checked={prefs.captions}
                onChange={(captions) => updatePreferences({ captions })}
              />
              <div className="preference-row">
                <div>
                  <strong>Default playback speed</strong>
                  <p>Find a pace that works for you.</p>
                </div>
                <SelectField
                  label="Default playback speed"
                  value={String(prefs.playbackRate)}
                  onChange={(v) => updatePreferences({ playbackRate: Number(v) })}
                  options={APP_CONFIG.player.rates.map((rate) => ({
                    value: String(rate),
                    label: rate === 1 ? 'Normal' : `${rate}×`,
                  }))}
                />
              </div>
              <div className="preference-row">
                <div>
                  <strong>Preferred video quality</strong>
                  <p>The demo includes a local 720p preview.</p>
                </div>
                <SelectField
                  label="Preferred video quality"
                  value={prefs.quality}
                  onChange={(quality) => updatePreferences({ quality })}
                  options={[
                    { value: 'Auto', label: 'Auto' },
                    { value: '720p', label: '720p' },
                  ]}
                />
              </div>
              <span className="auto-save-note">
                <Check size={13} /> Preferences save automatically.
              </span>
            </section>
          </div>
          <aside>
            <section className="settings-panel privacy-panel">
              <ShieldCheck size={27} />
              <h2>Just on this device.</h2>
              <p>
                No account. No tracking. No external services. Your demo library and preferences
                live in your browser’s local storage.
              </p>
              <span className="small-label">LOCAL-FIRST DEMO</span>
            </section>
            <section className="settings-panel">
              <h2>A fresh start</h2>
              <p className="panel-description">
                Reset your profile, preferences, and library to the original demo state.
              </p>
              <button className="btn secondary full-width" onClick={() => setReset(true)}>
                <RotateCcw size={15} /> Reset demo data
              </button>
            </section>
          </aside>
        </div>
      ) : (
        <>
          <div className="profile-info-row">
            <span>
              <CalendarDays size={15} /> Exploring since {fullDate(state.user.joinedAt)}
            </span>
            <span>
              <ShieldCheck size={15} /> Local demo account · {state.user.email}
            </span>
          </div>
          <section className="content-section">
            <SectionHeader
              title="Your saved stories"
              subtitle="A few favorites worth keeping close."
              icon="bookmark"
              href="/library?tab=saved"
            />
            {saved.length ? (
              <VideoGrid videos={saved} />
            ) : (
              <EmptyState
                icon="bookmark"
                title="Your next favorite is out there"
                description="Save a video and you’ll find it here."
                action={
                  <Link className="btn primary" href="/search">
                    Discover something good
                  </Link>
                }
              />
            )}
          </section>
          <section className="content-section">
            <SectionHeader title="Recently explored" icon="history" href="/library?tab=history" />
            {history.length ? (
              <VideoGrid videos={history} />
            ) : (
              <EmptyState
                icon="history"
                title="Let your curiosity lead"
                description="Your watch history will appear here when you start a film."
              />
            )}
          </section>
        </>
      )}
      <Modal open={edit} onClose={() => setEdit(false)} title="A little more you">
        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim() && username.trim()) {
              updateUser({
                name: name.trim(),
                username: username.trim(),
                bio: bio.trim(),
                initials: initials(name),
              });
              setEdit(false);
            }
          }}
        >
          <p className="modal-description">No sign-in required. Make this demo space your own.</p>
          <label>
            Display name
            <input
              required
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-autofocus
            />
          </label>
          <label>
            Username
            <div className="input-prefix">
              <span>@</span>
              <input
                required
                maxLength={30}
                pattern="[a-zA-Z0-9_.]+"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.]/g, ''))}
              />
            </div>
          </label>
          <label>
            A little about you
            <textarea
              aria-label="A little about you"
              rows={3}
              maxLength={200}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>
          <div className="modal-form-actions">
            <button type="button" className="btn secondary" onClick={() => setEdit(false)}>
              Cancel
            </button>
            <button className="btn primary" type="submit">
              <Check size={16} /> Save changes
            </button>
          </div>
        </form>
      </Modal>
      <Modal open={reset} onClose={() => setReset(false)} title="Back to the beginning?">
        <p className="modal-description">
          This replaces your current local profile, saved videos, playlists, and preferences with
          the original demo. It only affects this browser.
        </p>
        <div className="modal-form-actions">
          <button className="btn secondary" onClick={() => setReset(false)}>
            Keep my changes
          </button>
          <button
            className="btn primary"
            onClick={() => {
              resetDemo();
              setReset(false);
            }}
          >
            Reset demo
          </button>
        </div>
      </Modal>
    </div>
  );
}
