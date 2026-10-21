'use client';

import dynamic from 'next/dynamic';
import { motion, type Variants } from 'framer-motion';
import { initials, wedding } from '@/lib/wedding';
import type { Tier } from '@/lib/useRenderTier';
import type { Tilt } from '@/lib/useTilt';
import GoldDust from './GoldDust';

const Monogram3D = dynamic(() => import('./Monogram3D'), { ssr: false });

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.55, delayChildren: 0.5 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.8, ease: [0.22, 0.61, 0.36, 1] } },
};

export default function Hero({
  revealed,
  tier,
  tilt,
}: {
  revealed: boolean;
  tier: Tier | null;
  tilt: React.MutableRefObject<Tilt>;
}) {
  const { first, second } = wedding.couple;

  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{ minHeight: '100svh' }}
    >
      {/* the dark, blurred room behind the veil */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% 30%, var(--bg2) 0%, var(--bg) 70%), var(--bg)',
        }}
      />
      <div className="absolute -left-24 top-[12%] h-72 w-72 rounded-full opacity-[0.22] blur-3xl" style={{ background: '#d6b97a' }} />
      <div className="absolute -right-24 top-[46%] h-80 w-80 rounded-full opacity-[0.16] blur-3xl" style={{ background: '#e8d3a0' }} />
      <GoldDust />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center">
        <motion.div
          className="relative w-full"
          style={{ height: 'min(42svh, 400px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0.9 }}
          transition={{ duration: 2.2 }}
        >
          {tier === 'full' ? (
            <Monogram3D initials={initials} tilt={tilt} />
          ) : tier === 'lite' ? (
            <div className="flex h-full items-center justify-center">
              <span
                className="gold-text font-display italic font-medium leading-none"
                style={{ fontSize: 'clamp(110px, 34vw, 190px)', filter: 'drop-shadow(0 6px 18px rgba(214,185,122,0.25))' }}
              >
                {initials[0]}
                <span className="mx-[0.12em] text-[0.42em] align-middle">&amp;</span>
                {initials[1]}
              </span>
            </div>
          ) : null}
        </motion.div>

        <motion.div variants={container} initial="hidden" animate={revealed ? 'show' : 'hidden'} className="flex flex-col items-center">
          <motion.h1
            variants={rise}
            className="font-display font-light uppercase text-ivory"
            style={{ fontSize: 'clamp(34px, 9.5vw, 64px)', letterSpacing: '0.2em', lineHeight: 1.1, paddingLeft: '0.2em' }}
          >
            {first}
          </motion.h1>
          <motion.span variants={rise} className="gold-text my-1 font-display text-3xl italic">
            &amp;
          </motion.span>
          <motion.h1
            variants={rise}
            className="font-display font-light uppercase text-ivory"
            style={{ fontSize: 'clamp(34px, 9.5vw, 64px)', letterSpacing: '0.2em', lineHeight: 1.1, paddingLeft: '0.2em' }}
          >
            {second}
          </motion.h1>

          <motion.div variants={rise} className="my-7 flex items-center gap-3">
            <span className="h-px w-16" style={{ background: 'linear-gradient(90deg,transparent,var(--gold))' }} />
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="h-px w-16" style={{ background: 'linear-gradient(270deg,transparent,var(--gold))' }} />
          </motion.div>

          <motion.p variants={rise} className="font-display text-[clamp(19px,5vw,25px)] font-light italic text-ivory/80">
            Together with their families, invite you&hellip;
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 text-gold/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 1.6, delay: 4 }}
      >
        <svg width="14" height="26" viewBox="0 0 14 26" style={{ animation: 'hintRise 3s ease-in-out infinite reverse' }}>
          <path d="M1 18l6 6 6-6M7 2v21" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  );
}
