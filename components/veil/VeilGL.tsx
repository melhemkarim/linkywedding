'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';
import { buildVeilCanvas } from './veilTexture';
import type { Tilt } from '@/lib/useTilt';

export type Ripple = { x: number; y: number; t0: number; s: number };

const VERT = /* glsl */ `
uniform float uLift;
uniform float uTime;
uniform vec2 uTilt;
varying vec2 vUv;
varying float vShade;

void main() {
  vUv = uv;
  vec2 p = position.xy;
  float L = uLift;
  float e = L * L * (3.0 - 2.0 * L);

  // the cloth gathers toward its top edge as it is lifted
  float gather = 0.90 * smoothstep(0.0, 0.85, e);
  float y = 1.0 - (1.0 - p.y) * (1.0 - gather);
  float x = p.x * (1.0 - 0.22 * e * (0.4 + 0.6 * (1.0 - uv.y)));

  // pleats deepen as it folds
  float freq = 6.0 + 26.0 * e;
  float phase = p.x * freq + sin(p.y * 2.1 + uTime * 0.12) * 1.3 + uTilt.x * 1.5;
  float amp = 0.006 + 0.07 * e;
  y += sin(phase) * amp * (1.0 - uv.y) * e;

  // then it slides up and away
  y += 1.25 * smoothstep(0.55, 1.0, L);

  vShade = cos(phase) * (0.20 + 1.1 * e);
  gl_Position = vec4(x, y, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform float uTime;
uniform float uLift;
uniform float uAspect;
uniform float uCell;
uniform vec2 uTilt;
uniform vec2 uRes;
uniform vec4 uRipples[5];
varying vec2 vUv;
varying float vShade;

float hexDist(vec2 p) {
  p = abs(p);
  float c = dot(p, normalize(vec2(1.0, 1.73)));
  return max(c, p.x);
}

// 0 on the thread, positive inside the hole of a hexagonal tulle net
float hexEdge(vec2 uv) {
  vec2 r = vec2(1.0, 1.73);
  vec2 h = r * 0.5;
  vec2 a = mod(uv, r) - h;
  vec2 b = mod(uv - h, r) - h;
  vec2 gv = dot(a, a) < dot(b, b) ? a : b;
  return 0.5 - hexDist(gv);
}

void main() {
  vec2 uv = vUv;

  // ripples where the guest touches the cloth
  vec2 disp = vec2(0.0);
  float rip = 0.0;
  for (int i = 0; i < 5; i++) {
    vec4 r = uRipples[i];
    if (r.w > 0.0) {
      vec2 d = (uv - r.xy) * vec2(uAspect, 1.0);
      float dist = length(d);
      float wave = sin(dist * 34.0 - r.z * 8.5) * exp(-dist * 4.5) * exp(-r.z * 1.5) * r.w;
      vec2 dir = normalize(d + vec2(1e-4));
      disp += vec2(dir.x / uAspect, dir.y) * wave * 0.010;
      rip += wave;
    }
  }

  // slow drift like air moving through the room, steered by tilt
  vec2 drift = vec2(
    sin(uv.y * 3.2 + uTime * 0.33 + uTilt.x * 2.5),
    cos(uv.x * 2.6 + uTime * 0.27 + uTilt.y * 2.5)
  ) * 0.0035;

  vec2 q = uv + disp + drift;

  // tulle net
  float e = hexEdge(q * uRes / uCell);
  float thread = 1.0 - smoothstep(0.015, 0.085, e);
  float fa = mix(0.20, 0.74, thread) + 0.07;

  // light and shade across the folds
  float shade = rip * 0.55 + vShade * 0.14 + sin(q.x * 8.0 + q.y * 3.5 + uTime * 0.18 + uTilt.x * 2.0) * 0.025;
  vec3 fc = vec3(0.985, 0.972, 0.945) * (1.0 + shade * 0.30);
  fc = mix(fc, vec3(0.80, 0.78, 0.74), clamp(-shade, 0.0, 1.0) * 0.5);
  float spec = pow(max(0.0, sin(q.x * 3.1 + q.y * 1.9 + uTilt.x * 2.6 + uTilt.y * 1.2 + uTime * 0.12)), 7.0);
  fc += spec * 0.10 + thread * 0.02;

  // lace + embroidery
  vec4 t = texture2D(uTex, q);
  float gold = smoothstep(0.07, 0.2, t.r - t.b);
  vec3 ec = t.rgb + gold * vec3(1.0, 0.88, 0.55) * spec * 1.8;

  float oa = t.a + fa * (1.0 - t.a);
  vec3 oc = (ec * t.a + fc * fa * (1.0 - t.a)) / max(oa, 1e-4);
  oa *= 1.0 - smoothstep(0.86, 1.0, uLift);
  gl_FragColor = vec4(oc, oa);
}
`;

let emptyTex: THREE.DataTexture | null = null;
const getEmpty = () => {
  if (!emptyTex) {
    emptyTex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
    emptyTex.needsUpdate = true;
  }
  return emptyTex;
};

type Props = {
  lift: MotionValue<number>;
  name: string;
  ripples: React.MutableRefObject<Ripple[]>;
  tilt: React.MutableRefObject<Tilt>;
};

function VeilMesh({ lift, name, ripples, tilt }: Props) {
  const size = useThree((s) => s.size);
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);

  // quantise so mobile address-bar resizes don't rebuild the lace constantly
  const qw = Math.round(size.width / 48);
  const qh = Math.round(size.height / 64);

  useEffect(() => {
    let dead = false;
    let t: THREE.CanvasTexture | null = null;
    (async () => {
      try {
        await document.fonts.load('italic 500 40px "Cormorant Garamond"', name);
      } catch {
        /* font fallback is fine */
      }
      if (dead) return;
      const d = Math.min(window.devicePixelRatio || 1, 1.5);
      const cv = buildVeilCanvas(Math.round(size.width * d), Math.round(size.height * d), name);
      t = new THREE.CanvasTexture(cv);
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      t.needsUpdate = true;
      setTex(t);
    })();
    return () => {
      dead = true;
      t?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qw, qh, name]);

  const uniforms = useMemo(
    () => ({
      uTex: { value: getEmpty() as THREE.Texture },
      uTime: { value: 0 },
      uLift: { value: 0 },
      uAspect: { value: 1 },
      uCell: { value: 8 },
      uTilt: { value: new THREE.Vector2() },
      uRes: { value: new THREE.Vector2(1, 1) },
      uRipples: { value: Array.from({ length: 5 }, () => new THREE.Vector4()) },
    }),
    []
  );

  useFrame((state) => {
    const u = uniforms;
    const dpr = state.viewport.dpr;
    u.uTex.value = tex ?? getEmpty();
    u.uTime.value = state.clock.elapsedTime;
    u.uLift.value = lift.get();
    u.uAspect.value = state.size.width / state.size.height;
    u.uRes.value.set(state.size.width * dpr, state.size.height * dpr);
    u.uCell.value = 7.5 * dpr;
    u.uTilt.value.x += (tilt.current.x - u.uTilt.value.x) * 0.06;
    u.uTilt.value.y += (tilt.current.y - u.uTilt.value.y) * 0.06;

    const now = performance.now() / 1000;
    for (let i = 0; i < 5; i++) {
      const r = ripples.current[i];
      const age = r ? now - r.t0 : 99;
      if (r && age < 4.5) u.uRipples.value[i].set(r.x, r.y, age, r.s);
      else u.uRipples.value[i].set(0, 0, 0, 0);
    }
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2, 56, 84]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function VeilGL(props: Props) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <VeilMesh {...props} />
    </Canvas>
  );
}
