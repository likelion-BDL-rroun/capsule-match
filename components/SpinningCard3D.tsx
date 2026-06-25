'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Environment, Lightformer } from '@react-three/drei';
import { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';

function Card() {
  const ref = useRef<THREE.Mesh>(null);
  const [front, back] = useTexture(['/char_00.png', '/card-back-0624.png']);

  const materials = useMemo(() => {
    [front, back].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    });
    const edge = new THREE.MeshStandardMaterial({ color: '#c7cad1', metalness: 1, roughness: 0.26 });
    const frontMat = new THREE.MeshStandardMaterial({ map: front, metalness: 0.15, roughness: 0.5 });
    const backMat = new THREE.MeshStandardMaterial({ map: back, metalness: 0.15, roughness: 0.5 });
    // BoxGeometry 면 순서: [+x, -x, +y, -y, +z(앞), -z(뒤)]
    return [edge, edge, edge, edge, frontMat, backMat];
  }, [front, back]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.7;
  });

  return (
    <mesh ref={ref} material={materials} rotation={[0.1, 0.4, 0]}>
      <boxGeometry args={[2, 3, 0.06]} />
    </mesh>
  );
}

export default function SpinningCard3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} />
      <directionalLight position={[-4, -1, 2]} intensity={0.5} color="#ffd9b0" />

      <Suspense fallback={null}>
        <Card />
        {/* 금속 반사를 위한 인메모리 환경광 (네트워크 불필요) */}
        <Environment resolution={128}>
          <Lightformer form="rect" intensity={3} position={[0, 2.5, 4]} scale={[8, 4, 1]} />
          <Lightformer form="rect" intensity={2} position={[-5, 0, 2]} scale={[3, 8, 1]} color="#ffd9b0" />
          <Lightformer form="rect" intensity={2} position={[5, 0, 2]} scale={[3, 8, 1]} color="#ffffff" />
          <Lightformer form="rect" intensity={1.2} position={[0, -3, 2]} scale={[8, 3, 1]} color="#ff8a3d" />
        </Environment>
      </Suspense>
    </Canvas>
  );
}
