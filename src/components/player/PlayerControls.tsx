'use client';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings2,
  PictureInPicture2,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/config';
import type { CSSProperties } from 'react';
export interface PlayerControlsProps {
  playing: boolean;
  current: number;
  duration: number;
  volume: number;
  muted: boolean;
  fullscreen: boolean;
  visible: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onRelativeSeek: (seconds: number) => void;
  onVolume: (value: number) => void;
  onMute: () => void;
  onFullscreen: () => void;
  onSettings: () => void;
  onPip: () => void;
}
export default function PlayerControls(p: PlayerControlsProps) {
  return (
    <div
      className={`player-controls ${p.visible ? '' : 'controls-hidden'}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="player-progress-row">
        <input
          className="player-progress"
          type="range"
          min={0}
          max={p.duration || APP_CONFIG.player.previewDuration}
          step={0.1}
          value={Math.min(p.current, p.duration || APP_CONFIG.player.previewDuration)}
          aria-label="Seek playback"
          aria-valuetext={`${formatDuration(p.current)} of ${formatDuration(p.duration)}`}
          onChange={(e) => p.onSeek(Number(e.target.value))}
          style={
            { '--progress': `${p.duration ? (p.current / p.duration) * 100 : 0}%` } as CSSProperties
          }
        />
      </div>
      <div className="player-control-row">
        <div className="player-control-left">
          <button
            className="player-button play-control"
            onClick={p.onTogglePlay}
            aria-label={p.playing ? 'Pause' : 'Play'}
            title={p.playing ? 'Pause (K)' : 'Play (K)'}
          >
            {p.playing ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} fill="currentColor" />
            )}
          </button>
          <button
            className="player-button seek-button"
            onClick={() => p.onRelativeSeek(-APP_CONFIG.player.seekStep)}
            aria-label={`Back ${APP_CONFIG.player.seekStep} seconds`}
            title={`Back ${APP_CONFIG.player.seekStep} seconds`}
          >
            <RotateCcw size={19} />
          </button>
          <button
            className="player-button seek-button"
            onClick={() => p.onRelativeSeek(APP_CONFIG.player.seekStep)}
            aria-label={`Forward ${APP_CONFIG.player.seekStep} seconds`}
            title={`Forward ${APP_CONFIG.player.seekStep} seconds`}
          >
            <RotateCw size={19} />
          </button>
          <div className="player-volume">
            <button
              className="player-button"
              onClick={p.onMute}
              aria-label={p.muted ? 'Unmute' : 'Mute'}
              title="Volume (M)"
            >
              {p.muted || p.volume === 0 ? <VolumeX size={21} /> : <Volume2 size={21} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={p.muted ? 0 : p.volume}
              onChange={(e) => p.onVolume(Number(e.target.value))}
              aria-label="Volume"
            />
          </div>
          <span className="player-time">
            {formatDuration(p.current)} <span>/ {formatDuration(p.duration)}</span>
          </span>
        </div>
        <div className="player-control-right">
          <span className="player-hd">HD</span>
          <button
            className="player-button"
            onClick={p.onSettings}
            aria-label="Player settings"
            title="Playback settings"
          >
            <Settings2 size={21} />
          </button>
          {APP_CONFIG.player.allowPictureInPicture && (
            <button
              className="player-button pip-button"
              onClick={p.onPip}
              aria-label="Picture in picture"
              title="Picture in picture"
            >
              <PictureInPicture2 size={21} />
            </button>
          )}
          <button
            className="player-button"
            onClick={p.onFullscreen}
            aria-label={p.fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title="Fullscreen (F)"
          >
            {p.fullscreen ? <Minimize size={21} /> : <Maximize size={21} />}
          </button>
        </div>
      </div>
    </div>
  );
}
