// rive-stage.js - rive-studio starter: a framework-free custom element for one Rive piece.
// Astro: import it from a <script> in the component or layout (Vite bundles it; the runtime loads lazily).
// Plain HTML: load the UMD build first and this file as a module:
//   <script src="https://unpkg.com/@rive-app/webgl2@2.44.2"></script>   (pin the version you tested)
//   <script type="module" src="/js/rive-stage.js"></script>
// Markup (reserve the box with aspect-ratio or a height, so nothing shifts):
//   <rive-stage data-src="/rive/badge.riv" data-artboard="Badge" data-label="..."
//               data-values='{"progress":40}' style="display:block; aspect-ratio: 1 / 1; width: 10rem"></rive-stage>
// Options: data-state-machine (default "Main"), data-fit (Contain, Cover, Layout...), data-decorative, data-eager,
//          data-pause-when-reduced (files without a prefersReducedMotion property: hold a still frame).
// Self-hosted WASM (recommended in production): <meta name="rive-wasm" content="/rive/rive-2.44.2.wasm"> in the head.
// API: el.set('status', 'loading'); el.fire('celebrate'); el.rive; event 'rive-ready' with { rive, vmi }.
// QA hook on local hosts: ?rive=status:error,celebrate:fire
// Names come from the piece's contract (design/rive/<piece>/CONTRACT.md).

const loadRuntime = async () => globalThis.rive ?? (await import('@rive-app/webgl2'));

const isLocalHost = () => /^(localhost|127\.0\.0\.1|\[::1\]|.+\.localhost)$/.test(location.hostname);

// Duck-typed setter: accessors return null when the file has no property of that name and type.
export function setProp(vmi, name, value) {
  if (!vmi) return false;
  if (typeof value === 'boolean') {
    const p = vmi.boolean(name);
    if (p) { p.value = value; return true; }
    return false;
  }
  if (typeof value === 'number') {
    const n = vmi.number(name);
    if (n) { n.value = value; return true; }
    const c = vmi.color(name);            // ARGB integer, e.g. 0xFF2457FF
    if (c) { c.value = value; return true; }
    return false;
  }
  const e = vmi.enum(name);
  if (e) { e.value = value; return true; }
  const s = vmi.string(name);
  if (s) { s.value = value; return true; }
  return false;
}

const coerce = (v) => (v === 'true' ? true : v === 'false' ? false : v.trim() !== '' && !Number.isNaN(Number(v)) ? Number(v) : v);

class RiveStage extends HTMLElement {
  static wasmSet = false;
  #rive = null;
  #vmi = null;
  #io = null;
  #ro = null;
  #mq = null;
  #starting = false;

  connectedCallback() {
    if (getComputedStyle(this).display === 'inline') this.style.display = 'block';
    if (!this.style.position) this.style.position = 'relative';
    let canvas = this.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute; inset:0; width:100%; height:100%';
      this.append(canvas);
    }
    if ('decorative' in this.dataset) canvas.setAttribute('aria-hidden', 'true');
    else {
      canvas.setAttribute('role', 'img');
      if (this.dataset.label) canvas.setAttribute('aria-label', this.dataset.label);
    }
    if (isLocalHost() && this.getBoundingClientRect().height === 0)
      console.warn('rive-stage: the box has no height; reserve it with aspect-ratio or a height', this);

    // Start near the viewport; afterwards pause and resume rendering with visibility.
    this.#io = new IntersectionObserver(([e]) => {
      if (!this.#rive) { if (e.isIntersecting) this.#start(canvas); return; }
      if (e.isIntersecting) this.#rive.startRendering(); else this.#rive.stopRendering();
    }, { rootMargin: '200px' });
    this.#io.observe(this);
    if ('eager' in this.dataset) this.#start(canvas);
  }

  async #start(canvas) {
    if (this.#starting) return;
    this.#starting = true;
    const { Rive, Layout, Fit, Alignment, RuntimeLoader } = await loadRuntime();
    if (!this.isConnected) return;
    const wasm = document.querySelector('meta[name="rive-wasm"]')?.content;
    if (wasm && !RiveStage.wasmSet) { RuntimeLoader.setWasmUrl(wasm); RiveStage.wasmSet = true; } // before the first instance
    const d = this.dataset;
    this.#rive = new Rive({
      src: d.src,
      canvas,
      artboard: d.artboard || undefined,
      stateMachine: d.stateMachine || 'Main',
      autoplay: true,
      autoBind: true,
      isTouchScrollEnabled: true,
      shouldDisableRiveListeners: 'decorative' in d,
      layout: new Layout({ fit: Fit[d.fit || 'Contain'], alignment: Alignment.Center }),
      onLoad: () => this.#ready(),
      onLoadError: (e) => console.error('rive-stage: load failed', d.src, e),
    });
    this.#ro = new ResizeObserver(() => this.#rive?.resizeDrawingSurfaceToCanvas());
    this.#ro.observe(canvas);
  }

  #ready() {
    const r = this.#rive;
    if (!r) return;
    r.resizeDrawingSurfaceToCanvas();
    this.#vmi = r.viewModelInstance ?? null;
    const dir = this.closest('[dir]')?.getAttribute('dir') ?? document.documentElement.dir;
    setProp(this.#vmi, 'isRtl', dir === 'rtl');
    try {
      for (const [k, v] of Object.entries(JSON.parse(this.dataset.values || '{}'))) setProp(this.#vmi, k, v);
    } catch (e) {
      console.warn('rive-stage: data-values is not valid JSON', e);
    }
    this.#mq = matchMedia('(prefers-reduced-motion: reduce)');
    this.#applyReduced();
    this.#mq.addEventListener('change', this.#applyReduced);
    if (isLocalHost()) {
      const q = new URLSearchParams(location.search).get('rive');
      for (const pair of q ? q.split(',') : []) {
        const [name, raw = ''] = pair.split(':');
        if (raw === 'fire') this.#vmi?.trigger(name)?.trigger();
        else if (!setProp(this.#vmi, name, coerce(raw))) console.warn(`rive QA hook: no property "${name}"`);
      }
      (globalThis.__rive ??= {})[this.id || this.dataset.src] = r;
    }
    this.dataset.riveReady = '';
    this.dispatchEvent(new CustomEvent('rive-ready', { detail: { rive: r, vmi: this.#vmi } }));
  }

  // The file's own reduced path when it has one (the contract requires it). For files without it, hold a still
  // frame only for decorative pieces or data-pause-when-reduced; interactive pieces keep running so state changes
  // still resolve, and local hosts get a warning.
  #applyReduced = () => {
    const r = this.#rive;
    if (!r || !this.#mq) return;
    const reduce = this.#mq.matches;
    if (setProp(this.#vmi, 'prefersReducedMotion', reduce)) return;
    if (reduce && ('pauseWhenReduced' in this.dataset || 'decorative' in this.dataset)) {
      requestAnimationFrame(() => requestAnimationFrame(() => r.pause())); // bound values render on the next advance
      return;
    }
    if (reduce && isLocalHost()) console.warn('rive-stage: the file has no prefersReducedMotion property, so reduced-motion users get full motion', this.dataset.src);
    if (!reduce && r.isPaused) r.play();
  };

  set(name, value) { return setProp(this.#vmi, name, value); }
  fire(name) { this.#vmi?.trigger(name)?.trigger(); }
  get rive() { return this.#rive; }

  disconnectedCallback() {
    this.#io?.disconnect();
    this.#ro?.disconnect();
    this.#mq?.removeEventListener('change', this.#applyReduced);
    this.#rive?.cleanup();
    this.#rive = null;
    this.#vmi = null;
    this.#starting = false;
  }
}

if (!customElements.get('rive-stage')) customElements.define('rive-stage', RiveStage);
