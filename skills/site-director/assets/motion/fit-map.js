// fit-map.js: keep DOM markers on target over an image drawn with object-fit.
//
// object-fit: cover crops and contain letterboxes, so a marker placed in percent of the image box
// drifts off its target as soon as the box changes shape (1440x900 against 1440x700, a phone in
// portrait). These functions map a point given in source-image pixels (where the thing is in the
// photo or drawing) to CSS pixels inside the rendered box, honouring object-fit and object-position.
//
//   <div class="plan">                          (position: relative: the markers' containing block)
//     <img src="/img/plan.webp" width="2400" height="1600" alt="..." style="object-fit: cover">
//     <button class="marker" data-x="1210" data-y="640">...</button>
//   </div>
//   .plan { position: relative; } .plan img { width: 100%; height: 100%; }
//   .marker { position: absolute; left: 0; top: 0; translate: -50% -50%; }
//   .marker[data-clipped] { display: none; }  /* the point is cropped away by cover */
//
//   const markers = [...plan.querySelectorAll('.marker')].map((el) => ({ el, x: +el.dataset.x, y: +el.dataset.y }));
//   trackMarkers(engine, plan.querySelector('img'), markers);
//
// Pure functions (mapToRendered, placeMarkers) plus one helper (trackMarkers) that re-places the
// markers through a ResizeObserver whose disconnect is registered with engine.addCleanup. Nothing
// here animates, so reduced motion changes nothing.

/**
 * @typedef {object} RenderedPoint
 * @property {number} x CSS px from the image element's left border edge (add offsetLeft for its offsetParent)
 * @property {number} y CSS px from the image element's top border edge
 * @property {number} scaleX rendered px per source px, horizontally
 * @property {number} scaleY rendered px per source px, vertically
 * @property {boolean} clipped true when the point falls outside the visible content box (cover crop)
 *
 * @typedef {object} Marker
 * @property {HTMLElement} el an absolutely positioned element sharing the image's offsetParent
 * @property {number} x source-image px
 * @property {number} y source-image px
 */

/**
 * One object-position component in px. Handles the computed forms browsers return: "50%",
 * "12px", "calc(100% - 10px)", and the keywords left, center, right, top, bottom.
 * @param {string} token @param {number} free container size minus rendered size (may be negative)
 */
function offsetOf(token, free) {
  const t = token.trim();
  if (t === 'left' || t === 'top') return 0;
  if (t === 'center') return free / 2;
  if (t === 'right' || t === 'bottom') return free;
  const calc = /^calc\((.+)\)$/.exec(t);
  const expr = calc ? calc[1] : t;
  let sum = 0;
  // terms like "100%", "- 10px", "+ 2.5px" (calc() in computed values is a flat sum of % and px)
  for (const m of expr.matchAll(/([+-]?)\s*(-?[\d.]+)(%|px)?/g)) {
    const sign = m[1] === '-' ? -1 : 1;
    const n = parseFloat(m[2]);
    sum += sign * (m[3] === '%' ? (free * n) / 100 : n);
  }
  return sum;
}

/**
 * Splits a computed object-position into its x and y components. Four-value edge offsets
 * ("right 10px bottom 20px") become calc-like strings measured from the named edge.
 * @param {string} value
 * @returns {[string, string]}
 */
function splitPosition(value) {
  const parts = value.trim().split(/\s+(?![^(]*\))/); // spaces outside calc(...)
  if (parts.length === 4) {
    /** @type {Record<string, string>} */
    const byEdge = { [parts[0]]: parts[1], [parts[2]]: parts[3] };
    const x = byEdge.left !== undefined ? byEdge.left : `calc(100% - ${byEdge.right})`;
    const y = byEdge.top !== undefined ? byEdge.top : `calc(100% - ${byEdge.bottom})`;
    return [x, y];
  }
  if (parts.length === 1) {
    if (parts[0] === 'top' || parts[0] === 'bottom') return ['center', parts[0]];
    return [parts[0], 'center'];
  }
  // "top left" style keyword order puts the vertical keyword first
  if (parts[0] === 'top' || parts[0] === 'bottom' || parts[1] === 'left' || parts[1] === 'right') return [parts[1], parts[0]];
  return [parts[0], parts[1]];
}

/**
 * Maps a point in source-image px to CSS px inside the rendered image element.
 * @param {HTMLImageElement | HTMLVideoElement} img
 * @param {number} x source px
 * @param {number} y source px
 * @param {number} [sourceW] source width (default naturalWidth / videoWidth)
 * @param {number} [sourceH] source height (default naturalHeight / videoHeight)
 * @returns {RenderedPoint | null} null until the source size is known (image not loaded, no size given)
 */
export function mapToRendered(img, x, y, sourceW, sourceH) {
  const media = /** @type {any} */ (img);
  const sw = sourceW || media.naturalWidth || media.videoWidth || 0;
  const sh = sourceH || media.naturalHeight || media.videoHeight || 0;
  if (!sw || !sh) return null;
  const cs = getComputedStyle(img);
  const padL = parseFloat(cs.paddingLeft) || 0;
  const padT = parseFloat(cs.paddingTop) || 0;
  // Layout size, untransformed (getBoundingClientRect would include a scale animation on the image).
  const cw = img.clientWidth - padL - (parseFloat(cs.paddingRight) || 0);
  const ch = img.clientHeight - padT - (parseFloat(cs.paddingBottom) || 0);
  if (cw <= 0 || ch <= 0) return null;
  let sx = cw / sw;
  let sy = ch / sh;
  const fit = cs.objectFit || 'fill';
  if (fit === 'contain' || fit === 'cover' || fit === 'none' || fit === 'scale-down') {
    const contain = Math.min(cw / sw, ch / sh);
    const s = fit === 'cover' ? Math.max(cw / sw, ch / sh)
      : fit === 'none' ? 1
        : fit === 'scale-down' ? Math.min(1, contain)
          : contain;
    sx = s;
    sy = s;
  }
  const rw = sw * sx;
  const rh = sh * sy;
  const [px, py] = splitPosition(cs.objectPosition || '50% 50%');
  const ox = offsetOf(px, cw - rw);
  const oy = offsetOf(py, ch - rh);
  const inX = ox + x * sx;
  const inY = oy + y * sy;
  return {
    x: img.clientLeft + padL + inX,
    y: img.clientTop + padT + inY,
    scaleX: sx,
    scaleY: sy,
    clipped: inX < 0 || inY < 0 || inX > cw || inY > ch,
  };
}

/**
 * Places each marker on its source point (style.left and style.top in px, relative to the image's
 * offsetParent, which must also be the markers' offsetParent). A marker whose point is cropped
 * away gets data-clipped, so CSS can hide it. Returns false when the image size is not known yet.
 * @param {HTMLImageElement | HTMLVideoElement} img
 * @param {Marker[]} markers
 * @param {{ sourceW?: number, sourceH?: number }} [size]
 */
export function placeMarkers(img, markers, size = {}) {
  let ok = true;
  for (const m of markers) {
    const r = mapToRendered(img, m.x, m.y, size.sourceW, size.sourceH);
    if (!r) { ok = false; continue; }
    m.el.style.left = `${(img.offsetLeft + r.x).toFixed(2)}px`;
    m.el.style.top = `${(img.offsetTop + r.y).toFixed(2)}px`;
    m.el.toggleAttribute('data-clipped', r.clipped);
  }
  return ok;
}

/**
 * Keeps markers on target: places them now, when the image loads, and whenever the image box
 * changes size (viewport resize, a container query, a CMS edit). A ResizeObserver only, no frame job.
 * @param {import('./motion-engine.js').MotionEngine} engine
 * @param {HTMLImageElement | HTMLVideoElement} img
 * @param {Marker[]} markers
 * @param {{ sourceW?: number, sourceH?: number }} [size]
 * @returns {() => void} cleanup (idempotent; also registered with engine.addCleanup)
 */
export function trackMarkers(engine, img, markers, size = {}) {
  const place = () => { placeMarkers(img, markers, size); };
  place();
  const ro = new ResizeObserver(place);
  ro.observe(img);
  img.addEventListener('load', place);
  img.addEventListener('loadedmetadata', place); // a <video> poster frame
  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    ro.disconnect();
    img.removeEventListener('load', place);
    img.removeEventListener('loadedmetadata', place);
  };
  engine.addCleanup(cleanup);
  return cleanup;
}
