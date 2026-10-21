'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion';
import type { ThemeName } from '@/lib/wedding';
import { useRenderTier } from '@/lib/useRenderTier';
import { useTilt } from '@/lib/useTilt';
import Veil from './veil/Veil';
import Hero from './hero/Hero';
import CalendarSection from './sections/CalendarSection';
import Details from './sections/Details';
import Rsvp from './rsvp/Rsvp';
import MusicButton from './MusicButton';

export default function Invitation({
  veilName,
  guestName,
  theme,
}: {
  veilName: string;
  guestName?: string;
  theme: ThemeName;
}) {
  const lift = useMotionValue(0);
  const tilt = useTilt();
  const tier = useRenderTier();
  const [stage, setStage] = useState<'veil' | 'open'>('veil');
  const [revealed, setRevealed] = useState(false);

  useMotionValueEvent(lift, 'change', (v) => {
    if (v > 0.5 && !revealed) setRevealed(true);
  });

  // The scene behind the veil is dark and out of focus, and sharpens as the veil lifts.
  const sceneFilter = useTransform(lift, (v) => `blur(${(1 - v) * 14}px) brightness(${0.42 + 0.58 * v})`);
  // Light spills through as the cloth gathers, then settles
  const spill = useTransform(lift, [0, 0.25, 0.75, 1], [0, 0.35, 1, 0]);

  // Lock scroll while the veil is down
  useEffect(() => {
    const el = document.documentElement;
    if (stage === 'veil') {
      el.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      el.style.overflow = '';
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
    }
    return () => {
      el.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [stage]);

  const onOpened = useCallback(() => setStage('open'), []);

  return (
    <main data-theme={theme} className="relative min-h-[100svh] overflow-x-clip bg-bg text-ivory">
      <motion.div style={stage === 'veil' ? { filter: sceneFilter } : undefined}>
        <Hero revealed={revealed} tier={tier} tilt={tilt} />
      </motion.div>

      {stage === 'veil' && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[45]"
          style={{
            opacity: spill,
            mixBlendMode: 'screen',
            background:
              'radial-gradient(ellipse 90% 60% at 50% -8%, rgba(255,238,196,0.95) 0%, rgba(255,226,160,0.35) 38%, transparent 72%)',
          }}
        />
      )}

      <CalendarSection />
      <Details guestName={guestName} />
      <Rsvp defaultName={guestName} />

      <MusicButton visible={stage === 'open'} />

      {stage === 'veil' && tier && <Veil tier={tier} name={veilName} lift={lift} tilt={tilt} onOpened={onOpened} />}
    </main>
  );
}
