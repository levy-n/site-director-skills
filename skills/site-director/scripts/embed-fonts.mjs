#!/usr/bin/env node
// Embeds two woff2 fonts into a proof page (replaces __FONT_A__ and __FONT_B__ with base64), so the
// proof looks the same when it is opened anywhere. Usage:
//   node embed-fonts.mjs <template.html> <out.html> <font-a.woff2> <font-b.woff2>
import { readFileSync, writeFileSync } from 'node:fs';
const [tpl, out, a, b] = process.argv.slice(2);
if (!tpl || !out || !a || !b) { console.log('usage: node embed-fonts.mjs <template.html> <out.html> <font-a.woff2> <font-b.woff2>'); process.exit(tpl === '--help' ? 0 : 1); }
const b64 = (f) => readFileSync(f).toString('base64');
const html = readFileSync(tpl, 'utf8').replaceAll('__FONT_A__', b64(a)).replaceAll('__FONT_B__', b64(b));
writeFileSync(out, html);
console.log(`${out}: ${Math.round(html.length / 1024)} KB`);
