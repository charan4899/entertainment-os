"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 900;

function ParticleCloud() {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Distribute inside a wide, shallow disc so it reads as a depth field
      // behind the UI rather than a sphere floating in the middle. This is a
      // decorative, one-time layout computed once via useMemo — randomness
      // here is intentional and has no bearing on correctness.
      // eslint-disable-next-line react-hooks/purity
      const radius = 6 + Math.random() * 10;
      // eslint-disable-next-line react-hooks/purity
      const theta = Math.random() * Math.PI * 2;
      // eslint-disable-next-line react-hooks/purity
      const y = (Math.random() - 0.5) * 6;
      arr[i * 3] = Math.cos(theta) * radius;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(theta) * radius - 4;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.015;
    pointsRef.current.rotation.x = Math.sin(Date.now() * 0.00002) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#22d3ee"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Fixed, full-viewport, non-interactive canvas. Kept intentionally sparse
 * (900 points, capped DPR) so it reads as ambient depth rather than a
 * performance cost.
 */
export function ParticleField() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ParticleCloud />
      </Canvas>
      {/* Vignette so particles never compete with foreground content */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, transparent 0%, var(--color-bg) 78%)",
        }}
      />
    </div>
  );
}
