'use client';
// @refresh reset
// rive-studio starter: one Rive piece for React or the Next.js App Router.
// Install: npm i @rive-app/react-webgl2   (or @rive-app/react-canvas when a page holds many small instances)
// Names come from the piece's contract (design/rive/<piece>/CONTRACT.md); prefer the constants that
// `rive-probe.mjs --emit-ts` generates over string literals.
//
// What it handles: a reserved box (no layout shift), mounting only near the viewport, an optional poster
// for heroes, app-to-Rive values, isRtl and prefersReducedMotion (when the file has them), cleanup on
// unmount (useRive), and a QA hook on local hosts: ?rive=status:error,celebrate:fire
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useRive, Layout, Fit, Alignment, RuntimeLoader } from '@rive-app/react-webgl2';

// Self-hosted WASM must be configured once, before the first instance anywhere on the page.
let wasmConfigured = false;

type Value = number | string | boolean;
type RiveInstance = NonNullable<ReturnType<typeof useRive>['rive']>;
type VMI = NonNullable<RiveInstance['viewModelInstance']>;

export type RiveStageHandle = {
  fire: (trigger: string) => void;
  set: (name: string, value: Value) => boolean;
  rive: RiveInstance | null;
};

type Props = {
  src: string;                                  // '/rive/hero.riv' for public/rive/hero.riv
  artboard?: string;
  stateMachine?: string;                        // contract name; 'Main' by convention
  label?: string;                               // accessible name in the page language
  decorative?: boolean;                         // hidden from assistive tech, Rive listeners off
  values?: Record<string, Value>;               // app-to-Rive properties, re-applied when they change
  aspectRatio?: string;                         // reserved box, e.g. '16 / 9'; or size it with className
  className?: string;
  fit?: 'Contain' | 'Cover' | 'Fill' | 'FitWidth' | 'FitHeight' | 'ScaleDown' | 'Layout';
  eager?: boolean;                              // above the fold: mount immediately
  poster?: string;                              // still image under the canvas until the first frame
  onReady?: (rive: RiveInstance, vmi: VMI | null) => void;
  debugId?: string;                             // key in window.__rive on local hosts
  wasmUrl?: string;                             // self-hosted WASM matching the renderer version, e.g. '/rive/rive-2.44.0.wasm'
  pauseWhenReduced?: boolean;                   // files without prefersReducedMotion: hold a still frame (default: decorative only)
};

const isLocalHost = () =>
  typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1|\[::1\]|.+\.localhost)$/.test(window.location.hostname);

// Duck-typed setter: accessors return null when the file has no property of that name and type.
// Not exported: a component module that exports plain functions breaks React Fast Refresh. Use the ref's set().
function setProp(vmi: VMI | null | undefined, name: string, value: Value): boolean {
  if (!vmi) return false;
  if (typeof value === 'boolean') {
    const p = vmi.boolean(name);
    if (p) { p.value = value; return true; }
    return false;
  }
  if (typeof value === 'number') {
    const n = vmi.number(name);
    if (n) { n.value = value; return true; }
    const c = vmi.color(name);                  // colors are ARGB integers, e.g. 0xFF2457FF
    if (c) { c.value = value; return true; }
    return false;
  }
  const e = vmi.enum(name);
  if (e) { e.value = value; return true; }
  const s = vmi.string(name);
  if (s) { s.value = value; return true; }
  return false;
}

const coerce = (v: string): Value =>
  v === 'true' ? true : v === 'false' ? false : v.trim() !== '' && !Number.isNaN(Number(v)) ? Number(v) : v;

function applyQaHook(vmi: VMI | null) {
  if (!isLocalHost()) return;
  const q = new URLSearchParams(window.location.search).get('rive');
  if (!q) return;
  for (const pair of q.split(',')) {
    const [name, raw = ''] = pair.split(':');
    if (raw === 'fire') vmi?.trigger(name)?.trigger();
    else if (!setProp(vmi, name, coerce(raw))) console.warn(`rive QA hook: no property "${name}"`);
  }
}

export const RiveStage = forwardRef<RiveStageHandle, Props>(function RiveStage(
  { src, artboard, stateMachine = 'Main', label, decorative, values, aspectRatio, className,
    fit = 'Contain', eager, poster, onReady, debugId, wasmUrl, pauseWhenReduced },
  ref,
) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(!!eager);
  const [reduced, setReduced] = useState(false);
  const valuesKey = JSON.stringify(values ?? {});
  // Latest props for the load callback, which is created once per instance.
  const latest = useRef({ values, onReady });
  latest.current = { values, onReady };

  // Declared before useRive so it runs before the runtime's own effects in the same commit.
  useEffect(() => {
    if (wasmUrl && !wasmConfigured) { RuntimeLoader.setWasmUrl(wasmUrl); wasmConfigured = true; }
  }, [wasmUrl]);

  // Mount Rive (and download the file and WASM) only when the box approaches the viewport.
  useEffect(() => {
    if (near || !box.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } },
      { rootMargin: '200px' });
    io.observe(box.current);
    return () => io.disconnect();
  }, [near]);

  // Reduced motion is read in an effect (never during render, to avoid hydration mismatches) and followed live.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (isLocalHost() && box.current && box.current.getBoundingClientRect().height === 0)
      console.warn('RiveStage: the box has no height; pass aspectRatio or size it with className', src);
  }, [src]);

  const params = useMemo(() => ({
    src, artboard, stateMachine,
    autoplay: true,
    autoBind: true,
    isTouchScrollEnabled: true,
    shouldDisableRiveListeners: !!decorative,
    layout: new Layout({ fit: Fit[fit], alignment: Alignment.Center }),
    // Runs inside the load event, before the first advance: everything set here is in the very first frame,
    // so a Hebrew page never flashes the left-to-right pose and the file never flashes its defaults.
    onRiveReady: (r: RiveInstance) => {
      const vmi = r.viewModelInstance ?? null;
      const dir = box.current?.closest('[dir]')?.getAttribute('dir') ?? document.documentElement.dir;
      setProp(vmi, 'isRtl', dir === 'rtl');
      setProp(vmi, 'prefersReducedMotion', window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      for (const [k, v] of Object.entries(latest.current.values ?? {})) setProp(vmi, k, v);
      applyQaHook(vmi);
      latest.current.onReady?.(r, vmi);
    },
  }), [src, artboard, stateMachine, decorative, fit]);

  const { rive, RiveComponent } = useRive(near ? params : null);
  const vmi: VMI | null = rive?.viewModelInstance ?? null;

  // After load: readiness marker for tests and the debug handle on local hosts.
  useEffect(() => {
    if (!rive) return;
    box.current?.setAttribute('data-rive-ready', '');
    if (isLocalHost()) {
      const w = window as unknown as { __rive?: Record<string, unknown> };
      w.__rive = { ...w.__rive, [debugId ?? src]: rive };
    }
  }, [rive]); // eslint-disable-line react-hooks/exhaustive-deps

  // Later value changes.
  useEffect(() => {
    if (!vmi) return;
    for (const [k, v] of Object.entries(values ?? {})) setProp(vmi, k, v);
  }, [vmi, valuesKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reduced motion: the file's own reduced path when it has one (the contract requires it). For files without it,
  // hold a still frame only when asked (decorative pieces by default); interactive pieces keep running so state
  // changes still resolve, and local hosts get a warning.
  useEffect(() => {
    if (!rive) return;
    if (setProp(vmi, 'prefersReducedMotion', reduced)) return;
    if (reduced && (pauseWhenReduced ?? !!decorative)) {
      // Data-binding writes apply on the next advance: let two frames render before holding.
      let id = requestAnimationFrame(() => { id = requestAnimationFrame(() => rive.pause()); });
      return () => cancelAnimationFrame(id);
    }
    if (reduced && isLocalHost()) console.warn('RiveStage: the file has no prefersReducedMotion property, so reduced-motion users get full motion', src);
    if (!reduced && rive.isPaused) rive.play();
  }, [rive, vmi, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(ref, () => ({
    fire: (t) => vmi?.trigger(t)?.trigger(),
    set: (n, v) => setProp(vmi, n, v),
    rive: rive ?? null,
  }), [rive, vmi]);

  const a11y = decorative ? { 'aria-hidden': true as const } : { role: 'img', 'aria-label': label };

  return (
    <div ref={box} className={className} style={{ position: 'relative', width: '100%', ...(aspectRatio ? { aspectRatio } : {}) }}>
      {poster && (
        <img src={poster} alt="" aria-hidden="true" decoding="async" fetchPriority={eager ? 'high' : 'auto'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain',
            opacity: rive ? 0 : 1, transition: 'opacity 200ms ease-out', pointerEvents: 'none' }} />
      )}
      {near && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <RiveComponent {...a11y} />
        </div>
      )}
    </div>
  );
});

// Usage (server component page):
//   <RiveStage src="/rive/hero.riv" artboard="Hero" label="..." aspectRatio="16 / 9" eager
//              poster="/rive/hero-poster.webp" values={{ progress: 40 }} />
// Usage with triggers (client component):
//   const stage = useRef<RiveStageHandle>(null);
//   <RiveStage ref={stage} src="/rive/cta.riv" decorative values={{ status: busy ? 'loading' : 'idle' }} aspectRatio="4 / 1" />
//   stage.current?.fire('celebrate');
// A real DOM button over a decorative canvas: see the recipe in references/web-runtime.md section 4.
// Typed hooks are an alternative for a single known file: useViewModelInstanceNumber('progress', vmi) etc.
