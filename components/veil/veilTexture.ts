/**
 * Paints the veil's lace edging and the guest's gold-thread embroidery onto a 2D canvas.
 * The canvas becomes a texture inside the fabric shader, so the lace and name ripple with the cloth.
 */

const IVORY = '255,251,242';
const FONT = (s: number) => `italic 500 ${s}px "Cormorant Garamond", "Times New Roman", serif`;

function laceStrip(len: number, depth: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.ceil(len);
  c.height = Math.ceil(depth);
  const g = c.getContext('2d')!;

  const count = Math.max(3, Math.round(len / (depth * 1.05)));
  const w = len / count;
  const yb = depth * 0.52;
  const sag = depth * 0.46;

  // soft lace body, fading into the sheer cloth above
  const body = new Path2D();
  body.moveTo(0, 0);
  body.lineTo(len, 0);
  body.lineTo(len, yb);
  for (let i = count - 1; i >= 0; i--) {
    body.quadraticCurveTo(i * w + w / 2, yb + sag * 2, i * w, yb);
  }
  body.closePath();
  const grad = g.createLinearGradient(0, 0, 0, depth);
  grad.addColorStop(0, `rgba(${IVORY},0)`);
  grad.addColorStop(0.55, `rgba(${IVORY},0.42)`);
  grad.addColorStop(1, `rgba(${IVORY},0.7)`);
  g.fillStyle = grad;
  g.fill(body);

  // carve tiny eyelets through the body
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < count * 3; i++) {
    const x = (i + 0.5) * (w / 3);
    g.beginPath();
    g.arc(x, yb - depth * 0.22, Math.max(1, depth * 0.022), 0, Math.PI * 2);
    g.fill();
    if (i % 3 === 1) continue;
    g.beginPath();
    g.arc(x, yb - depth * 0.34, Math.max(0.8, depth * 0.016), 0, Math.PI * 2);
    g.fill();
  }
  g.globalCompositeOperation = 'source-over';

  // scalloped outlines
  const scallop = (y0: number, s: number, lw: number, a: number) => {
    g.beginPath();
    g.moveTo(0, y0);
    for (let i = 0; i < count; i++) g.quadraticCurveTo(i * w + w / 2, y0 + s * 2, (i + 1) * w, y0);
    g.strokeStyle = `rgba(${IVORY},${a})`;
    g.lineWidth = lw;
    g.stroke();
  };
  scallop(yb, sag, Math.max(1.6, depth * 0.032), 0.98);
  scallop(yb - depth * 0.085, sag * 0.78, Math.max(0.9, depth * 0.014), 0.8);

  // one embroidered flower in every scallop
  const fr = depth * 0.115;
  for (let i = 0; i < count; i++) {
    const cx = (i + 0.5) * w;
    const cy = yb + sag * 0.4;
    g.fillStyle = `rgba(${IVORY},0.97)`;
    for (let p = 0; p < 6; p++) {
      const a = (p / 6) * Math.PI * 2;
      g.beginPath();
      g.ellipse(cx + Math.cos(a) * fr * 0.85, cy + Math.sin(a) * fr * 0.85, fr * 0.56, fr * 0.27, a, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = 'rgba(236,214,160,1)';
    g.beginPath();
    g.arc(cx, cy, fr * 0.3, 0, Math.PI * 2);
    g.fill();

    // small leaves + a garland arc to the next flower
    g.strokeStyle = `rgba(${IVORY},0.8)`;
    g.lineWidth = Math.max(0.8, depth * 0.012);
    g.beginPath();
    g.moveTo(cx + fr * 1.6, cy - fr * 0.5);
    g.quadraticCurveTo(cx + w / 2, cy - fr * 1.4, cx + w - fr * 1.6, cy - fr * 0.5);
    g.stroke();
    g.fillStyle = `rgba(${IVORY},0.9)`;
    g.beginPath();
    g.arc(cx + w / 2, cy - fr * 0.95, Math.max(1.2, depth * 0.018), 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

function fitLines(g: CanvasRenderingContext2D, text: string, maxW: number, base: number) {
  let size = base;
  g.font = FONT(size);
  let lines = [text];
  if (g.measureText(text).width > maxW) {
    const words = text.split(' ');
    if (words.length >= 3) lines = [words.slice(0, -1).join(' '), words[words.length - 1]];
    else if (words.length === 2) lines = words;
  }
  const widest = () => Math.max(...lines.map((l) => g.measureText(l).width));
  while (widest() > maxW && size > 20) {
    size -= 2;
    g.font = FONT(size);
  }
  return { lines, size };
}

function embroider(g: CanvasRenderingContext2D, w: number, h: number, text: string) {
  const baseSize = Math.min(w * 0.095, h * 0.055, 62);
  const { lines, size } = fitLines(g, text, w * 0.78, baseSize);
  const lineH = size * 1.12;
  const cy = h * 0.5 - ((lines.length - 1) * lineH) / 2;

  // mask of the text
  const mask = document.createElement('canvas');
  mask.width = w;
  mask.height = h;
  const mg = mask.getContext('2d')!;
  mg.font = FONT(size);
  mg.textAlign = 'center';
  mg.textBaseline = 'middle';
  mg.fillStyle = '#fff';
  lines.forEach((l, i) => mg.fillText(l, w / 2, cy + i * lineH));

  // gold thread: gradient + satin-stitch hatching, clipped to the mask
  const gold = document.createElement('canvas');
  gold.width = w;
  gold.height = h;
  const gg = gold.getContext('2d')!;
  const x0 = w * 0.1;
  const x1 = w * 0.9;
  const lg = gg.createLinearGradient(x0, cy - size, x1, cy + size);
  ['#8c6a2c', '#e9d29b', '#b88b3d', '#f6e8b8', '#a37a30'].forEach((c, i, a) => lg.addColorStop(i / (a.length - 1), c));
  gg.fillStyle = lg;
  gg.fillRect(0, 0, w, h);
  gg.lineWidth = 0.7;
  const top = cy - size;
  const bottom = cy + lineH * (lines.length - 1) + size;
  for (let y = top; y < bottom; y += 1.7) {
    gg.strokeStyle = 'rgba(70,45,10,0.22)';
    gg.beginPath();
    gg.moveTo(0, y);
    gg.lineTo(w, y - w * 0.45);
    gg.stroke();
    gg.strokeStyle = 'rgba(255,246,214,0.22)';
    gg.beginPath();
    gg.moveTo(0, y + 0.85);
    gg.lineTo(w, y + 0.85 - w * 0.45);
    gg.stroke();
  }
  gg.globalCompositeOperation = 'destination-in';
  gg.drawImage(mask, 0, 0);

  g.save();
  g.shadowColor = 'rgba(70,50,15,0.5)';
  g.shadowBlur = 3;
  g.shadowOffsetY = 1.6;
  g.drawImage(gold, 0, 0);
  g.restore();

  // fine raised edge thread
  g.save();
  g.font = FONT(size);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.strokeStyle = 'rgba(255,236,170,0.55)';
  g.lineWidth = 0.6;
  lines.forEach((l, i) => g.strokeText(l, w / 2, cy + i * lineH));
  g.restore();

  // hairline flourish beneath the name
  const fy = cy + lineH * (lines.length - 1) + size * 0.95;
  const fw = Math.min(w * 0.3, 190);
  const fg = g.createLinearGradient(w / 2 - fw, 0, w / 2 + fw, 0);
  fg.addColorStop(0, 'rgba(200,164,88,0)');
  fg.addColorStop(0.5, 'rgba(214,180,106,0.95)');
  fg.addColorStop(1, 'rgba(200,164,88,0)');
  g.strokeStyle = fg;
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(w / 2 - fw, fy);
  g.lineTo(w / 2 + fw, fy);
  g.stroke();
  g.fillStyle = 'rgba(226,194,120,1)';
  g.beginPath();
  g.moveTo(w / 2, fy - 4);
  g.lineTo(w / 2 + 3.5, fy);
  g.lineTo(w / 2, fy + 4);
  g.lineTo(w / 2 - 3.5, fy);
  g.closePath();
  g.fill();
}

export function buildVeilCanvas(w: number, h: number, name: string) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;

  const bottom = Math.max(70, Math.round(h * 0.085));
  const side = Math.max(34, Math.round(w * 0.06));

  g.drawImage(laceStrip(w, bottom), 0, h - bottom);

  const sideStrip = laceStrip(h, side);
  g.save();
  g.translate(side, 0);
  g.rotate(Math.PI / 2);
  g.drawImage(sideStrip, 0, 0);
  g.restore();
  g.save();
  g.translate(w - side, h);
  g.rotate(-Math.PI / 2);
  g.drawImage(sideStrip, 0, 0);
  g.restore();

  embroider(g, w, h, name);
  return c;
}
