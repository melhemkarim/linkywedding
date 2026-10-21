'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { wedding } from '@/lib/wedding';
import { googleCalendarUrl } from '@/lib/ics';

function SilkPanel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 96%', 'start 42%'] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [-72, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.85, 1]);
  const scaleY = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const sheen = useTransform(scrollYProgress, [0, 1], ['115% 0%', '-15% 0%']);

  return (
    <div ref={ref} style={{ perspective: 1100 }}>
      <motion.div
        className="relative overflow-hidden rounded-[3px] px-6 py-10 text-center sm:px-7"
        style={{
          rotateX,
          opacity,
          scaleY,
          transformOrigin: 'top center',
          backgroundImage:
            'linear-gradient(112deg, var(--silk-a) 0%, var(--silk-b) 26%, rgba(255,240,200,0.16) 38%, var(--silk-b) 50%, var(--silk-a) 100%)',
          backgroundSize: '260% 100%',
          backgroundPosition: sheen,
          boxShadow: 'inset 0 0 0 1px rgba(214,185,122,0.32), 0 24px 50px -24px rgba(0,0,0,0.8)',
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35), transparent)' }} />
        <div className="pointer-events-none absolute inset-[7px] rounded-[2px]" style={{ boxShadow: 'inset 0 0 0 1px rgba(214,185,122,0.14)' }} />
        <div className="relative">{children}</div>
      </motion.div>
    </div>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-5 font-sans text-[10.5px] font-normal uppercase tracking-[0.5em] text-gold" style={{ paddingLeft: '0.5em' }}>
    {children}
  </p>
);

function Diamond() {
  return (
    <div className="my-5 flex items-center justify-center gap-3">
      <span className="h-px w-10" style={{ background: 'linear-gradient(90deg,transparent,var(--gold))' }} />
      <span className="h-1 w-1 rotate-45 bg-gold" />
      <span className="h-px w-10" style={{ background: 'linear-gradient(270deg,transparent,var(--gold))' }} />
    </div>
  );
}

function VenuePanel() {
  const { venue } = wedding;
  const when = new Date(wedding.start).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: wedding.timezone,
  });

  return (
    <SilkPanel>
      <Label>Location</Label>
      <h3 className="font-display text-[clamp(26px,8vw,32px)] font-light leading-tight text-ivory">{venue.name}</h3>
      <p className="mt-3 font-display text-[18px] font-light italic" style={{ color: 'var(--gold-soft)' }}>
        {when}
      </p>
      <p className="font-display text-[17px] font-light italic text-ivory/60">{wedding.timeLabel}</p>
      <Diamond />
      <p className="text-[13.5px] text-ivory/70">{venue.address}</p>

      <svg viewBox="0 0 300 150" className="mx-auto mt-6 w-full max-w-[18rem]" role="img" aria-label="Map">
        <g fill="none" stroke="rgba(214,185,122,0.35)" strokeWidth="0.9">
          <path d="M-5 112C60 98 90 124 150 100S250 70 305 84" />
          <path d="M40 -5C58 40 44 80 70 155" />
          <path d="M170 -5C160 38 196 70 188 155" />
          <path d="M-5 50C70 62 120 30 200 46S280 40 305 28" />
          <path d="M230 -5C240 50 262 90 250 155" strokeOpacity="0.6" />
        </g>
        <circle cx="150" cy="72" r="26" fill="rgba(214,185,122,0.08)" />
        <circle cx="150" cy="72" r="14" fill="rgba(214,185,122,0.12)" />
        <path d="M150 52c-9 0-15 6.5-15 14.6 0 10.6 15 25.4 15 25.4s15-14.8 15-25.4C165 58.5 159 52 150 52z" fill="#d6b97a" />
        <circle cx="150" cy="66.5" r="5.5" fill="var(--bg)" />
      </svg>

      <a
        href={venue.mapUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-block border-b border-gold/50 py-2 font-sans text-[11px] font-normal uppercase tracking-[0.36em] text-gold transition-colors hover:border-gold"
      >
        Open in Maps
      </a>
    </SilkPanel>
  );
}

export default function Details({ guestName }: { guestName?: string }) {
  return (
    <section className="px-5 py-24">
      <div className="mx-auto flex max-w-sm flex-col gap-7">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1.5 }}
        >
          <p className="font-sans text-[10.5px] font-normal uppercase tracking-[0.5em] text-gold" style={{ paddingLeft: '0.5em' }}>
            The day
          </p>
          {guestName && <p className="mt-5 font-display text-[22px] font-light italic text-ivory/85">Reserved for {guestName}</p>}
        </motion.div>

        <VenuePanel />

        <SilkPanel>
          <Label>Dress code</Label>
          <h3 className="font-display text-[clamp(26px,8vw,32px)] font-light leading-tight text-ivory">{wedding.dressCode.title}</h3>
          <Diamond />
          <p className="mx-auto max-w-[16rem] font-display text-[17px] font-light italic text-ivory/60">{wedding.dressCode.note}</p>
        </SilkPanel>

        <div className="mt-4 text-center">
          <a
            href="/api/calendar"
            className="inline-block border border-gold/60 px-9 py-4 font-sans text-[11px] font-normal uppercase tracking-[0.4em] text-gold transition-colors hover:bg-gold hover:text-bg"
            style={{ paddingLeft: 'calc(2.25rem + 0.4em)' }}
          >
            Add to calendar
          </a>
          <div className="mt-4">
            <a href={googleCalendarUrl()} target="_blank" rel="noreferrer" className="inline-block py-2 font-display text-[15px] italic text-ivory/45 underline decoration-ivory/20 underline-offset-4 hover:text-ivory/70">
              or open in Google Calendar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
