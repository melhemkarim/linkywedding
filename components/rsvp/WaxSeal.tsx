'use client';

import { useId, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { initials } from '@/lib/wedding';

// An irregular wax blob, generated once
const BLOB = (() => {
  const n = 18;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = 46 + 3.2 * Math.sin(a * 5 + 0.6) + 2.2 * Math.cos(a * 9 + 1.1) + 1.4 * Math.sin(a * 3);
    return { x: 60 + Math.cos(a) * r, y: 60 + Math.sin(a) * r };
  });
  let d = '';
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % n];
    const m = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
    d += i === 0 ? `M${((pts[n - 1].x + p.x) / 2).toFixed(1)} ${((pts[n - 1].y + p.y) / 2).toFixed(1)}` : '';
    d += ` Q${p.x.toFixed(1)} ${p.y.toFixed(1)} ${m.x.toFixed(1)} ${m.y.toFixed(1)}`;
  });
  return d + 'Z';
})();

type Props = {
  /** Return true if the reply is valid and was sent. Returning false rewinds the seal. */
  onSeal: () => Promise<boolean>;
  sealed: boolean;
  busy: boolean;
};

const RING = 2 * Math.PI * 62;

export default function WaxSeal({ onSeal, sealed, busy }: Props) {
  const id = useId().replace(/:/g, '');
  const progress = useMotionValue(0);
  const ringOffset = useTransform(progress, (v) => RING * (1 - v));
  const scale = useTransform(progress, [0, 1], [0.86, 1]);
  const holding = useRef(false);
  const ctl = useRef<ReturnType<typeof animate> | null>(null);
  const [stamp, setStamp] = useState(false);

  const complete = async () => {
    const ok = await onSeal();
    if (ok) {
      setStamp(true);
    } else {
      animate(progress, 0, { duration: 0.5, ease: 'easeOut' });
    }
  };

  const start = () => {
    if (sealed || busy || holding.current) return;
    holding.current = true;
    ctl.current = animate(progress, 1, {
      duration: 1.15,
      ease: 'linear',
      onComplete: () => {
        if (holding.current) {
          holding.current = false;
          void complete();
        }
      },
    });
  };

  const cancel = () => {
    if (!holding.current) return;
    holding.current = false;
    ctl.current?.stop();
    animate(progress, 0, { duration: 0.35, ease: 'easeOut' });
  };

  const isSealed = sealed || stamp;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[132px] w-[132px]">
        {/* shockwave when the seal lands */}
        {stamp && (
          <motion.span
            className="absolute inset-0 rounded-full border border-gold"
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 2.1, opacity: 0 }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
          />
        )}

        <button
          type="button"
          aria-label="Press and hold to seal your reply"
          disabled={isSealed}
          onPointerDown={start}
          onPointerUp={cancel}
          onPointerLeave={cancel}
          onPointerCancel={cancel}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !holding.current && !isSealed && !busy) {
              e.preventDefault();
              progress.set(1);
              void complete();
            }
          }}
          className="relative h-full w-full select-none rounded-full outline-none focus-visible:ring-1 focus-visible:ring-gold"
          style={{ touchAction: 'none', WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ scale: isSealed ? undefined : scale }}
            initial={false}
            animate={stamp ? { scale: [1.35, 0.96, 1] } : undefined}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <svg viewBox="0 0 120 120" className="h-full w-full" style={{ filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.55))' }}>
              <defs>
                <radialGradient id={`wax-${id}`} cx="0.38" cy="0.32" r="0.85">
                  <stop offset="0" stopColor="#f0dba4" />
                  <stop offset="0.5" stopColor="#c9a24d" />
                  <stop offset="1" stopColor="#8a6a2b" />
                </radialGradient>
              </defs>
              <path d={BLOB} fill={`url(#wax-${id})`} />
              <circle cx="60" cy="60" r="33" fill="none" stroke="#7a5c22" strokeOpacity="0.55" strokeWidth="1.6" />
              <circle cx="60" cy="60" r="33" fill="none" stroke="#fff3c9" strokeOpacity="0.45" strokeWidth="0.8" transform="translate(0.8 0.8)" />
              <circle cx="60" cy="60" r="28.500" fill="none" stroke="#7a5c22" strokeOpacity="0.35" strokeWidth="0.8" strokeDasharray="1.2 3" />
              <text
                x="60"
                y="70"
                textAnchor="middle"
                fontFamily="'Cormorant Garamond', serif"
                fontStyle="italic"
                fontWeight="500"
                fontSize="30"
                fill="#6d5120"
                stroke="#f3e2ae"
                strokeOpacity="0.5"
                strokeWidth="0.5"
              >
                {initials[0]}
                {initials[1]}
              </text>
            </svg>
          </motion.div>

          {!isSealed && (
            <svg viewBox="0 0 132 132" className="pointer-events-none absolute -inset-0 h-full w-full -rotate-90">
              <circle cx="66" cy="66" r="62" fill="none" stroke="rgba(214,185,122,0.22)" strokeWidth="1" />
              <motion.circle
                cx="66"
                cy="66"
                r="62"
                fill="none"
                stroke="#f1deaa"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={RING}
                style={{ strokeDashoffset: ringOffset }}
              />
            </svg>
          )}
        </button>
      </div>

      <p className="mt-5 font-sans text-[10.5px] font-normal uppercase tracking-[0.4em] text-ivory/55" style={{ paddingLeft: '0.4em' }}>
        {isSealed ? 'Sealed' : busy ? 'Sending…' : 'Press & hold to seal'}
      </p>
    </div>
  );
}
