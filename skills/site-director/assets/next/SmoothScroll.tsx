'use client'; // the engine only ever runs in the browser
// SmoothScroll.tsx (Next.js 16.4 App Router): the motion lifecycle on pattern-breaker's motion engine.
//
// Mount it ONCE, in the persistent frontend layout, never in Payload's admin route group:
//
//   // app/(frontend)/layout.tsx  (a Server Component)
//   import SmoothScroll from '@/components/motion/SmoothScroll';
//   import '@/components/motion/reduced-motion.css';
//   import '@/components/motion/page-transition.css';
//   export default function FrontendLayout({ children }: { children: React.ReactNode }) {
//     return (
//       <html lang="he" dir="rtl">
//         <body>
//           <SmoothScroll>{children}</SmoothScroll>
//         </body>
//       </html>
//     );
//   }
//
// Layouts persist across navigation, so the engine (Lenis, the content-height watch, the anchor
// handler, the keyboard guard) lives as long as the frontend layout. Page components get it through
// useMotionEngine() and build their scenes in useGSAP with the engine as a dependency and
// revertOnUpdate: true, so a rebuilt engine (OS reduced-motion change, the stop switch) re-runs them.
//
// Copy next to: motion-engine.js + motion-engine.d.ts (pattern-breaker), keyboard-inertia.js
// (+ .d.ts). Pinned: gsap 3.15.0, @gsap/react 2.1.2, lenis 1.3.26.

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useGSAP } from '@gsap/react';
import { createMotionEngine, type MotionEngine } from './motion-engine.js';
import { guardKeyboardInertia } from './keyboard-inertia.js';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const EngineContext = createContext<MotionEngine | null>(null);
const StopContext = createContext<() => void>(() => {});

/** The current engine (null during the server render and the first client render). */
export function useMotionEngine(): MotionEngine | null {
  return useContext(EngineContext);
}

/** The in-page stop switch (WCAG 2.2.2). Never persisted between visits. */
export function useStopAnimations(): () => void {
  return useContext(StopContext);
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [engine, setEngine] = useState<MotionEngine | null>(null);
  const [stopped, setStopped] = useState(false);
  // Bumped when the OS reduced-motion setting changes while the page is open: the engine reports
  // the change ('motion:preference') and does not patch itself, so it is rebuilt.
  const [osFlip, setOsFlip] = useState(0);

  useEffect(() => {
    const onPreference = () => setOsFlip((n) => n + 1);
    window.addEventListener('motion:preference', onPreference);
    return () => window.removeEventListener('motion:preference', onPreference);
  }, []);

  // The engine is created inside useGSAP: under StrictMode the effect runs twice in development and
  // the first engine is destroyed by the cleanup; with these dependencies and revertOnUpdate it is
  // destroyed and rebuilt whenever the stop switch or the OS setting flips.
  useGSAP(() => {
    const e = createMotionEngine({ gsap, ScrollTrigger, SplitText, Lenis }, { reduce: stopped });
    guardKeyboardInertia(e);
    setEngine(e);
    return () => {
      e.destroy();
      setEngine((current) => (current === e ? null : current));
    };
  }, { dependencies: [stopped, osFlip], revertOnUpdate: true });

  // After a client-side navigation the new page's scenes exist (child effects run before this
  // parent's), but layout may still settle: re-measure on the next frame. Next.js has already
  // scrolled to the top or to the #hash; Lenis is synced to that position so it does not glide
  // back to where the old page was. Not on the first run, which is the engine arriving.
  const lastPath = useRef(pathname);
  useGSAP(() => {
    if (!engine || lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (engine.lenis) engine.lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    const id = requestAnimationFrame(() => engine.ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, { dependencies: [pathname, engine], revertOnUpdate: true });

  const stopAnimations = useCallback(() => {
    document.documentElement.dataset.motion = 'off';
    setStopped(true);
  }, []);

  return (
    <StopContext.Provider value={stopAnimations}>
      <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>
    </StopContext.Provider>
  );
}

// A scene in a page component (client component):
//
// 'use client';
// export function Plan({ children }: { children: ReactNode }) {
//   const engine = useMotionEngine();
//   const svg = useRef<SVGSVGElement>(null);
//   useGSAP(() => {
//     if (!engine || !svg.current) return;
//     return initInkMask(engine, svg.current, { id: 'plan' }); // its cleanup runs on revert too
//   }, { dependencies: [engine], revertOnUpdate: true });
//   return <figure className="ink" data-ink>{children}<svg ref={svg} ... /></figure>;
// }
