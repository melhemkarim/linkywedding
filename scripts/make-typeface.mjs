// Converts Cormorant Garamond Italic (500) into a three.js typeface JSON so the
// monogram can be extruded as real 3D geometry. Run with: npm run font
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const opentype = require('opentype.js');

const src = path.resolve(
  'node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff'
);
const out = path.resolve('public/fonts/cormorant-italic.typeface.json');

const buf = fs.readFileSync(src);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const upm = font.unitsPerEm;

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ&abcdefghijklmnopqrstuvwxyz '.split('');
const r = (n) => Math.round(n);

const glyphs = {};
for (const ch of chars) {
  const g = font.charToGlyph(ch);
  if (!g) continue;
  const cmds = g.path.commands;
  let o = '';
  for (const c of cmds) {
    if (c.type === 'M') o += `m ${r(c.x)} ${r(c.y)} `;
    else if (c.type === 'L') o += `l ${r(c.x)} ${r(c.y)} `;
    // three.js typeface order: end point first, then control point(s)
    else if (c.type === 'Q') o += `q ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)} `;
    else if (c.type === 'C') o += `b ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} `;
  }
  const bb = g.getBoundingBox();
  glyphs[ch] = {
    ha: r(g.advanceWidth),
    x_min: r(bb.x1),
    x_max: r(bb.x2),
    o: o.trim(),
  };
}

const json = {
  glyphs,
  familyName: 'Cormorant Garamond',
  ascender: r(font.ascender),
  descender: r(font.descender),
  underlinePosition: -100,
  underlineThickness: 50,
  boundingBox: { yMin: r(font.descender), xMin: 0, yMax: r(font.ascender), xMax: upm },
  resolution: upm,
  original_font_information: {},
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(json));
console.log(`wrote ${out} (${Object.keys(glyphs).length} glyphs, upm ${upm})`);
