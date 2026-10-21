'use client';

/**
 * A soft, generated ambient pad (no audio file needed), or your own track if `url` is given.
 * Browsers block autoplay, so start() must be called from a tap.
 */
export function createMusic(url: string | null) {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let audio: HTMLAudioElement | null = null;
  let fadeTimer: ReturnType<typeof setInterval> | null = null;

  const impulse = (c: AudioContext, seconds: number, decay: number) => {
    const len = Math.floor(c.sampleRate * seconds);
    const buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  };

  const initPad = () => {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1300;
    filter.Q.value = 0.3;

    const dry = ctx.createGain();
    dry.gain.value = 0.45;
    const wet = ctx.createGain();
    wet.gain.value = 0.6;
    const conv = ctx.createConvolver();
    conv.buffer = impulse(ctx, 3.8, 2.4);

    filter.connect(dry).connect(master);
    filter.connect(conv).connect(wet).connect(master);

    // D major 9 — D3 A3 D4 F#4 E5 (quiet, slow-breathing voices)
    const freqs = [146.83, 220.0, 293.66, 369.99, 659.25];
    freqs.forEach((f, i) => {
      const voice = ctx!.createGain();
      voice.gain.value = 0.03;
      voice.connect(filter);

      [-4, 4].forEach((cents) => {
        const o = ctx!.createOscillator();
        o.type = i % 2 ? 'triangle' : 'sine';
        o.frequency.value = f;
        o.detune.value = cents;
        o.connect(voice);
        o.start();
      });

      const lfo = ctx!.createOscillator();
      lfo.frequency.value = 0.035 + i * 0.011;
      const depth = ctx!.createGain();
      depth.gain.value = 0.022;
      lfo.connect(depth).connect(voice.gain);
      lfo.start();
    });
  };

  const fadeAudio = (to: number, ms: number, done?: () => void) => {
    if (!audio) return;
    if (fadeTimer) clearInterval(fadeTimer);
    const from = audio.volume;
    const steps = 30;
    let n = 0;
    fadeTimer = setInterval(() => {
      n++;
      audio!.volume = Math.max(0, Math.min(1, from + ((to - from) * n) / steps));
      if (n >= steps) {
        clearInterval(fadeTimer!);
        done?.();
      }
    }, ms / steps);
  };

  return {
    async start() {
      if (url) {
        if (!audio) {
          audio = new Audio(url);
          audio.loop = true;
          audio.volume = 0;
        }
        await audio.play();
        fadeAudio(0.7, 2500);
        return;
      }
      if (!ctx) initPad();
      await ctx!.resume();
      const t = ctx!.currentTime;
      master!.gain.cancelScheduledValues(t);
      master!.gain.setValueAtTime(master!.gain.value, t);
      master!.gain.linearRampToValueAtTime(0.9, t + 3);
    },
    stop() {
      if (url) {
        fadeAudio(0, 1200, () => audio?.pause());
        return;
      }
      if (!ctx || !master) return;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + 1.4);
      setTimeout(() => ctx?.suspend(), 1600);
    },
  };
}
