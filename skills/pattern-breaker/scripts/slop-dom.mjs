// W7 - NEW structural detectors for slop-scan URL mode. Self-contained: page.evaluate() serialises it.
// Same contract as DOM_DETECTORS: returns { hits: {id: [detail]}, waived: {id: [why]} }, honours data-slop-ok.
export const NEW_DOM_RULES = [
  { id: 'title-case-headings', w: 1, max: 1, kind: 'dom', cat: 'type', msg: '≥3 Title Case Headings (English) - sentence case reads human.' },
  { id: 'we-you-ratio', w: 1, max: 1, kind: 'dom', cat: 'copy', msg: '"we/our" outnumbers "you/your" ≥1.5× (EN+HE) - the page talks about itself.' },
  { id: 'punctuation-density', w: 1, max: 2, kind: 'dom', cat: 'copy', msg: 'Em-dash (≥1/120 words) or "!" (≥1/150 words) density in owner copy.' },
  { id: 'bento-dom', w: 2, max: 1, kind: 'dom', cat: 'layout', msg: 'Bento grid: ≥5 rounded tiles in one grid with ≥2 tile widths or an explicit span (height differences alone do not count).' },
  { id: 'zigzag-dom', w: 2, max: 1, kind: 'dom', cat: 'layout', msg: '≥3 consecutive media+text rows with the media side alternating.' },
  { id: 'logo-cloud-dom', w: 2, max: 1, kind: 'dom', cat: 'layout', msg: '≥5 dimmed/greyscale logos in a row ("Trusted by").' },
  { id: 'avatar-stack-dom', w: 2, max: 1, kind: 'dom', cat: 'imagery', msg: '≥3 overlapping round avatars (social-proof stack).' },
  { id: 'fake-browser-chrome', w: 2, max: 1, kind: 'dom', cat: 'imagery', msg: 'Three red/amber/green dots drawn as window chrome.' },
  { id: 'pricing-trio', w: 2, max: 1, kind: 'dom', cat: 'layout', msg: '3-4 sibling price cards (amount + feature list + button).' },
  { id: 'faq-tail', w: 1, max: 1, kind: 'dom', cat: 'layout', msg: '≥4 accordions in the last 40% of the page, ≥50% of them phrased in the seller\'s register (האם / Do you / Can I).' },
  { id: 'footer-columns', w: 1, max: 1, kind: 'dom', cat: 'layout', msg: 'Footer with ≥4 link columns (sitemap theatre).' },
  { id: 'cta-band', w: 2, max: 1, kind: 'dom', cat: 'layout', msg: 'Full-width coloured CTA band before the footer ("Ready to…? / מוכנים…?").' },
  { id: 'stat-band', w: 2, max: 1, kind: 'dom', cat: 'layout', msg: '≥3 big numbers (≥1.8× body) with small labels in one row; consecutive integer runs (steps, odometer digits) excluded.' },
  { id: 'split-hero', w: 1, max: 1, kind: 'dom', cat: 'layout', msg: 'Split hero with floating media: h1 column + a shadowed/rounded/tilted screenshot, svg/canvas or fake chrome.' },
  { id: 'testimonial-trio', w: 2, max: 1, kind: 'dom', cat: 'layout', msg: '≥3 sibling testimonial cards (quote + avatar/stars).' },
  { id: 'steps-trio', w: 1, max: 1, kind: 'dom', cat: 'layout', msg: '≥3 numbered steps in circles (1-2-3 "how it works").' },
  { id: 'initials-avatars', w: 1, max: 1, kind: 'dom', cat: 'imagery', msg: '≥3 initials circles standing in for faces.' },
  { id: 'infinite-animations', w: 2, max: 1, kind: 'dom', cat: 'motion', msg: '≥4 visible elements with infinite CSS/WAAPI loops (ambient motion).' },
  { id: 'scroll-snap-page', w: 2, max: 1, kind: 'dom', cat: 'motion', msg: 'Page-level mandatory scroll snap (scroll-jacking).' },
  { id: 'pill-everything', w: 1, max: 1, kind: 'dom', cat: 'surface', msg: '≥80% of ≥5 buttons are pills.' },
  { id: 'single-radius', w: 1, max: 1, kind: 'dom', cat: 'surface', msg: '≥85% of ≥20 rounded elements share one radius (no hierarchy).' },
  { id: 'placeholder-labels', w: 1, max: 1, kind: 'dom', cat: 'copy', msg: '≥2 form fields labelled only by placeholder (also an a11y defect).' },
  { id: 'rtl-physical-classes', w: 2, max: 1, kind: 'dom', cat: 'layout', msg: 'RTL page with ≥10 elements using physical left/right Tailwind utilities (ml-4, pr-[..], text-left, left-6…).' },
  { id: 'hebrew-tracking', w: 2, max: 1, kind: 'dom', cat: 'type', msg: 'Letter-spacing ≥0.04em on Hebrew text ≥14px in a non-mono face (small mono labels are a deliberate register).' },
  { id: 'hebrew-faux-italic', w: 2, max: 1, kind: 'dom', cat: 'type', msg: 'Italic/oblique on Hebrew text (synthesised slant).' },
  { id: 'rtl-wrong-arrow', w: 2, max: 1, kind: 'dom', cat: 'copy', msg: 'Hebrew CTA ending in "→" (points backwards in RTL).' },
  { id: 'two-beat-headlines', w: 1, max: 1, kind: 'dom', cat: 'copy', msg: '≥4 headings in the "X. Y." two-beat shape - a formula repeated.' },
  { id: 'accent-phrase-every-heading', w: 1, max: 1, kind: 'dom', cat: 'type', msg: '≥4 headings each accenting exactly one phrase.' },
  { id: 'giant-footer-wordmark', w: 1, max: 1, kind: 'dom', cat: 'type', msg: 'Giant footer wordmark (≥10vw text or full-width SVG).' },
  { id: 'template-sequence', w: 3, max: 1, kind: 'dom', cat: 'layout', msg: '≥4 template blocks in canonical order (logos → features → testimonials → pricing → FAQ → CTA → footer).' },
];

export const DOM_DETECTORS_2 = () => {
  const hits = {};
  const waived = {};
  const label = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
  const waiverOf = (el, id) => {
    const w = el && el.closest && el.closest('[data-slop-ok]');
    if (!w) return null;
    const [rule, ...why] = w.getAttribute('data-slop-ok').split(/\s+/);
    return rule === id || rule === 'all' ? why.join(' ') || 'no reason given' : null;
  };
  const add = (id, el, detail) => {
    const why = el && waiverOf(el, id);
    if (why) { (waived[id] ||= []).push(`${label(el)} - ${why}`); return; }
    (hits[id] ||= []).push(detail);
  };
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const cs = (el) => getComputedStyle(el);
  const text = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim();
  const absTop = (el) => el.getBoundingClientRect().top + scrollY;
  const transparent = (c) => c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
  const radius = (el) => parseFloat(cs(el).borderTopLeftRadius) || 0;
  const vw = innerWidth;
  const pageH = document.documentElement.scrollHeight;
  const dir = (document.documentElement.getAttribute('dir') || document.body.getAttribute('dir') || cs(document.documentElement).direction || '').toLowerCase();
  const isRtl = dir === 'rtl';
  const firstP = [...document.querySelectorAll('p')].find(visible);
  const bodyPx = firstP ? parseFloat(cs(firstP).fontSize) : 16;
  const all = [...document.querySelectorAll('body *')].slice(0, 8000);
  const landmarks = {};
  const mark = (key, el) => { if (!(key in landmarks)) landmarks[key] = absTop(el); };
  const footer = [...document.querySelectorAll('footer, [role=contentinfo]')].filter(visible).pop() || null;

  // 1. Title Case headings (English)
  const minor = /^(a|an|the|and|or|of|in|on|to|for|with|at|by|from|is|are|as|vs)$/i;
  const tc = [...document.querySelectorAll('h1,h2,h3')].filter(visible).filter((h) => {
    const words = text(h).split(' ').filter((w) => /^[A-Za-z]/.test(w));
    const content = words.filter((w) => !minor.test(w));
    if (words.length < 4 || content.length < 3) return false;
    const caps = content.filter((w) => /^[A-Z][a-z]/.test(w)).length;
    return caps / content.length >= 0.8 && caps >= 3;
  });
  if (tc.length >= 3) add('title-case-headings', tc[0], `${tc.length} headings, e.g. "${text(tc[0]).slice(0, 40)}"`);

  // 2-3. Voice: we/you ratio and punctuation density on owner copy (testimonials and quotes excluded)
  const voice = [...document.querySelectorAll('blockquote, q, [class*="testimon" i], [class*="review" i], [class*="quote" i], [data-voice="client"]')];
  const prevDisplay = voice.map((n) => n.style.display);
  voice.forEach((n) => { n.style.display = 'none'; });
  const owner = document.body.innerText || '';
  voice.forEach((n, i) => { n.style.display = prevDisplay[i]; });
  const words = (owner.match(/[\p{L}\d]+/gu) || []).length;
  const heWe = /(?<![֐-׿])[ובלמהשכ]{0,2}(?:אנחנו|אנו|שלנו|אותנו|לנו|איתנו|עלינו)(?![֐-׿])/g;
  const heYou = /(?<![֐-׿])[ובלמהשכ]{0,2}(?:אתם|אתה|שלכם|שלך|אתכם|אותך|לכם|איתכם|בשבילכם|בשבילך|אליכם|אליך)(?![֐-׿])/g;
  const we = (owner.match(/\b(?:we|our|us|ours)\b/gi) || []).length + (owner.match(heWe) || []).length;
  const you = (owner.match(/\b(?:you|your|yours)\b/gi) || []).length + (owner.match(heYou) || []).length;
  if (we >= 8 && we / Math.max(you, 1) >= 1.5) add('we-you-ratio', document.body, `we ${we} vs you ${you}`);
  const dashes = (owner.match(/[\p{L}\d,]\s?\u2014\s?[\p{L}\d]|[\p{L}\d]\s\u2013\s[\p{L}\d]/gu) || []).length;
  const bangs = (owner.match(/[\p{L}\d)]!+/gu) || []).length;
  if (words >= 150 && dashes >= 4 && dashes / words >= 1 / 120) add('punctuation-density', document.body, `${dashes} dashes in ${words} owner words`);
  if (words >= 150 && bangs >= 4 && bangs / words >= 1 / 150) add('punctuation-density', document.body, `${bangs} "!" in ${words} owner words`);

  // 4. Bento
  all.forEach((el) => {
    const d = cs(el).display;
    if (d !== 'grid' && d !== 'inline-grid') return;
    const kids = [...el.children].filter(visible);
    if (kids.length < 5 || kids.length > 16) return;
    const rounded = kids.filter((k) => { const s = cs(k); return radius(k) >= 8 && (!transparent(s.backgroundColor) || s.borderTopStyle !== 'none' || s.boxShadow !== 'none' || s.backgroundImage !== 'none'); }).length;
    const widths = new Set(kids.map((k) => Math.round(k.getBoundingClientRect().width / 40)));
    const spans = kids.some((k) => /span\s*[2-9]/.test(cs(k).gridColumnEnd + ' ' + cs(k).gridRowEnd));
    if (rounded / kids.length >= 0.8 && (widths.size >= 2 || spans)) { add('bento-dom', el, `${label(el)} ${kids.length} tiles`); mark('features', el); }
  });

  // 5. Zig-zag media/text rows
  const unwrap = (n) => { let x = n; while (x && x.children.length === 1) x = x.firstElementChild; return x; };
  const isMedia = (n) => n.matches('img,video,picture,svg,canvas,iframe') || (n.querySelector('img,video,picture,canvas') && text(n).length < 40);
  all.forEach((parent) => {
    const rows = [...parent.children].filter(visible);
    if (rows.length < 3) return;
    const sides = rows.map((row) => {
      const inner = unwrap(row);
      if (!inner) return null;
      const kids = [...inner.children].filter(visible);
      if (kids.length !== 2) return null;
      const m = kids.find(isMedia);
      const t = kids.find((k) => k !== m);
      if (!m || !t || text(t).length < 80) return null;
      const mr = m.getBoundingClientRect();
      const tr = t.getBoundingClientRect();
      if (mr.bottom <= tr.top || tr.bottom <= mr.top) return null; // stacked, not side by side
      return mr.left < tr.left ? 'L' : 'R';
    });
    let run = 1, best = 1;
    for (let i = 1; i < sides.length; i++) {
      if (sides[i] && sides[i - 1] && sides[i] !== sides[i - 1]) { run++; best = Math.max(best, run); } else run = 1;
    }
    if (best >= 3) add('zigzag-dom', parent, `${label(parent)} ${best} alternating rows`);
  });

  // 6. Logo cloud
  all.forEach((el) => {
    const kids = [...el.children].filter(visible);
    if (kids.length < 5 || kids.length > 40) return;
    const logos = kids.filter((k) => {
      const m = k.matches('img,svg') ? k : k.querySelector('img,svg');
      if (!m) return false;
      const r = m.getBoundingClientRect();
      if (r.height > 80 || r.height < 12 || text(k).length > 30) return false;
      const f = `${cs(m).filter} ${cs(k).filter}`;
      const op = Math.min(parseFloat(cs(m).opacity), parseFloat(cs(k).opacity));
      return /grayscale\((?:1|100%|0?\.[5-9])/.test(f) || op <= 0.75;
    });
    if (logos.length >= 5 && logos.length / kids.length >= 0.8) { add('logo-cloud-dom', el, `${label(el)} ${logos.length} dimmed logos`); mark('logos', el); }
  });

  // 7. Avatar stack
  all.forEach((el) => {
    const kids = [...el.children].filter(visible);
    if (kids.length < 3) return;
    const av = kids.map((k) => (k.matches('img') ? k : k.querySelector(':scope > img'))).filter((m) => {
      if (!m || !visible(m)) return false;
      const r = m.getBoundingClientRect();
      return r.width >= 16 && r.width <= 56 && Math.abs(r.width - r.height) < 2 && radius(m) >= r.width / 2 - 1;
    });
    if (av.length < 3) return;
    let overlaps = 0;
    for (let i = 1; i < av.length; i++) {
      const a = av[i - 1].getBoundingClientRect(), b = av[i].getBoundingClientRect();
      if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2) overlaps++;
    }
    if (overlaps >= 2) add('avatar-stack-dom', el, `${av.length} overlapping avatars`);
  });

  // 8. Fake browser chrome (traffic lights)
  const near = (rgb, hex) => {
    const m = (rgb.match(/\d+/g) || []).map(Number);
    if (m.length < 3) return false;
    const h = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
    return Math.abs(m[0] - h[0]) + Math.abs(m[1] - h[1]) + Math.abs(m[2] - h[2]) < 70;
  };
  all.forEach((el) => {
    const kids = [...el.children];
    if (kids.length !== 3) return;
    const dots = kids.every((k) => { const r = k.getBoundingClientRect(); return r.width >= 6 && r.width <= 16 && Math.abs(r.width - r.height) < 2; });
    if (!dots) return;
    const bg = kids.map((k) => cs(k).backgroundColor);
    const fwd = near(bg[0], 'ff5f57') && near(bg[1], 'febc2e') && near(bg[2], '28c840');
    const rev = near(bg[2], 'ff5f57') && near(bg[1], 'febc2e') && near(bg[0], '28c840');
    if (fwd || rev) add('fake-browser-chrome', el, label(el));
  });

  // 9. Pricing trio
  const CUR = /(?:₪|\$|€|£|ש["״]ח|NIS)\s?\d|\d\s?(?:₪|ש["״]ח)/;
  all.forEach((el) => {
    const kids = [...el.children].filter(visible);
    if (kids.length < 3 || kids.length > 4) return;
    const tiers = kids.filter((k) => CUR.test(text(k)) && k.querySelectorAll('li').length >= 3 && k.querySelector('a,button'));
    if (tiers.length === kids.length) { add('pricing-trio', el, `${tiers.length} price cards`); mark('pricing', el); }
  });

  // 10. FAQ accordions at the tail
  const acc = [...document.querySelectorAll('details, [aria-expanded][aria-controls], [data-radix-collection-item][data-state]')].filter((a) => visible(a) && !a.closest('header, nav'));
  const tail = acc.filter((a) => absTop(a) >= pageH * 0.6);
  const vendor = tail.filter((a) => /^(?:האם |do you |can i |is there |what is |are you |how long )/i.test(text(a.querySelector('summary') || a)));
  if (tail.length >= 4) mark('faq', tail[0]);
  if (tail.length >= 4 && vendor.length / tail.length >= 0.5) add('faq-tail', tail[0], `${tail.length} accordions in the last 40%, ${vendor.length} in the vendor's voice`);

  // 11. Footer link columns
  if (footer) {
    let best = null;
    [footer, ...footer.querySelectorAll('*')].forEach((el) => {
      const cols = [...el.children].filter((k) => visible(k) && k.querySelectorAll('a').length >= 3);
      if (cols.length >= 4 && (!best || cols.length > best.n)) best = { el, n: cols.length };
    });
    if (best) { add('footer-columns', best.el, `${best.n} link columns`); mark('footer', best.el); }
  }

  // 12. CTA band before the footer
  const footerTop = footer ? absTop(footer) : pageH;
  const blocks = [...document.querySelectorAll('section, main > div, body > div > div')].filter((s) => visible(s) && s.getBoundingClientRect().width >= vw * 0.9 && absTop(s) < footerTop && !(footer && footer.contains(s)));
  const lastBlock = blocks.sort((a, b) => absTop(b) - absTop(a))[0];
  if (lastBlock) {
    const s = cs(lastBlock);
    const coloured = s.backgroundImage.includes('gradient') || (!transparent(s.backgroundColor) && s.backgroundColor !== cs(document.body).backgroundColor);
    const h = lastBlock.querySelector('h2,h3');
    const btns = lastBlock.querySelectorAll('a,button').length;
    if (coloured && h && cs(h).textAlign === 'center' && btns >= 1 && btns <= 4 && text(lastBlock).length < 500 && /ready|let'?s|get started|start|מוכנ|בואו|מתחילים|רוצים|צרו/i.test(text(h))) {
      add('cta-band', lastBlock, `"${text(h).slice(0, 40)}"`); mark('cta', lastBlock);
    }
  }

  // 13. Stat band
  const NUM = /^[+~]?\d[\d,.]*\s?(?:\+|%|K|k|M|x|×)?\+?$|^\d{1,2}\/7$/;
  all.forEach((el) => {
    const kids = [...el.children].filter(visible);
    if (kids.length < 3 || kids.length > 6) return;
    const stats = kids.filter((k) => {
      const leaf = [k, ...k.querySelectorAll('*')].find((n) => n.children.length === 0 && NUM.test(text(n)));
      return leaf && parseFloat(cs(leaf).fontSize) >= bodyPx * 1.8 && text(k).length <= 60;
    });
    const vals = stats.map((k) => Number((text(k).match(/\d[\d,.]*/) || ['0'])[0].replace(/,/g, '')));
    const sequence = vals.every((v, i) => i === 0 || v === vals[i - 1] + 1);
    if (stats.length >= 3 && stats.length / kids.length >= 0.75 && !sequence) { add('stat-band', el, `${stats.length} big numbers, e.g. "${text(stats[0]).slice(0, 30)}"`); mark('stats', el); }
  });

  // 14. Split hero
  const h1 = [...document.querySelectorAll('h1')].find(visible);
  if (h1 && absTop(h1) < innerHeight) {
    for (let n = h1.parentElement; n && n !== document.body; n = n.parentElement) {
      const kids = [...n.children].filter(visible);
      if (kids.length !== 2) continue;
      const [a, b] = kids.map((k) => k.getBoundingClientRect());
      const side = !(a.bottom <= b.top || b.bottom <= a.top) && a.width > vw * 0.25 && b.width > vw * 0.25;
      const media = kids.find((k) => !k.contains(h1) && (k.matches('img,video,picture,canvas,svg') || k.querySelector('img,video,picture,canvas,svg')));
      if (!side || !media) continue;
      const parts = [media, ...media.querySelectorAll('*')].slice(0, 60);
      const chrome = parts.some((e) => e.children.length === 3 && [...e.children].every((d) => { const r = d.getBoundingClientRect(); return r.width >= 6 && r.width <= 16 && Math.abs(r.width - r.height) < 2; }));
      const floating = chrome || media.matches('svg,canvas') || parts.some((e) => { const st = cs(e); return st.boxShadow !== 'none' || radius(e) >= 12 || /matrix3d|rotate/.test(st.transform); });
      if (floating) add('split-hero', n, label(n));
      break;
    }
  }

  // 15. Testimonial trio
  all.forEach((el) => {
    const kids = [...el.children].filter(visible);
    if (kids.length < 3 || kids.length > 9) return;
    const t = kids.filter((k) => {
      const q = text(k);
      const stars = /[★⭐]{3,}/.test(q) || k.querySelectorAll('svg').length >= 5;
      const avatar = [...k.querySelectorAll('img')].some((i) => { const r = i.getBoundingClientRect(); return r.width <= 72 && radius(i) >= r.width / 2 - 1; });
      return q.length >= 40 && (stars || avatar) && (/["“”״]/.test(q) || k.querySelector('blockquote,q'));
    });
    if (t.length >= 3 && t.length / kids.length >= 0.75) { add('testimonial-trio', el, `${t.length} testimonial cards`); mark('testimonials', el); }
  });

  // 16. Numbered steps in circles
  all.forEach((el) => {
    const kids = [...el.children].filter(visible);
    if (kids.length < 3 || kids.length > 6) return;
    const nums = kids.map((k) => {
      const leaf = [...k.querySelectorAll('*')].find((n) => n.children.length === 0 && /^(?:0?[1-9]|שלב\s?\d|step\s?\d)$/i.test(text(n)));
      if (!leaf) return null;
      const box = [leaf, leaf.parentElement].find((b) => { const r = b.getBoundingClientRect(); return r.width >= 20 && r.width <= 96 && Math.abs(r.width - r.height) < 3 && radius(b) >= r.width / 2 - 1; });
      return box ? parseInt(text(leaf).replace(/\D/g, ''), 10) : null;
    });
    if (nums.every((n, i) => n === i + 1)) add('steps-trio', el, `${nums.length} numbered steps in circles`);
  });

  // 17. Initials circles
  const ini = [...document.querySelectorAll('div,span')].filter((e) => {
    if (e.children.length || !visible(e)) return false;
    if (!/^(?:[A-Z]{1,2}|[א-ת]["״׳'.]?[א-ת]?)$/.test(text(e))) return false;
    const r = e.getBoundingClientRect();
    return r.width >= 28 && r.width <= 72 && Math.abs(r.width - r.height) < 3 && radius(e) >= r.width / 2 - 1;
  });
  if (ini.length >= 3) add('initials-avatars', ini[0], `${ini.length} initials circles`);

  // 18. Infinite ambient loops (CSS animations and WAAPI; GSAP repeat:-1 is measured by motion-audit)
  const loops = new Set();
  (document.getAnimations ? document.getAnimations() : []).forEach((a) => {
    const t = a.effect && a.effect.target;
    if (!t || !(t instanceof Element) || !visible(t) || a.playState !== 'running') return;
    const timing = a.effect.getComputedTiming ? a.effect.getComputedTiming() : {};
    if (timing.iterations !== Infinity) return;
    const r = t.getBoundingClientRect();
    if ((r.width < 24 && r.height < 24) || t.matches('[role=progressbar],[aria-busy=true]')) return;
    loops.add(t);
  });
  if (loops.size >= 4) add('infinite-animations', [...loops][0], `${loops.size} elements loop forever`);

  // 19. Page-level mandatory snap
  const snap = [document.documentElement, document.body, document.querySelector('main')].filter(Boolean).find((e) => /\b(?:y|block|both)\s+mandatory/.test(cs(e).scrollSnapType));
  if (snap) add('scroll-snap-page', snap, `${snap.tagName.toLowerCase()} scroll-snap-type: ${cs(snap).scrollSnapType}`);

  // 20. Pills on everything
  const btns = [...document.querySelectorAll('button, [role=button], a')].filter((b) => {
    if (!visible(b)) return false;
    const r = b.getBoundingClientRect();
    const s = cs(b);
    return r.height >= 28 && r.height <= 72 && r.width >= 60 && (!transparent(s.backgroundColor) || s.borderTopStyle !== 'none');
  });
  const pills = btns.filter((b) => radius(b) >= b.getBoundingClientRect().height / 2 - 1);
  if (btns.length >= 5 && pills.length / btns.length >= 0.8) add('pill-everything', pills[0], `${pills.length}/${btns.length} buttons are pills`);

  // 21. One radius everywhere
  const radii = {};
  let rounded = 0;
  all.forEach((el) => {
    if (!visible(el)) return;
    const r = radius(el);
    const w = el.getBoundingClientRect().width;
    if (r < 2 || r >= w / 2 - 1) return;
    rounded++;
    radii[Math.round(r)] = (radii[Math.round(r)] || 0) + 1;
  });
  const topRadius = Object.entries(radii).sort((a, b) => b[1] - a[1])[0];
  if (rounded >= 20 && topRadius && topRadius[1] / rounded >= 0.85) add('single-radius', document.body, `${topRadius[1]}/${rounded} rounded elements use ${topRadius[0]}px`);

  // 22. Placeholder as the only label
  const unl = [...document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=checkbox]):not([type=radio]):not([type=button]), textarea, select')]
    .filter((f) => visible(f) && !(f.labels && f.labels.length) && !f.getAttribute('aria-label') && !f.getAttribute('aria-labelledby') && f.getAttribute('placeholder'));
  if (unl.length >= 2) add('placeholder-labels', unl[0], `${unl.length} fields labelled only by placeholder`);

  // 23. Physical left/right utilities in an RTL page
  if (isRtl) {
    const phys = all.filter((e) => typeof e.className === 'string' && /(?:^|\s)(?:[\w-]+:)*(?:-?m[lr]-(?:\d|\[|px\b|auto\b)|p[lr]-(?:\d|\[|px\b)|text-(?:left|right)\b|rounded-[lr](?:-|\s|$)|rounded-[tb][lr](?:-|\s|$)|border-[lr](?:-\d|\s|$)|(?:left|right)-(?:[1-9](?!\/2)|\[|px\b|full\b))/.test(e.className));
    if (phys.length >= 10) add('rtl-physical-classes', phys[0], `${phys.length} elements with physical left/right utilities`);
  }

  // 24. Latin devices on Hebrew text
  const heEls = all.filter((e) => {
    if (!visible(e)) return false;
    const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
    if (own.length < 2) return false;
    const he = (own.match(/[א-ת]/g) || []).length;
    return he / own.replace(/\s/g, '').length >= 0.5;
  });
  const tracked = heEls.filter((e) => { const s = cs(e); return parseFloat(s.fontSize) >= 14 && !/mono/i.test(s.fontFamily) && parseFloat(s.letterSpacing) / parseFloat(s.fontSize) >= 0.04; });
  if (tracked.length >= 2) add('hebrew-tracking', tracked[0], `${tracked.length} Hebrew elements tracked, e.g. "${text(tracked[0]).slice(0, 30)}"`);
  const ital = heEls.filter((e) => /italic|oblique/.test(cs(e).fontStyle));
  if (ital.length) add('hebrew-faux-italic', ital[0], `${ital.length} Hebrew elements in italic, e.g. "${text(ital[0]).slice(0, 30)}"`);

  // 25. Forward arrow on Hebrew CTAs
  if (isRtl) {
    const fw = [...document.querySelectorAll('a,button')].filter((a) => visible(a) && /[→⟶➔➜➝➞]\s*$/.test(text(a)) && /[א-ת]/.test(text(a)));
    if (fw.length) add('rtl-wrong-arrow', fw[0], `${fw.length}× e.g. "${text(fw[0]).slice(0, 30)}"`);
  }

  // 26. Two-beat headline formula
  const tb = [...document.querySelectorAll('h1,h2,h3')].filter((h) => visible(h) && /^[^.!?]{3,40}\.\s+[^.!?]{3,40}\.$/.test(text(h)));
  if (tb.length >= 4) add('two-beat-headlines', tb[0], `${tb.length} headings, e.g. "${text(tb[0]).slice(0, 40)}"`);

  // 27. One accented phrase in every heading
  const accented = [...document.querySelectorAll('h1,h2')].filter((h) => {
    if (!visible(h)) return false;
    const hs = cs(h);
    const spans = [...h.querySelectorAll('span,em,i,mark,strong,u,b')].filter((s) => {
      const ss = cs(s);
      const t = text(s);
      return t.length >= 2 && t.length < text(h).length * 0.7 && (ss.color !== hs.color || ss.fontStyle !== hs.fontStyle || ss.fontFamily !== hs.fontFamily || ss.backgroundImage !== 'none' || !transparent(ss.backgroundColor) || ss.textDecorationLine !== 'none');
    });
    return spans.length === 1;
  });
  if (accented.length >= 4) add('accent-phrase-every-heading', accented[0], `${accented.length} headings each accent one phrase`);

  // 28. Giant footer wordmark
  if (footer) {
    const big = [...footer.querySelectorAll('*')].find((e) => visible(e) && ((e.children.length === 0 && text(e).length >= 2 && parseFloat(cs(e).fontSize) >= Math.max(140, vw * 0.1)) || (e.tagName.toLowerCase() === 'svg' && e.getBoundingClientRect().width >= vw * 0.7)));
    if (big) add('giant-footer-wordmark', big, `${label(big)} ${Math.round(parseFloat(cs(big).fontSize))}px`);
  }

  // 29. The template, in order (features also from the classic uniform card grid)
  all.forEach((el) => {
    if ('features' in landmarks) return;
    const kids = [...el.children].filter((k) => visible(k) && k.getBoundingClientRect().width > 120);
    if (kids.length < 3 || kids.length > 12) return;
    const ok = kids.every((k) => k.querySelector('h2,h3,h4') && k.querySelector('p'));
    const widths = new Set(kids.map((k) => Math.round(k.getBoundingClientRect().width / 20)));
    if (ok && widths.size === 1) mark('features', el);
  });
  const ORDER = ['logos', 'features', 'testimonials', 'pricing', 'faq', 'cta', 'footer'];
  const present = ORDER.filter((k) => k in landmarks);
  const inOrder = present.every((k, i) => i === 0 || landmarks[k] >= landmarks[present[i - 1]]);
  if (present.length >= 4 && inOrder) add('template-sequence', document.body, present.join(' → '));

  return { hits, waived };
};
