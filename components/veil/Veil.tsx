'use client';

import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { animate, motion, type MotionValue } from 'framer-motion';
import { requestMotionPermission, type Tilt } from '@/lib/useTilt';
import type { Tier } from '@/lib/useRenderTier';
import type { Ripple } from './VeilGL';
import VeilLite from './VeilLite';

const VeilGL = dynamic(() => import('./VeilGL'), { ssr: false });

type Props = {
  tier: Tier;
  name: string;
  lift: MotionValue<number>;
  tilt: React.MutableRefObject<Tilt>;
  onOpened: () => void;
};

export default function Veil({ tier, name, lift, tilt, onOpened }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const ripples = useRef<Ripple[]>([]);
  const drag = useRef<{ startY: number; lastRipple: number } | null>(null);
  const opening = useRef(false);
  const askedMotion = useRef(false);
  const [touched, setTouched] = useState(false);

  const addRipple = useCallback((clientX: number, clientY: number, s = 1) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    ripples.current.push({
      x: (clientX - r.left) / r.width,
      y: 1 - (clientY - r.top) / r.height,
      t0: performance.now() / 1000,
      s,
    });
    if (ripples.current.length > 5) ripples.current.shift();
  }, []);

  const open = useCallback(() => {
    if (opening.current) return;
    opening.current = true;
    setTouched(true);
    animate(lift, 1, { duration: 2.6, ease: [0.33, 0, 0.2, 1], onComplete: onOpened });
  }, [lift, onOpened]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (opening.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, lastRipple: 0 };
    setTouched(true);
    addRipple(e.clientX, e.clientY, 1);
    if (!askedMotion.current) {
      askedMotion.current = true;
      void requestMotionPermission();
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || opening.current) return;
    const now = performance.now();
    if (now - d.lastRipple > 110) {
      d.lastRipple = now;
      addRipple(e.clientX, e.clientY, 0.55);
    }
    const vh = ref.current?.clientHeight ?? window.innerHeight;
    lift.set(Math.max(0, Math.min(1, (d.startY - e.clientY) / (vh * 0.7))));
  };

  const onPointerUp = () => {
    if (!drag.current || opening.current) return;
    drag.current = null;
    if (lift.get() > 0.28) open();
    else animate(lift, 0, { duration: 1, ease: 'easeOut' });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp') {
      e.preventDefault();
      open();
    }
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label="Lift the veil to open your invitation"
      className="fixed inset-0 z-50 cursor-grab select-none outline-none active:cursor-grabbing"
      style={{ touchAction: 'none', height: '100svh' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      {tier === 'full' ? (
        <VeilGL lift={lift} name={name} ripples={ripples} tilt={tilt} />
      ) : (
        <VeilLite lift={lift} name={name} tilt={tilt} />
      )}

      <motion.div
        className="pointer-events-none absolute inset-x-0 flex flex-col items-center"
        style={{ bottom: 'max(15%, 110px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: touched ? 0 : 1 }}
        transition={{ duration: touched ? 0.5 : 1.6, delay: touched ? 0 : 1.8 }}
      >
        <svg width="14" height="22" viewBox="0 0 14 22" className="mb-2 text-[#FDDC5C]" style={{ animation: 'hintRise 2.8s ease-in-out infinite' }}>
          <path d="M1 8l6-6 6 6M7 3v17" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-sans text-[10.5px] font-bold uppercase tracking-[0.42em] text-[#FDDC5C]">
          Drag up to open
        </span>
      </motion.div>
    </div>
  );
}
