'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { wedding } from '@/lib/wedding';

const W = 640;
const H = 340;

// A drooping strand: quadratic curve from the left clasp to the right clasp.
const P0 = { x: 24, y: 28 };
const P1 = { x: W / 2, y: 330 };
const P2 = { x: W - 24, y: 28 };

const point = (t: number) => ({
  x: (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x,
  y: (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y,
});

const daysBetween = (a: Date, b: Date) => Math.ceil((b.getTime() - a.getTime()) / 86400000);

/**
 * One pearl for every remaining day. Slots are fixed from the day the invitation was sent, so
 * each passing day removes the last pearl. A guest who returns sees the missing ones fall.
 */
export default function Pearls({ slug }: { slug: string }) {
  const gid = useId().replace(/:/g, '');
  const [now, setNow] = useState<Date | null>(null);
  const [fallen, setFallen] = useState(0);

  const total = useMemo(
    () => Math.max(1, daysBetween(new Date(wedding.invitesSentAt), new Date(wedding.start))),
    []
  );

  useEffect(() => setNow(new Date()), []);

  const left = now ? Math.max(0, Math.min(total, daysBetween(now, new Date(wedding.start)))) : total;

  useEffect(() => {
    if (!now) return;
    const key = `invite:pearls:${slug}`;
    try {
      const prev = Number(localStorage.getItem(key));
      if (prev && prev > left && prev - left <= 60) setFallen(prev - left);
      localStorage.setItem(key, String(left));
    } catch {
      /* private mode — fine */
    }
  }, [now, left, slug]);

  const slots = useMemo(() => Array.from({ length: total }, (_, i) => point((i + 0.5) / total)), [total]);
  // spacing along the curve (approx) decides pearl size
  const spacing = 3.6 * (284 / total);
  const r = Math.max(1.9, Math.min(7, spacing * 0.46));

  const strand = `M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`;

  return (
    <div className="mx-auto w-full max-w-xl">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" role="img" aria-label={`${left} days to go`}>
        <defs>
          <radialGradient id={`pearl-${gid}`} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.45" stopColor="#f6efe3" />
            <stop offset="1" stopColor="#c6b79d" />
          </radialGradient>
          <linearGradient id={`thread-${gid}`} x1="0" x2="1">
            <stop offset="0" stopColor="#b08a4a" />
            <stop offset="0.5" stopColor="#ecd9a4" />
            <stop offset="1" stopColor="#b08a4a" />
          </linearGradient>
        </defs>

        <path d={strand} fill="none" stroke={`url(#thread-${gid})`} strokeWidth="0.9" opacity="0.7" />

        {/* clasps */}
        {[P0, P2].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="5" fill="#d6b97a" stroke="#a8822f" strokeWidth="1" />
        ))}

        {/* faint slots for pearls already gone */}
        {slots.slice(left).map((p, i) => (
          <circle key={`g${i}`} cx={p.x} cy={p.y} r="0.7" fill="#d6b97a" opacity="0.25" />
        ))}

        {/* remaining pearls */}
        {slots.slice(0, left).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={r} fill={`url(#pearl-${gid})`} />
        ))}

        {/* pearls that fell since the guest's last visit */}
        {fallen > 0 &&
          slots.slice(left, left + fallen).map((p, i) => (
            <motion.circle
              key={`f${i}`}
              cx={p.x}
              r={r}
              fill={`url(#pearl-${gid})`}
              initial={{ cy: p.y, opacity: 1 }}
              animate={{ cy: p.y + 260, opacity: [1, 1, 0] }}
              transition={{ delay: 0.8 + i * 0.22, duration: 1.7, ease: [0.5, 0, 0.9, 0.6] }}
            />
          ))}
      </svg>
    </div>
  );
}
