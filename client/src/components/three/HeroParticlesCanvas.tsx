import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HeroParticlesProps {
  mouseRef: React.MutableRefObject<{ normX: number; normY: number }>;
  isMobile: boolean;
}

const EmbersField: React.FC<HeroParticlesProps> = ({ mouseRef, isMobile }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const coneRef = useRef<THREE.Mesh>(null);
  const count = isMobile ? 80 : 300;

  const { positions, speeds, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      spd[i] = 0.25 + Math.random() * 0.55;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, speeds: spd, phases: ph };
  }, [count]);

  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(215, 255, 80, 1)');
      grad.addColorStop(0.4, 'rgba(182, 245, 0, 0.7)');
      grad.addColorStop(1, 'rgba(182, 245, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const mx = mouseRef.current.normX;
    const my = mouseRef.current.normY;

    if (pointsRef.current) {
      const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        arr[idx + 1] += speeds[i] * dt;
        arr[idx] += (Math.sin(t + phases[i]) * 0.12 + mx * 0.28) * dt;
        if (arr[idx + 1] > 4.6) {
          arr[idx + 1] = -4.6;
          arr[idx] = (Math.random() - 0.5) * 14;
        }
      }
      attr.needsUpdate = true;
      pointsRef.current.rotation.y = THREE.MathUtils.lerp(
        pointsRef.current.rotation.y,
        mx * 0.08,
        0.04
      );
      pointsRef.current.rotation.x = THREE.MathUtils.lerp(
        pointsRef.current.rotation.x,
        -my * 0.05,
        0.04
      );
    }

    if (coneRef.current) {
      coneRef.current.position.x = THREE.MathUtils.lerp(
        coneRef.current.position.x,
        2.2 + mx * 0.45,
        0.04
      );
      coneRef.current.rotation.z = THREE.MathUtils.lerp(
        coneRef.current.rotation.z,
        0.22 + mx * 0.06,
        0.04
      );
    }
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.095}
          map={particleTexture}
          transparent
          opacity={0.75}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Soft volumetric lime energy cone */}
      <mesh ref={coneRef} position={[2.2, 0.2, -1.5]} rotation={[0, 0, 0.22]}>
        <coneGeometry args={[3.4, 9.5, 32, 1, true]} />
        <meshBasicMaterial
          color="#B6F500"
          transparent
          opacity={0.045}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
};

const HeroParticlesCanvas: React.FC<HeroParticlesProps> = ({ mouseRef, isMobile }) => {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <EmbersField mouseRef={mouseRef} isMobile={isMobile} />
    </Canvas>
  );
};

export default HeroParticlesCanvas;
