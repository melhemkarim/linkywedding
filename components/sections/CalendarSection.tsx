'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { wedding } from '@/lib/wedding';
import Pearls from './Pearls';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function Ring() {
  const id = useId().replace(/:/g, '');
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ filter: 'drop-shadow(0 4px 5px rgba(60,40,5,0.45))' }}>
      <defs>
        <linearGradient id={`rg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7e9bd" />
          <stop offset="0.45" stopColor="#c9a24d" />
          <stop offset="1" stopColor="#8d6a25" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="24" r="11" fill="none" stroke={`url(#rg-${id})`} strokeWidth="3.6" />
      <circle cx="20" cy="24" r="11" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.7" strokeDasharray="14 60" strokeDashoffset="-8" />
      <path d="M20 4.5l4.2 5.2L20 15.4l-4.2-5.7z" fill="#fffdf6" stroke="#c9a24d" strokeWidth="0.9" strokeLinejoin="round" />
      <path d="M20 4.5l1.6 2.6h-3.2z" fill="#fff" opacity="0.9" />
    </svg>
  );
}

function Sparkle({ delay }: { delay: number }) {
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 block h-0 w-0"
          style={{ rotate: i * 36 }}
        >
          <motion.span
            className="absolute block w-px origin-bottom bg-[#e8cf92]"
            style={{ height: 10, left: 0, bottom: 14 }}
            initial={{ scaleY: 0, opacity: 0, y: 0 }}
            animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0], y: [0, -10, -16] }}
            transition={{ duration: 1.1, delay: delay + (i % 2) * 0.05, ease: 'easeOut' }}
          />
        </motion.span>
      ))}
    </>
  );
}

function Countdown() {
  const [t, setT] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const target = new Date(wedding.start).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const cells: [string, number | undefined][] = [
    ['Days', t?.d],
    ['Hours', t?.h],
    ['Minutes', t?.m],
    ['Seconds', t?.s],
  ];

  return (
    <div className="mx-auto mt-14 grid max-w-md grid-cols-4 gap-2 text-center">
      {cells.map(([label, v]) => (
        <div key={label}>
          <div className="gold-text lining font-display text-[clamp(40px,12vw,58px)] font-light leading-none">
            {v === undefined ? '--' : String(v).padStart(2, '0')}
          </div>
          <div className="mt-2 font-sans text-[9.5px] font-normal uppercase tracking-[0.34em] text-ivory/50">{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function CalendarSection() {
  const date = new Date(wedding.start);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const monthName = date.toLocaleString('en-GB', { month: 'long' });
  const weekdayName = date.toLocaleString('en-GB', { weekday: 'long' });
  const first = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.55 });
  const [landed, setLanded] = useState(false);

  return (
    <section className="relative px-5 py-24">
      <motion.p
        className="mb-10 text-center font-sans text-[10.5px] font-normal uppercase tracking-[0.5em] text-gold"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6 }}
      >
        Save the date
      </motion.p>

      <div
        ref={ref}
        className="relative mx-auto w-full max-w-sm rounded-[3px] px-6 pb-8 pt-12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
        style={{
          background:
            'linear-gradient(180deg, #fbf7ec 0%, var(--paper) 100%)',
          color: 'var(--ink)',
        }}
      >
        {/* binding holes */}
        <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-24">
          {[0, 1].map((i) => (
            <span key={i} className="block h-2.5 w-2.5 rounded-full" style={{ background: 'var(--bg)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6)' }} />
          ))}
        </div>

        <div className="text-center">
          <p className="font-display text-[34px] font-light uppercase leading-none tracking-[0.28em]" style={{ paddingLeft: '0.28em' }}>
            {monthName}
          </p>
          <p className="lining mt-2 font-sans text-[11px] font-normal tracking-[0.5em] text-[#8a6a2f]">{year}</p>
        </div>

        <div className="mx-auto my-5 h-px w-24" style={{ background: 'linear-gradient(90deg,transparent,#c9a24d,transparent)' }} />

        <div className="grid grid-cols-7 text-center">
          {WEEKDAYS.map((w, i) => (
            <div key={i} className="pb-2 font-sans text-[10px] font-normal tracking-widest text-[#8a6a2f]">
              {w}
            </div>
          ))}
          {cells.map((d, i) => {
            const isDay = d === day;
            return (
              <div key={i} className="relative grid aspect-square place-items-center">
                {d && (
                  <span className={`lining relative z-0 font-display text-[19px] ${isDay ? 'font-medium' : 'font-light opacity-80'}`}>{d}</span>
                )}
                {isDay && (
                  <>
                    <motion.span
                      className="absolute inset-[-8%] z-0 rounded-full"
                      style={{ background: 'radial-gradient(circle, rgba(201,162,77,0.38), rgba(201,162,77,0) 70%)' }}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={landed ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 1.4, ease: 'easeOut' }}
                    />
                    <motion.div
                      className="absolute left-1/2 top-1/2 z-20"
                      style={{ marginLeft: -20, marginTop: -26 }}
                      initial={{ y: -560, opacity: 0, rotate: -22 }}
                      animate={inView ? { y: [-560, 0, -16, 0, -4, 0], opacity: 1, rotate: 0 } : {}}
                      transition={{
                        y: { duration: 2.2, times: [0, 0.5, 0.66, 0.8, 0.9, 1], ease: ['easeIn', 'easeOut', 'easeIn', 'easeOut', 'easeIn'] },
                        opacity: { duration: 0.5 },
                        rotate: { duration: 1.1, ease: 'easeOut' },
                      }}
                      onAnimationComplete={() => setLanded(true)}
                    >
                      <Ring />
                    </motion.div>
                    {landed && <Sparkle delay={0} />}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-center font-display text-[17px] font-light italic text-[#5c4a22]">
          {weekdayName} the {day}
          {['th', 'st', 'nd', 'rd'][day % 10 > 3 || Math.floor(day / 10) === 1 ? 0 : day % 10]}
        </p>
      </div>

      <Countdown />

      <div className="mt-16">
        <Pearls slug="main" />
        <p className="mt-3 text-center font-display text-[15px] font-light italic text-ivory/55">
          One pearl for every day until we celebrate.
        </p>
      </div>
    </section>
  );
}
