'use client';

import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Center, Environment, Lightformer, Sparkles, Text3D } from '@react-three/drei';
import * as THREE from 'three';
import type { Tilt } from '@/lib/useTilt';

const FONT_URL = '/fonts/cormorant-italic.typeface.json';

function GoldMaterial() {
  return (
    <meshPhysicalMaterial
      color="#d9bb78"
      metalness={1}
      roughness={0.2}
      clearcoat={0.35}
      clearcoatRoughness={0.25}
      envMapIntensity={1.35}
    />
  );
}

const glyphProps = {
  height: 0.2,
  curveSegments: 16,
  bevelEnabled: true,
  bevelThickness: 0.025,
  bevelSize: 0.018,
  bevelSegments: 6,
} as const;

function Letters({ initials, tilt }: { initials: readonly [string, string]; tilt: React.MutableRefObject<Tilt> }) {
  const group = useRef<THREE.Group>(null);
  const width = useThree((s) => s.viewport.width);
  // keep the monogram inside narrow phone screens
  const fit = Math.min(1, width / 5.6);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const ry = Math.sin(t * 0.32) * 0.32 + tilt.current.x * 0.45;
    const rx = tilt.current.y * 0.18 + Math.sin(t * 0.21) * 0.04;
    g.rotation.y += (ry - g.rotation.y) * 0.05;
    g.rotation.x += (rx - g.rotation.x) * 0.05;
  });

  return (
    <group ref={group} scale={fit} position={[0, -0.15, 0]}>
      <Center disableY position={[-1.7, -0.7, 0]}>
        <Text3D font={FONT_URL} size={2.5} {...glyphProps}>
          {initials[0]}
          <GoldMaterial />
        </Text3D>
      </Center>
      <Center disableY position={[0, -0.45, -0.05]}>
        <Text3D font={FONT_URL} size={1.05} {...glyphProps} height={0.12}>
          &
          <GoldMaterial />
        </Text3D>
      </Center>
      <Center disableY position={[1.75, -0.7, 0]}>
        <Text3D font={FONT_URL} size={2.5} {...glyphProps}>
          {initials[1]}
          <GoldMaterial />
        </Text3D>
      </Center>
    </group>
  );
}

export default function Monogram3D({ initials, tilt }: { initials: readonly [string, string]; tilt: React.MutableRefObject<Tilt> }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7.5], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
      style={{ pointerEvents: 'none' }}
    >
      {/* procedural studio lighting — no external HDR download */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#050403']} />
        <Lightformer form="rect" intensity={3} position={[0, 4, -3]} scale={[10, 2, 1]} color="#fff3d6" />
        <Lightformer form="rect" intensity={2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#ffe9c0" />
        <Lightformer form="rect" intensity={2.2} position={[5, 1, 3]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#ffffff" />
        <Lightformer form="ring" intensity={1.5} position={[0, -3, 2]} scale={4} color="#f6d9a0" />
      </Environment>
      <Letters initials={initials} tilt={tilt} />
      <Sparkles count={46} scale={[7, 3.6, 2.4]} size={2.4} speed={0.16} opacity={0.75} color="#f3dca0" noise={0.4} />
    </Canvas>
  );
}
