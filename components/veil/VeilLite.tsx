'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { Tilt } from '@/lib/useTilt';

// Scalloped lace edge as a tiling SVG (no WebGL needed)
const LACE_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="48" viewBox="0 0 64 48">
    <path d="M0 0H64V22Q48 62 32 22Q16 62 0 22Z" fill="rgba(255,251,242,0.62)"/>
    <path d="M0 22Q16 62 32 22Q48 62 64 22" fill="none" stroke="rgba(255,251,242,0.98)" stroke-width="1.8"/>
    <g fill="rgba(255,251,242,0.98)">
      <ellipse cx="32" cy="34" rx="5" ry="2.4"/><ellipse cx="32" cy="34" rx="5" ry="2.4" transform="rotate(60 32 34)"/>
      <ellipse cx="32" cy="34" rx="5" ry="2.4" transform="rotate(120 32 34)"/>
    </g>
    <circle cx="32" cy="34" r="1.8" fill="rgb(236,214,160)"/>
  </svg>`
);

type Props = { lift: MotionValue<number>; name: string; tilt: React.MutableRefObject<Tilt> };

export default function VeilLite({ lift, name }: Props) {
  const y = useTransform(lift, [0, 1], ['0%', '-108%']);
  const scaleY = useTransform(lift, [0, 0.8, 1], [1, 0.4, 0.34]);
  const pleats = useTransform(lift, [0, 0.12, 1], [0, 0.55, 1]);

  return (
    <motion.div className="absolute inset-0" style={{ y, scaleY, transformOrigin: 'top center' }}>
      <div className="veil-lite-mesh absolute inset-0" />
      {/* folds appear as it gathers */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: pleats,
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(0,0,0,0) 0, rgba(0,0,0,0.07) 14px, rgba(255,255,255,0.12) 24px, rgba(0,0,0,0) 38px)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[88px]"
        style={{
          backgroundImage: `url("data:image/svg+xml,${LACE_SVG}")`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: '64px 48px',
          backgroundPosition: 'bottom',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center px-8">
        <div className="text-center">
          <p
            className="gold-text font-display italic font-medium leading-tight"
            style={{ fontSize: 'clamp(30px, 8.5vw, 52px)' }}
          >
            {name}
          </p>
          <div className="mx-auto mt-4 h-px w-40" style={{ background: 'linear-gradient(90deg,transparent,#d6b46a,transparent)' }} />
        </div>
      </div>
    </motion.div>
  );
}
