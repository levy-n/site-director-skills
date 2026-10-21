// ink-mask.d.ts: types for ink-mask.js. Copy next to the .js in TypeScript projects without allowJs
// (the Vite react-ts default): a strict build fails on an untyped .js import (TS7016).
import type { MotionEngine } from './motion-engine.js';

export type InkDirection = 'rtl' | 'ltr' | 'down' | 'center';

export interface InkMaskOptions {
  /** Where the reveal starts. Default 'rtl' on a right-to-left page, 'ltr' otherwise. */
  direction?: InkDirection;
  /** false forces the baked tier (no filter) everywhere. */
  live?: boolean;
  /** 'baked' gives Safari the baked tier. */
  safari?: 'live' | 'baked';
  /** Displacement scale in viewBox units (default 100). */
  scale?: number;
  /** Noise octaves (default 3). */
  octaves?: number;
  /** Noise frequency per viewBox unit (default '0.045 0.055'). */
  baseFrequency?: string;
  /** Noise seed (default 5). */
  seed?: number;
  /** Edge blur in viewBox units (default 1.8). */
  blur?: number;
  /** Scroll trigger element (default: the closest [data-ink] or figure). */
  trigger?: Element;
  /** ScrollTrigger start (default 'top 75%'). */
  start?: string;
  /** ScrollTrigger end (default 'bottom 35%'). */
  end?: string;
  /** ScrollTrigger scrub (default true). */
  scrub?: boolean | number;
  /** ScrollTrigger id, for ?at=<id>:0.5. */
  id?: string;
  /** The finished image (default the svg's [data-ink-final]). */
  target?: SVGElement;
  /** Reduced tier: hide again below this line (default 'top 65%'). */
  reducedStart?: string;
  /** Reduced tier: show past this line (default 'top 35%'). */
  reducedEnd?: string;
}

/** Scroll-scrubbed ink transition (move T-06). Returns an idempotent cleanup, also registered with engine.addCleanup. */
export function initInkMask(engine: MotionEngine, svgEl: SVGSVGElement, opts?: InkMaskOptions): () => void;
