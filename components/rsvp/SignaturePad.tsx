'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

export type SignatureHandle = {
  isEmpty: () => boolean;
  toDataURL: () => string;
  clear: () => void;
};

type Pt = { x: number; y: number; w: number };

const SignaturePad = forwardRef<SignatureHandle, { onInk?: (has: boolean) => void }>(function SignaturePad({ onInk }, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Pt[][]>([]);
  const current = useRef<Pt[] | null>(null);
  const last = useRef({ x: 0, y: 0, t: 0, w: 2.6 });
  const [hasInk, setHasInk] = useState(false);

  const paint = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const g = c.getContext('2d')!;
    const dpr = c.width / c.clientWidth || 1;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, c.clientWidth, c.clientHeight);
    const grad = g.createLinearGradient(0, 0, c.clientWidth, 0);
    grad.addColorStop(0, '#b8923f');
    grad.addColorStop(0.5, '#f3e2ac');
    grad.addColorStop(1, '#c9a24d');
    g.strokeStyle = grad;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.shadowColor = 'rgba(232,205,140,0.45)';
    g.shadowBlur = 5;

    for (const s of strokes.current) {
      if (s.length === 1) {
        g.fillStyle = '#e4c987';
        g.beginPath();
        g.arc(s[0].x, s[0].y, s[0].w / 2, 0, Math.PI * 2);
        g.fill();
        continue;
      }
      for (let i = 1; i < s.length; i++) {
        const a = s[i - 1];
        const b = s[i];
        const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const prevM = i === 1 ? a : { x: (s[i - 2].x + a.x) / 2, y: (s[i - 2].y + a.y) / 2 };
        g.lineWidth = b.w;
        g.beginPath();
        g.moveTo(prevM.x, prevM.y);
        g.quadraticCurveTo(a.x, a.y, m.x, m.y);
        g.stroke();
      }
    }
  }, []);

  const resize = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.clientWidth;
    const h = c.clientHeight;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      paint();
    }
  }, [paint]);

  useEffect(() => {
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.current) ro.observe(canvas.current);
    return () => ro.disconnect();
  }, [resize]);

  useImperativeHandle(ref, () => ({
    isEmpty: () => strokes.current.length === 0,
    clear: () => {
      strokes.current = [];
      setHasInk(false);
      onInk?.(false);
      paint();
    },
    toDataURL: () => {
      const c = canvas.current!;
      const out = document.createElement('canvas');
      out.width = c.width;
      out.height = c.height;
      const g = out.getContext('2d')!;
      g.fillStyle = '#0b2a21';
      g.fillRect(0, 0, out.width, out.height);
      g.drawImage(c, 0, 0);
      return out.toDataURL('image/png');
    },
  }));

  const pos = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = pos(e);
    last.current = { ...p, t: performance.now(), w: 2.8 };
    current.current = [{ ...p, w: 2.8 }];
    strokes.current.push(current.current);
    if (!hasInk) {
      setHasInk(true);
      onInk?.(true);
    }
    paint();
  };

  const move = (e: React.PointerEvent) => {
    if (!current.current) return;
    const p = pos(e);
    const now = performance.now();
    const dist = Math.hypot(p.x - last.current.x, p.y - last.current.y);
    const speed = dist / Math.max(1, now - last.current.t);
    const target = Math.max(1.3, 3.8 - speed * 1.5);
    const w = last.current.w + (target - last.current.w) * 0.3;
    last.current = { ...p, t: now, w };
    current.current.push({ ...p, w });
    paint();
  };

  const up = () => {
    current.current = null;
  };

  return (
    <div
      className="relative h-44 w-full overflow-hidden rounded-[3px]"
      style={{ background: 'rgba(0,0,0,0.22)', boxShadow: 'inset 0 0 0 1px rgba(214,185,122,0.3)' }}
    >
      <canvas
        ref={canvas}
        className="absolute inset-0 h-full w-full"
        style={{ touchAction: 'none' }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      />
      <div className="pointer-events-none absolute inset-x-6 bottom-9 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(214,185,122,0.5),transparent)' }} />
      <span className="pointer-events-none absolute bottom-[34px] left-6 font-display text-lg text-gold/60">&times;</span>
      {!hasInk && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[17px] font-light italic text-ivory/35">
          Sign here with your finger
        </span>
      )}
      {hasInk && (
        <button
          type="button"
          onClick={() => {
            strokes.current = [];
            setHasInk(false);
            onInk?.(false);
            paint();
          }}
          className="absolute right-3 top-2.5 font-sans text-[10px] font-normal uppercase tracking-[0.3em] text-ivory/45 hover:text-ivory/80"
        >
          Clear
        </button>
      )}
    </div>
  );
});

export default SignaturePad;
