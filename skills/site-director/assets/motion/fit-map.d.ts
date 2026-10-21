// fit-map.d.ts: types for fit-map.js (copy next to the .js in projects without allowJs).
import type { MotionEngine } from './motion-engine.js';

export interface RenderedPoint {
  /** CSS px from the image element's left border edge. */
  x: number;
  /** CSS px from the image element's top border edge. */
  y: number;
  scaleX: number;
  scaleY: number;
  /** The point falls outside the visible content box (cropped by cover). */
  clipped: boolean;
}

export interface Marker {
  /** Absolutely positioned, sharing the image's offsetParent. */
  el: HTMLElement;
  /** Source-image px. */
  x: number;
  /** Source-image px. */
  y: number;
}

export interface SourceSize {
  sourceW?: number;
  sourceH?: number;
}

export function mapToRendered(
  img: HTMLImageElement | HTMLVideoElement, x: number, y: number, sourceW?: number, sourceH?: number,
): RenderedPoint | null;
export function placeMarkers(img: HTMLImageElement | HTMLVideoElement, markers: Marker[], size?: SourceSize): boolean;
export function trackMarkers(engine: MotionEngine, img: HTMLImageElement | HTMLVideoElement, markers: Marker[], size?: SourceSize): () => void;
