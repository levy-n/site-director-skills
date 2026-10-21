// ink-lens.d.ts: types for ink-lens.js (copy next to the .js in projects without allowJs).
import type { MotionEngine } from './motion-engine.js';

export interface InkLensOptions {
  /** The element that receives the pointer (default the closest footer, else the svg). */
  area?: Element;
  /** The inked layer (default the svg's [data-lens-ink]). */
  ink?: SVGGraphicsElement;
  /** Lens radius in viewBox units (default 120). */
  radius?: number;
  /** Follow factor per 60 Hz frame (default 0.09). */
  follow?: number;
  /** Pulse follow factor (default 0.15). */
  pulseFollow?: number;
  /** Pulse radius relative to the lens (default 1.05). */
  pulseScale?: number;
  /** Pulse opacity (default 0.2). */
  pulseOpacity?: number;
  /** Seconds to open (default 0.55). */
  grow?: number;
  /** Seconds to close (default 0.8). */
  shrink?: number;
  /** Seconds for the pulse to close (default 1). */
  pulseShrink?: number;
}

/** Footer ink lens (move C-08). Returns an idempotent cleanup, also registered with engine.addCleanup. */
export function initInkLens(engine: MotionEngine, svgEl: SVGSVGElement, opts?: InkLensOptions): () => void;
