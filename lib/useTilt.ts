'use client';

import { useEffect, useRef } from 'react';

export type Tilt = { x: number; y: number };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** iOS only delivers motion events after a permission prompt triggered by a user gesture. */
export async function requestMotionPermission() {
  const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } })
    .DeviceOrientationEvent;
  if (D && typeof D.requestPermission === 'function') {
    try {
      await D.requestPermission();
    } catch {
      /* ignored — falls back to pointer movement */
    }
  }
}

/**
 * Normalised tilt in -1..1. Phone tilt where available, otherwise the pointer position.
 */
export function useTilt() {
  const tilt = useRef<Tilt>({ x: 0, y: 0 });

  useEffect(() => {
    let gotOrientation = false;

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      gotOrientation = true;
      tilt.current.x = clamp(e.gamma / 28, -1, 1);
      tilt.current.y = clamp((e.beta - 50) / 28, -1, 1);
    };
    const onMove = (e: PointerEvent) => {
      if (gotOrientation || e.pointerType === 'touch') return;
      tilt.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      tilt.current.y = (e.clientY / window.innerHeight - 0.5) * -2;
    };

    window.addEventListener('deviceorientation', onOrient);
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('deviceorientation', onOrient);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return tilt;
}
