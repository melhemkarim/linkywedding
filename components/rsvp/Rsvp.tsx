'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { wedding } from '@/lib/wedding';
import SignaturePad, { type SignatureHandle } from './SignaturePad';
import WaxSeal from './WaxSeal';

type Reply = { attending: boolean };
const STORAGE_KEY = 'invite:rsvp';

export default function Rsvp({ defaultName }: { defaultName?: string }) {
  const sig = useRef<SignatureHandle>(null);

  const [name, setName] = useState(defaultName ?? '');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Reply | null>(null);
  const [shake, setShake] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setDone(JSON.parse(saved) as Reply);
    } catch {
      /* ignore */
    }
  }, []);

  const fail = (msg: string) => {
    setError(msg);
    setShake((n) => n + 1);
    return false;
  };

  const seal = async (): Promise<boolean> => {
    setError(null);
    if (!name.trim()) return fail('Please tell us your name.');
    if (attending === null) return fail('Please tell us whether you will be joining us.');
    if (!sig.current || sig.current.isEmpty()) return fail('Please sign above with your finger.');

    setBusy(true);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          attending,
          note: note.trim(),
          signature: sig.current.toDataURL(),
        }),
      });
      if (!res.ok) throw new Error('bad status');
      const reply = { attending };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reply));
      } catch {
        /* ignore */
      }
      // let the wax land before the closing line appears
      setTimeout(() => setDone(reply), 1500);
      setBusy(false);
      return true;
    } catch {
      setBusy(false);
      return fail('Something went wrong sending your reply. Please try again.');
    }
  };

  const pill = (active: boolean) =>
    `flex-1 border px-2 py-4 font-sans text-[10.5px] font-normal uppercase tracking-[0.24em] transition-colors sm:px-3 sm:tracking-[0.28em] ${
      active ? 'border-gold bg-gold text-bg' : 'border-gold/35 text-ivory/70 hover:border-gold/70'
    }`;

  return (
    <section className="px-5 pb-32 pt-24">
      <div
        className="mx-auto max-w-sm rounded-[3px] px-5 py-12 sm:px-6"
        style={{
          background: 'linear-gradient(180deg, var(--silk-b), var(--silk-a))',
          boxShadow: 'inset 0 0 0 1px rgba(214,185,122,0.32), 0 30px 70px -30px rgba(0,0,0,0.85)',
        }}
      >
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              className="py-8 text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.6 }}
            >
              <div className="mx-auto mb-8 h-px w-16" style={{ background: 'linear-gradient(90deg,transparent,var(--gold),transparent)' }} />
              <p className="gold-text font-display text-[30px] font-light italic leading-snug">
                {done.attending ? 'We can’t wait to celebrate with you.' : 'You will be so very missed.'}
              </p>
              <p className="mt-5 font-display text-[17px] font-light italic text-ivory/55">
                {done.attending ? 'Your reply has been sealed and sent.' : 'Thank you for letting us know.'}
              </p>
            </motion.div>
          ) : (
            <motion.div key="form" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              <div className="text-center">
                <p className="font-sans text-[10.5px] font-normal uppercase tracking-[0.5em] text-gold" style={{ paddingLeft: '0.5em' }}>
                  Kindly reply
                </p>
                <p className="mt-4 font-display text-[18px] font-light italic text-ivory/60">by {wedding.rsvpBy}</p>
              </div>

              <div className="mt-9">
                <label htmlFor="rsvp-name" className="mb-2 block font-sans text-[10px] font-normal uppercase tracking-[0.34em] text-ivory/45">
                  Your name
                </label>
                <input
                  id="rsvp-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  className="w-full border border-gold/25 bg-black/20 px-4 py-3.5 font-display text-[19px] text-ivory outline-none focus:border-gold/70"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button type="button" className={pill(attending === true)} onClick={() => setAttending(true)}>
                  Joyfully accepts
                </button>
                <button type="button" className={pill(attending === false)} onClick={() => setAttending(false)}>
                  Regretfully declines
                </button>
              </div>

              <div className="mt-6">
                <label htmlFor="rsvp-note" className="mb-2 block font-sans text-[10px] font-normal uppercase tracking-[0.34em] text-ivory/45">
                  A note (optional)
                </label>
                <textarea
                  id="rsvp-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  maxLength={400}
                  className="w-full resize-none border border-gold/25 bg-black/20 px-4 py-3 font-display text-[19px] text-ivory outline-none focus:border-gold/70"
                />
              </div>

              <div className="mt-9">
                <p className="mb-3 text-center font-sans text-[10px] font-normal uppercase tracking-[0.34em] text-ivory/45">
                  Your signature, in gold
                </p>
                <SignaturePad ref={sig} />
              </div>

              <div className="mt-10">
                <WaxSeal onSeal={seal} sealed={false} busy={busy} />
              </div>

              <div key={shake} className={`mt-6 min-h-[1.5rem] text-center ${shake ? 'shake' : ''}`} aria-live="polite">
                {error && <p className="font-display text-[16px] italic text-[#f0c9a0]">{error}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
