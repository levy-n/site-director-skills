// squares.glsl - the "pixel material" of a media-led site: one grid of tiny squares that images, video
// edges, transitions, the pointer's trail and the quiet material are all drawn in.
//
// Mechanism read from lamalama.com's public shaders and confirmed on GPU frames (2026-10-20); this code is
// new, written for mediawave.co.il (src/look/sea/shader.ts, D162). Their own lighting order spells their
// logo and is not used here: every site designs its own order (below).
//
// GLSL ES 1.0 (WebGL1) safe: no dynamic indexing of const arrays, no integer modulo.
//
// Needs, declared by the host shader:
//   uniform vec2  uRes;    // the canvas in device px
//   uniform float uSq;     // one square in device px: max(2, round(2 * devicePixelRatio)), i.e. 2 CSS px
//   float hash(vec2 p);    // any 2D hash returning 0..1
//
// Why squares and not round dots: four by four squares to a cell, lit in a fixed order, give every cell
// a different cluster at every level (one square, a pair, an L, a dash). People read that as "dots of
// different sizes and shapes, not all the same" - which round halftone dots of one size never give.

// The order the 16 squares of a cell light in (rank 0 first). Design it per client:
// - ranks 0-6 are the material at full light, so make them a tiny glyph of the client's mark (here:
//   MediaWave's Horizon, a sun of three squares over a four-square sea line);
// - spread consecutive ranks apart, so every level looks scattered, never like a growing blob;
// - remember x wraps to the next cell (column 3 touches the next cell's column 0).
// Rows are y = 0 (bottom) to 3, columns x = 0 to 3.
float rankAt(vec2 px) {
  vec2 q = mod(floor(px / uSq), 4.0);
  vec4 r = q.y < 0.5 ? vec4(1.0, 6.0, 3.0, 5.0)
         : (q.y < 1.5 ? vec4(8.0, 12.0, 14.0, 10.0)
         : (q.y < 2.5 ? vec4(11.0, 4.0, 0.0, 7.0) : vec4(13.0, 2.0, 9.0, 15.0)));
  return dot(r, vec4(equal(vec4(q.x), vec4(0.0, 1.0, 2.0, 3.0))));
}

// A level 0..1 lights squares in order. sq16: all sixteen (a picture's colour mask, an edge, a
// transition). sq7: the material, capped at the glyph, so it is never a solid block.
float sq16(float rk, float a) { return step(rk + 0.5, a * 16.0); }
float sq7(float rk, float a) { return step(rk + 0.5, min(a, 1.0) * 7.0); }

// Smooth value noise.
float vn(vec2 p) {
  vec2 i = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
// Noise per cell, squared (mostly low, a few hills: the front stays mostly even with a few late
// patches), about eight lattice cells per screen height, turning slowly with r (pass time * rate).
float cellN(vec2 px, float r) {
  vec2 c = floor(px / (4.0 * uSq)) * 4.0 * uSq / uRes.y * 8.0;
  float a = r * 0.05;
  float v = vn(mat2(cos(a), sin(a), -sin(a), cos(a)) * c + 3.7);
  return v * v;
}
// Noise per row of cells: each row frays on its own, so an edge breaks into horizontal dashes (reads
// like a tape's tracking lines; a different edge shape for a different element).
float rowN(vec2 px, float r) {
  float v = vn(vec2(floor(px.y / (4.0 * uSq)) * 1.7, px.x / uRes.y * 3.0 + r * 0.05));
  return v * v;
}
// A reveal or a transition: runs 0 to 1 with p, held back a little where the noise is high.
float revealLv(float p, float n) { return 1.0 - smoothstep(0.0, 1.0, (1.0 - p) * (1.0 + 0.5 * n)); }
// An edge band: 1 past the band (inside the picture), 0 outside it. y and e in the same units (a
// fraction of the picture); w is the band's depth; the noise swells the band along the edge.
float edgeLv(float y, float e, float w, float n) { return smoothstep(e - w, e, y + w * 0.75 * n); }

// ── Usage ──
//
// A picture whose lower edge breaks into its own squares (holes open square by square; what is left
// keeps the picture's colour and dims a little):
//   float rk = rankAt(px);
//   float n = cellN(px, uTime * 0.2);
//   float lv = edgeLv(f.y, 0.3, 0.26, n);           // f: the picture's 0..1 coordinates, y up
//   vec3 res = sq16(rk, lv) > 0.5 ? col * mix(0.68, 1.0, lv) : background;
// The opposite edge breaks in the opposite order, so the two edges are not one pattern:
//   float top = sq16(15.0 - rk, edgeLv(1.0 - f.y, 0.2, 0.2, cellN(px + 91.0, uTime * 0.2)));
//
// A picture at rest in its material, its colour arriving square by square on hover (reach 0..1):
//   float L = dot(col, vec3(0.299, 0.587, 0.114));
//   vec3 res = sq16(rk, revealLv(reach, n)) > 0.5 ? col : (sq7(rk, L * 1.3) > 0.5 ? MATERIAL : TILE);
//
// A transition between two takes A and B (k 0..1):
//   vec3 out = sq16(rk, revealLv(k, cellN(px, uTime))) > 0.5 ? B : A;
//
// The pointer's trail: a ribbon of small squares, fuller where the pointer ran fast, gone in a few
// tenths of a second. Keep the last ~12 pointer samples in uniforms (x, y in device px; speed), each
// with an energy e = exp(-age / 0.5s) * (0.3 + 0.7 * min(1, speed / 22 css px per frame)); then
//   trail = sum over samples of exp(-d*d / r*r) * e * e      (r about 40 css px; e*e fades twice as fast)
//   out = mix(out, CREAM, sq7(rk, trail * 1.2));
// Fine pointers only (`(hover: hover) and (pointer: fine)`); a finger scrolling should not paint.
