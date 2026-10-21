'use client'; // Next.js App Router: the engine only ever runs in the browser
// React adapter for motion-engine.js (React 18/19, Next.js, Vite, TanStack Start, Astro islands).
//
//   <MotionProvider routeKey={pathname}>{children}</MotionProvider>     // once, near the root
//   const ref = useScene((engine) => { … gsap code scoped to ref … }); // in any component
//   <section ref={ref}>…</section>
//   const stopAnimations = useStopAnimations();                         // the accessibility menu
//   const engine = useMotionEngine();                                   // onFrame, damp, addCleanup and
//                                                                       // onViewportResize live on the engine
//
// Why this shape: StrictMode mounts effects twice and client-side routing swaps the DOM; every
// ScrollTrigger must be created inside a gsap.context that is reverted on unmount, or triggers
// leak and pins jump. useGSAP (from @gsap/react) does exactly that, scoped to the component.
//
// Copy motion-engine.js AND motion-engine.d.ts next to this file: strict TypeScript without
// allowJs (the Vite react-ts default) fails the build on an untyped .js import (TS7016).

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { useGSAP } from '@gsap/react';
import { createMotionEngine, themeLayers } from './motion-engine.js';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

type Engine = ReturnType<typeof createMotionEngine>;
const EngineContext = createContext<Engine | null>(null);
const StopContext = createContext<() => void>(() => {});

export function MotionProvider({ children, routeKey, themes = true }: { children: ReactNode; routeKey?: string; themes?: boolean }) {
  const [engine, setEngine] = useState<Engine | null>(null);
  // The "stop animations" switch: a new, reduced engine replaces the running one without a reload,
  // and every useScene re-runs against it (it lists the engine in its dependencies).
  const [reduced, setReduced] = useState(false);
  // The OS "reduce motion" setting can change while the page is open. The engine reports it and does
  // not patch itself, so the provider rebuilds the same way: the new engine reads the setting again.
  const [osChange, setOsChange] = useState(0);

  useEffect(() => {
    const e = createMotionEngine({ gsap, ScrollTrigger, SplitText, Lenis }, {
      reduce: reduced,
      onPreferenceChange: () => setOsChange((n) => n + 1),
    });
    if (themes) themeLayers(e); // registers its trigger and timer with e.addCleanup
    setEngine(e);
    return () => e.destroy(); // the second StrictMode mount gets a fresh engine
  }, [themes, reduced, osChange]);

  // After a client-side route change the new DOM has different heights: go to the top (or to the
  // new URL's #hash), then re-measure. Not on the first run: that is the engine arriving, and a
  // scroll there would throw deep links (/#contact) and reload scroll restoration back to the top.
  const prevKey = useRef(routeKey);
  useEffect(() => {
    const changed = prevKey.current !== routeKey;
    prevKey.current = routeKey;
    if (!engine || !changed) return;
    let target: HTMLElement | null = null;
    try { target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null; } catch { /* malformed hash */ }
    // Without Lenis (reduced motion, smooth: false) the window scrolls itself: a client-side router
    // keeps the old scroll position otherwise.
    if (engine.lenis) engine.lenis.scrollTo(target ?? 0, { immediate: true });
    else if (target) target.scrollIntoView({ behavior: 'auto' });
    else window.scrollTo({ top: 0, behavior: 'auto' });
    const id = requestAnimationFrame(() => engine.ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [routeKey, engine]);

  const stopAnimations = useCallback(() => {
    document.documentElement.dataset.motion = 'off';
    setReduced(true);
  }, []);

  return (
    <StopContext.Provider value={stopAnimations}>
      <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>
    </StopContext.Provider>
  );
}

export function useMotionEngine(): Engine | null {
  return useContext(EngineContext);
}

// For the accessibility menu: stops every animation on the page at once, no reload (WCAG 2.2.2).
export function useStopAnimations(): () => void {
  return useContext(StopContext);
}

// A scene scoped to one component. Everything gsap creates inside `setup` (tweens, timelines,
// ScrollTriggers, SplitText) is reverted when the component unmounts or `deps` change.
export function useScene<T extends HTMLElement = HTMLElement>(
  setup: (engine: Engine, scope: T) => void | (() => void),
  deps: unknown[] = [],
): RefObject<T | null> {
  const scope = useRef<T | null>(null);
  const engine = useMotionEngine();
  useGSAP(() => {
    if (!engine || !scope.current) return;
    return setup(engine, scope.current);
  }, { scope, dependencies: [engine, ...deps], revertOnUpdate: true });
  return scope;
}

// Example (a held text-swap scene, move H-01):
//
// export function Truths({ lines }: { lines: string[] }) {
//   const ref = useScene<HTMLDivElement>((engine, root) => {
//     const items = root.querySelectorAll('.swap p');
//     if (engine.REDUCE) return; // the markup already shows every line stacked
//     gsap.set([...items].slice(1), { autoAlpha: 0, y: 40 });
//     const tl = engine.holdTimeline(root, { scrub: 0.5 });
//     items.forEach((p, i) => { if (i) tl.to(items[i - 1], { autoAlpha: 0, y: -40 }, i).to(p, { autoAlpha: 1, y: 0 }, i + 0.3); });
//   });
//   return <div ref={ref} className="hold" style={{ height: `${lines.length * 100}svh` }}>…</div>;
// }
