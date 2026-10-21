// ink-cursor.d.ts: types for ink-cursor.js (copy next to the .js in projects without allowJs).
import type { MotionEngine } from './motion-engine.js';

export interface InkCursorOptions {
  /** Draw on this canvas (it is never removed). Without it a canvas is created in `mount`. */
  canvas?: HTMLCanvasElement;
  /** Where a created canvas goes (default document.body). */
  mount?: Element;
  /** With `canvas`: cleanup keeps the last frame and the next init on the same canvas continues from it. */
  hold?: boolean;
  /** Dot size in CSS px (default 9). */
  size?: number;
  /** Follow factor per 60 Hz frame (default 0.18). */
  ease?: number;
  /** Speed smoothing, an EMA factor (default 0.2). */
  speedEase?: number;
  /** Smoothed speed (px per 60 Hz frame) above which the trail draws (default 1.5). */
  trailSpeed?: number;
  /** Trail length in points (default 12). */
  trailMax?: number;
  /** Dot colour (default the canvas's computed CSS color). */
  color?: string;
  /** Canvas z-index (default '9999'). */
  zIndex?: string;
}

/** Canvas cursor accent (move C-07). Returns an idempotent cleanup, also registered with engine.addCleanup. */
export function initInkCursor(engine: MotionEngine, opts?: InkCursorOptions): () => void;
