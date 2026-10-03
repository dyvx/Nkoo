'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  VolumeX,
  LoaderCircle,
} from 'lucide-react';
import clsx from 'clsx';
import type { Video, VideoSource } from '@/types';
import { APP_CONFIG } from '@/lib/config';
import { sourceProvider } from '@/lib/providers';
import { useLibrary, useToast } from '../AppProviders';
import PlayerControls from './PlayerControls';
export default function VideoPlayer({ video, onEnded }: { video: Video; onEnded?: () => void }) {
  const [source, setSource] = useState<VideoSource | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(APP_CONFIG.player.previewDuration);
  const [volume, setVolume] = useState(APP_CONFIG.player.defaultVolume);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [fallbackFullscreen, setFallbackFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [settings, setSettings] = useState<'main' | 'speed' | 'quality' | null>(null);
  const [buffering, setBuffering] = useState(false);
  const media = useRef<HTMLVideoElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRecorded = useRef(0);
  const resumed = useRef(false);
  const { state, ready, recordWatch, updatePreferences } = useLibrary();
  const { notify } = useToast();
  const prefs = state.preferences;
  const savedProgress = useRef(state.history.find((h) => h.videoId === video.id)?.progress || 0);
  const restoreAfterQualityChange = useRef<{ time: number; playing: boolean } | null>(null);
  const rendition = source?.renditions.find((r) => r.quality === prefs.quality);
  const mediaUrl = rendition?.url || source?.url;
  const mediaMime = rendition?.mimeType || source?.mimeType;
  const selectQuality = (quality: string) => {
    const nextUrl = source?.renditions.find((r) => r.quality === quality)?.url || source?.url;
    if (nextUrl !== mediaUrl && media.current) {
      restoreAfterQualityChange.current = {
        time: media.current.currentTime,
        playing: !media.current.paused,
      };
    }
    updatePreferences({ quality });
    setSettings(null);
    notify(`${quality === 'Auto' ? 'Automatic quality' : quality} selected`);
  };
  useEffect(() => {
    // Wait for local persistence before selecting a resume position. Do not restart on time updates.
    if (!ready) return;
    savedProgress.current = state.history.find((h) => h.videoId === video.id)?.progress || 0;
    const controller = new AbortController();
    setError(false);
    setSource(null);
    resumed.current = false;
    sourceProvider
      .getSource(video, controller.signal)
      .then((s) => {
        if (!controller.signal.aborted) setSource(s);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [video, retry, ready]);
  useEffect(() => {
    if (media.current) media.current.playbackRate = prefs.playbackRate;
  }, [prefs.playbackRate, source]);
  useEffect(() => {
    if (media.current) {
      Array.from(media.current.textTracks).forEach((track) => {
        track.mode = prefs.captions ? 'showing' : 'disabled';
      });
    }
  }, [prefs.captions, source]);
  useEffect(() => {
    const change = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', change);
    return () => document.removeEventListener('fullscreenchange', change);
  }, []);
  useEffect(() => {
    if (!settings) return;
    const close = (e: PointerEvent) => {
      if (
        !settingsRef.current?.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('[aria-label="Player settings"]')
      )
        setSettings(null);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [settings]);
  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (!fallbackFullscreen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFallbackFullscreen(false);
    };
    document.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener('keydown', esc);
    };
  }, [fallbackFullscreen]);
  const record = useCallback(() => {
    const el = media.current;
    if (el) recordWatch(video.id, el.currentTime, el.duration || duration);
  }, [recordWatch, video.id, duration]);
  const togglePlay = async () => {
    const el = media.current;
    if (!el) return;
    try {
      if (el.paused) {
        if (el.ended) {
          el.currentTime = 0;
          setEnded(false);
        }
        await el.play();
      } else el.pause();
    } catch {
      notify('Playback is unavailable. Try opening the preview in a new browser tab.', 'info');
    }
  };
  const seek = (time: number) => {
    if (media.current) {
      media.current.currentTime = Math.min(Math.max(0, time), duration);
      setCurrent(media.current.currentTime);
      setEnded(false);
    }
  };
  const changeVolume = (value: number) => {
    setVolume(value);
    setMuted(false);
    if (media.current) {
      media.current.volume = value;
      media.current.muted = false;
    }
  };
  const toggleMute = () => {
    const value = !muted;
    setMuted(value);
    if (media.current) media.current.muted = value;
  };
  const toggleFullscreen = async () => {
    try {
      if (fallbackFullscreen) {
        setFallbackFullscreen(false);
        return;
      }
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (wrapper.current?.requestFullscreen) await wrapper.current.requestFullscreen();
      else setFallbackFullscreen(true);
    } catch {
      setFallbackFullscreen((v) => !v);
    }
  };
  const pip = async () => {
    const el = media.current;
    if (!el) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else if (document.pictureInPictureEnabled && el.requestPictureInPicture) {
        if (el.readyState < 2) {
          notify('Press play before opening picture-in-picture.', 'info');
          return;
        }
        await el.requestPictureInPicture();
      } else notify('Picture-in-picture is supported in compatible standalone browsers.', 'info');
    } catch {
      notify('Your browser has picture-in-picture disabled for this preview.', 'info');
    }
  };
  const wake = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing)
      hideTimer.current = setTimeout(
        () => setShowControls(false),
        APP_CONFIG.player.controlsIdleMs,
      );
  };
  return (
    <div
      ref={wrapper}
      className={clsx('video-player', fallbackFullscreen && 'fallback-fullscreen')}
      tabIndex={0}
      role="region"
      aria-label="Demo video player. K to play, arrows to seek, M to mute, F for fullscreen."
      onPointerMove={wake}
      onPointerLeave={() => playing && !settings && setShowControls(false)}
      onFocus={() => setShowControls(true)}
      onKeyDown={(e) => {
        const tag = (e.target as HTMLElement).tagName;
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) return;
        if (e.key === 'Escape') {
          setSettings(null);
          setFallbackFullscreen(false);
        }
        if ((e.key === ' ' && tag !== 'BUTTON') || e.key.toLowerCase() === 'k') {
          e.preventDefault();
          void togglePlay();
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          seek(current + APP_CONFIG.player.seekStep);
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          seek(current - APP_CONFIG.player.seekStep);
        }
        if (e.key.toLowerCase() === 'm') toggleMute();
        if (e.key.toLowerCase() === 'f') void toggleFullscreen();
      }}
    >
      {source && (
        <video
          key={mediaUrl}
          ref={media}
          poster={source.poster}
          preload="metadata"
          playsInline
          disableRemotePlayback
          onClick={() => void togglePlay()}
          onLoadedMetadata={() => {
            const el = media.current;
            if (!el) return;
            setDuration(el.duration || source.duration);
            el.volume = volume;
            el.playbackRate = prefs.playbackRate;
            el.muted = muted;
            if (restoreAfterQualityChange.current) {
              const restore = restoreAfterQualityChange.current;
              restoreAfterQualityChange.current = null;
              el.currentTime = Math.min(restore.time, el.duration || source.duration);
              setCurrent(el.currentTime);
              if (restore.playing) void el.play().catch(() => setPlaying(false));
            } else if (
              prefs.resumePlayback &&
              !resumed.current &&
              savedProgress.current < source.duration * 0.95
            ) {
              el.currentTime = Math.min(savedProgress.current, el.duration || source.duration);
              setCurrent(el.currentTime);
            }
            resumed.current = true;
          }}
          onTimeUpdate={() => {
            const el = media.current;
            if (!el) return;
            setCurrent(el.currentTime);
            if (Math.abs(el.currentTime - lastRecorded.current) >= 4) {
              lastRecorded.current = el.currentTime;
              record();
            }
          }}
          onPlay={() => {
            setPlaying(true);
            setEnded(false);
            setBuffering(false);
            wake();
          }}
          onPause={() => {
            setPlaying(false);
            setShowControls(true);
            record();
          }}
          onWaiting={() => setBuffering(true)}
          onCanPlay={() => setBuffering(false)}
          onEnded={() => {
            setPlaying(false);
            setEnded(true);
            record();
            onEnded?.();
          }}
          onError={(e) => {
            if (e.target === media.current) setError(true);
          }}
        >
          <source src={mediaUrl} type={mediaMime} />
          {source.fallbacks?.map((f) => <source key={f.url} src={f.url} type={f.mimeType} />)}
          {source.tracks?.map((t) => (
            <track
              key={t.url}
              kind={t.kind}
              src={t.url}
              srcLang={t.language}
              label={t.label}
              default={prefs.captions}
            />
          ))}
        </video>
      )}
      <div
        className={clsx(
          'player-top-overlay',
          playing && !showControls && !settings && 'overlay-hidden',
        )}
      >
        <span className="preview-badge">
          <span /> DEMO PREVIEW
        </span>
        <span className="player-silent">
          <VolumeX size={13} /> Visual film
        </span>
      </div>
      {!source && !error && (
        <div className="player-loading">
          <LoaderCircle size={32} className="spin" />
          <span>Preparing your next watch…</span>
        </div>
      )}
      {error && (
        <div className="player-error">
          <strong>A small pause in the story.</strong>
          <p>We couldn’t load the local demo preview.</p>
          <button className="btn primary" onClick={() => setRetry((n) => n + 1)}>
            <RotateCcw size={16} /> Try again
          </button>
        </div>
      )}
      {source && !playing && !error && (
        <button
          className="center-play"
          onClick={() => void togglePlay()}
          aria-label={ended ? 'Replay preview' : 'Play preview'}
        >
          {ended ? <RotateCcw size={30} /> : <Play size={32} fill="currentColor" />}
        </button>
      )}
      {buffering && playing && (
        <div className="buffering-indicator" role="status" aria-label="Buffering">
          <LoaderCircle size={32} className="spin" />
        </div>
      )}
      {settings && (
        <div
          className="player-settings"
          ref={settingsRef}
          role="dialog"
          aria-label="Playback settings"
        >
          <div className="player-settings-header">
            {settings !== 'main' && (
              <button
                className="player-button"
                aria-label="Back to settings"
                onClick={() => setSettings('main')}
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <strong>
              {settings === 'main'
                ? 'Playback settings'
                : settings === 'speed'
                  ? 'Playback speed'
                  : 'Video quality'}
            </strong>
            <button
              className="player-button"
              aria-label="Close player settings"
              onClick={() => setSettings(null)}
            >
              <X size={16} />
            </button>
          </div>
          {settings === 'main' ? (
            <>
              <button className="player-setting-option" onClick={() => setSettings('speed')}>
                <span>Playback speed</span>
                <small>{prefs.playbackRate === 1 ? 'Normal' : `${prefs.playbackRate}×`}</small>
                <ChevronRight size={16} />
              </button>
              <button className="player-setting-option" onClick={() => setSettings('quality')}>
                <span>Quality</span>
                <small>{prefs.quality === 'Auto' ? 'Auto (720p)' : prefs.quality}</small>
                <ChevronRight size={16} />
              </button>
              <p className="player-settings-note">
                Silent, original visual preview.
                <br />
                Keyboard: K play · ← → seek · F fullscreen
              </p>
            </>
          ) : settings === 'speed' ? (
            APP_CONFIG.player.rates.map((rate) => (
              <button
                key={rate}
                className="player-setting-option"
                onClick={() => {
                  updatePreferences({ playbackRate: rate });
                  setSettings(null);
                }}
              >
                <span>{rate === 1 ? 'Normal' : `${rate}×`}</span>
                {prefs.playbackRate === rate && <Check size={16} />}
              </button>
            ))
          ) : (
            <>
              {[
                { quality: 'Auto', label: 'Auto · Best available' },
                ...(source?.renditions || []),
              ].map((r) => (
                <button
                  key={r.quality}
                  className="player-setting-option"
                  onClick={() => selectQuality(r.quality)}
                >
                  <span>{r.label}</span>
                  {prefs.quality === r.quality && <Check size={16} />}
                </button>
              ))}
              <p className="player-settings-note">
                This demo includes one 720p source.
                <br />
                Future sources can offer more renditions.
              </p>
            </>
          )}
        </div>
      )}
      {source && !error && (
        <PlayerControls
          playing={playing}
          current={current}
          duration={duration}
          volume={volume}
          muted={muted}
          fullscreen={fullscreen || fallbackFullscreen}
          visible={showControls || !playing || !!settings}
          onTogglePlay={() => void togglePlay()}
          onSeek={seek}
          onRelativeSeek={(seconds) => seek(current + seconds)}
          onVolume={changeVolume}
          onMute={toggleMute}
          onFullscreen={() => void toggleFullscreen()}
          onSettings={() => setSettings((s) => (s ? null : 'main'))}
          onPip={() => void pip()}
        />
      )}
    </div>
  );
}
