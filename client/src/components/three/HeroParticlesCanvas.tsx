import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';

interface HeroParticlesProps {
  pointerRef: React.MutableRefObject<{ normX: number; normY: number }>;
  particleCount: number;
  isMobile: boolean;
  active: boolean;
}

const VERTEX_SHADER = `
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aSize;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;

  void main() {
    vec3 pos = position;
    float travel = mod(pos.y + 4.6 + uTime * aSpeed, 9.2) - 4.6;
    pos.y = travel;
    pos.x += sin(uTime * 0.7 + aPhase) * 0.28 + uMouse.x * 0.35;
    pos.y += -uMouse.y * 0.12;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uPixelRatio * (18.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.05, d) * 0.78;
    vec3 color = mix(vec3(0.714, 0.961, 0.0), vec3(0.92, 1.0, 0.55), smoothstep(0.35, 0.0, d));
    gl_FragColor = vec4(color, alpha);
  }
`;

const EmbersField: React.FC<{
  pointerRef: React.MutableRefObject<{ normX: number; normY: number }>;
  particleCount: number;
  dpr: number;
}> = ({ pointerRef, particleCount, dpr }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { geometry, shaderMaterial, coneGeo, coneMat } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);
    const ph = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
      spd[i] = 0.25 + Math.random() * 0.55;
      ph[i] = Math.random() * Math.PI * 2;
      sizes[i] = 4.0 + Math.random() * 5.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(spd, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uPixelRatio: { value: dpr },
      },
    });

    const cGeo = new THREE.ConeGeometry(3.4, 9.5, 24, 1, true);
    const cMat = new THREE.MeshBasicMaterial({
      color: '#B6F500',
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, shaderMaterial: mat, coneGeo: cGeo, coneMat: cMat };
  }, [particleCount, dpr]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      shaderMaterial.dispose();
      coneGeo.dispose();
      coneMat.dispose();
    };
  }, [geometry, shaderMaterial, coneGeo, coneMat]);

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    const uMouse = materialRef.current.uniforms.uMouse.value as THREE.Vector2;
    uMouse.x += (pointerRef.current.normX - uMouse.x) * 0.08;
    uMouse.y += (pointerRef.current.normY - uMouse.y) * 0.08;
  });

  return (
    <>
      <points geometry={geometry}>
        <primitive object={shaderMaterial} ref={materialRef} attach="material" />
      </points>
      <mesh geometry={coneGeo} material={coneMat} position={[2.2, 0.2, -1.5]} rotation={[0, 0, 0.22]} />
    </>
  );
};

const HeroParticlesCanvas: React.FC<HeroParticlesProps> = ({
  pointerRef,
  particleCount,
  isMobile,
  active,
}) => {
  const [dpr, setDpr] = useState(isMobile ? 1 : 1.5);

  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(isMobile ? 1 : 1.5)}
      />
      <EmbersField pointerRef={pointerRef} particleCount={particleCount} dpr={dpr} />
    </Canvas>
  );
};

export default HeroParticlesCanvas;
