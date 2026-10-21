'use client';

import { useEffect, useState } from 'react';

type Mote = { left: number; top: number; size: number; dur: number; delay: number; dx: number; o: number };

/** Slow drifting gold dust. Generated after mount so SSR and client markup never disagree. */
export default function GoldDust({ count = 26 }: { count?: number }) {
  const [motes, setMotes] = useState<Mote[]>([]);

  useEffect(() => {
    setMotes(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        top: 30 + Math.random() * 70,
        size: 1.2 + Math.random() * 2.2,
        dur: 11 + Math.random() * 12,
        delay: -Math.random() * 20,
        dx: (Math.random() - 0.5) * 50,
        o: 0.35 + Math.random() * 0.5,
      }))
    );
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            background: 'radial-gradient(circle, #fbefc6 0%, #d6b46a 60%, transparent 100%)',
            boxShadow: '0 0 6px rgba(240,214,140,0.7)',
            animation: `dust ${m.dur}s linear ${m.delay}s infinite`,
            ['--dx' as string]: `${m.dx}px`,
            ['--o' as string]: m.o,
          }}
        />
      ))}
    </div>
  );
}
