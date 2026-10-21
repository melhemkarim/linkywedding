'use client';

import { useEffect, useState } from 'react';

export type Tier = 'full' | 'lite';

/**
 * Decides whether the device can handle the WebGL veil + 3D monogram.
 * Override while testing with ?tier=lite or ?tier=full
 */
export function useRenderTier(): Tier | null {
  const [tier, setTier] = useState<Tier | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('tier');
    if (q === 'full' || q === 'lite') {
      setTier(q);
      return;
    }

    let webgl = false;
    try {
      const c = document.createElement('canvas');
      const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
      webgl = !!gl;
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      webgl = false;
    }

    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    const cores = navigator.hardwareConcurrency || 4;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const low = !webgl || reduce || (mem !== undefined && mem <= 3) || cores <= 3;
    setTier(low ? 'lite' : 'full');
  }, []);

  return tier;
}
