// motion-engine.d.ts: types for motion-engine.js. Copy it next to the .js in TypeScript projects:
// strict TypeScript without allowJs (the Vite react-ts default) fails the build on an untyped .js
// import (TS7016). Leave motion-engine.js itself unchecked (no // @ts-check); its types come from
// here. Hand-written, because generated declarations make every parameter required
// (engine.scene(fn) then fails with TS2554). Keep it in step when the engine's API changes.

import type { gsap as GsapLib } from 'gsap'; // also loads gsap's global types: gsap.*, ScrollTrigger, SplitText
import type Lenis from 'lenis';
import type { LenisOptions, ScrollToOptions } from 'lenis';

export interface MotionLibs {
  gsap: typeof GsapLib;
  ScrollTrigger: typeof ScrollTrigger;
  SplitText?: typeof SplitText | null;
  Lenis?: typeof Lenis | null;
}

export interface MotionEngineOptions {
  /** Force the reduced path (the accessibility switch). html[data-motion="off"] does the same. */
  reduce?: boolean;
  /** false skips Lenis (pages with at most one scrubbed set-piece). */
  smooth?: boolean;
  /** Extra Lenis options, merged over the engine's. autoRaf is always forced to false (one clock). */
  lenis?: Partial<LenisOptions>;
  /** Extra anchor offset on top of html { scroll-padding-top }. Keep 0; the header offset is the CSS. */
  anchorOffset?: number;
  /** How long to wait for webfonts before splitting text anyway (ms, default 1800). */
  fontTimeout?: number;
  /** How far below the viewport routine reveals fire (px, default 600). */
  revealOffset?: number;
  /** false turns off the content-height watch (a ResizeObserver on body that calls safeRefresh). Default on. */
  watchContent?: boolean;
  /**
   * Called when the OS reduced-motion setting changes while the page is open (the OS value).
   * The engine does not rebuild itself: call destroy() and create a new engine.
   */
  onPreferenceChange?: (reduce: boolean) => void;
}

/** What a scene function receives. */
export interface SceneTools {
  gsap: typeof GsapLib;
  ScrollTrigger: typeof ScrollTrigger;
  REDUCE: boolean;
  FINE: boolean;
  RTL: boolean;
  /** Multiply horizontal motion that follows the reading direction by DIR (1 in RTL, -1 in LTR). */
  DIR: 1 | -1;
  lenis: Lenis | null;
  engine: MotionEngine;
}

/** A scene may return a cleanup: it runs on destroy() (listeners, ticker callbacks, DOM edits). */
export type SceneFn = (tools: SceneTools) => void | (() => void);

/** A per-frame job on the shared clock: GSAP ticker time (s), time since the last tick (ms), frame number. */
export type FrameJob = (time: number, deltaTime: number, frame: number) => void;

export interface MotionEngine {
  readonly gsap: typeof GsapLib;
  readonly ScrollTrigger: typeof ScrollTrigger;
  readonly SplitText: typeof SplitText | null | undefined;
  readonly lenis: Lenis | null;
  readonly REDUCE: boolean;
  readonly FINE: boolean;
  readonly RTL: boolean;
  readonly DIR: 1 | -1;
  readonly PRERENDER: boolean;
  /** QA only: how many jobs the one clock runs now (0 once every effect has settled). */
  readonly frameJobCount: number;
  /** Resolves when webfonts are in, or after fontTimeout. */
  readonly fontsReady: Promise<unknown>;
  scene(fn: SceneFn, scope?: Element | string | object | null): gsap.Context;
  /** Line split after fonts load, RTL-safe. Pass onSplit returning the animation to rebuild it on re-splits. */
  splitLines(el: HTMLElement, vars?: Partial<SplitText.Vars>): Promise<SplitText | null>;
  /** A held scene over a tall wrapper with a sticky stage; vars go to its ScrollTrigger (scrub defaults to 0.6). */
  holdTimeline(wrapper: Element, vars?: ScrollTrigger.Vars): gsap.core.Timeline;
  /** Routine entrance: fires early, short and small; `y` is the start offset (default 18). */
  reveal(targets: gsap.TweenTarget, vars?: gsap.TweenVars, trigger?: ScrollTrigger.Vars): gsap.core.Tween | null;
  playInView(video: HTMLVideoElement, opts?: { threshold?: number }): void;
  getVelocity(): number;
  safeRefresh(): void;
  onWidthResize(fn: () => void): void;
  /** Width changes always; height-only changes only while the primary pointer is fine (not the address bar). Returns off(). */
  onViewportResize(fn: () => void): () => void;
  /** Run a job on gsap.ticker through one shared dispatcher; returns off(). Leave when the effect settles. */
  onFrame(job: FrameJob): () => void;
  /** Frame-rate independent lerp factor: 1 - (1 - k)^min(gsap.ticker.deltaRatio(60), 3). */
  damp(k: number): number;
  /** A teardown that destroy() runs (assets and adapters with listeners or observers). Runs at once after destroy(). */
  addCleanup(fn: () => void): void;
  lock(): void;
  unlock(): void;
  /** opts.offset is extra, on top of html { scroll-padding-top }, on both the Lenis and native paths. */
  scrollTo(target: number | string | HTMLElement, opts?: ScrollToOptions): void;
  destroy(): void;
}

export function createMotionEngine(libs: MotionLibs, options?: MotionEngineOptions): MotionEngine;

export interface ThemeLayersOptions {
  sections?: string;
  layers?: string;
  flipDelay?: number;
}

export function themeLayers(engine: MotionEngine, options?: ThemeLayersOptions): ScrollTrigger | null;

/** The window event the engine dispatches when the OS reduced-motion setting changes. */
export interface MotionPreferenceDetail {
  reduce: boolean;
}

declare global {
  interface WindowEventMap {
    'motion:preference': CustomEvent<MotionPreferenceDetail>;
  }
}
