'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createMusic } from '@/lib/ambient';
import { wedding } from '@/lib/wedding';

export default function MusicButton({ visible }: { visible: boolean }) {
  const music = useRef<ReturnType<typeof createMusic> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setHint(false), 9000);
    return () => clearTimeout(t);
  }, [visible]);

  const toggle = async () => {
    if (!music.current) music.current = createMusic(wedding.musicUrl);
    setHint(false);
    try {
      if (playing) {
        music.current.stop();
        setPlaying(false);
      } else {
        await music.current.start();
        setPlaying(true);
      }
    } catch {
      setPlaying(false);
    }
  };

  return (
    <motion.div
      className="fixed bottom-5 right-5 z-40 flex items-center gap-3"
      style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
      transition={{ duration: 1.4, delay: visible ? 2.5 : 0 }}
    >
      <AnimatePresence>
        {hint && !playing && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="font-display text-[15px] italic text-ivory/60"
          >
            tap to play
          </motion.span>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause music' : 'Play music'}
        className="grid h-11 w-11 place-items-center rounded-full border border-gold/50 bg-black/30 backdrop-blur-md transition-colors hover:border-gold"
      >
        <span className="flex h-4 items-end gap-[3px]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block w-[2px] bg-gold"
              animate={playing ? { height: ['30%', '100%', '45%', '85%', '30%'] } : { height: '30%' }}
              transition={playing ? { duration: 1.9 + i * 0.35, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
              style={{ height: '30%' }}
            />
          ))}
        </span>
      </button>
    </motion.div>
  );
}
