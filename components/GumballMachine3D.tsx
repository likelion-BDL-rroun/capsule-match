'use client';

import { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, RoundedBox, MeshTransmissionMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

type Phase = 'idle' | 'turning' | 'dropping' | 'sparkling' | 'done';

// ── 뽑기 기계 안 공 데이터 ──
const BALLS = [
  { pos: [-0.75, -0.55, 0.3],  color: '#7EC8E3', rough: 0.2 },
  { pos: [0.05,  -0.85, 0.6],  color: '#FFB347', rough: 0.25 },
  { pos: [0.8,   -0.55, 0.25], color: '#FFD966', rough: 0.2 },
  { pos: [-0.3,  -0.75, -0.5], color: '#D8F0FF', rough: 0.1 },
  { pos: [0.5,   -0.7,  -0.5], color: '#FFB347', rough: 0.25 },
  { pos: [-1.0,  -0.1,  0.1],  color: '#FFD966', rough: 0.2 },
  { pos: [-0.1,  -0.2,  0.8],  color: '#7EC8E3', rough: 0.2 },
  { pos: [0.7,   -0.1,  0.6],  color: '#D8F0FF', rough: 0.1 },
  { pos: [1.0,   -0.3, -0.2],  color: '#FFB347', rough: 0.25 },
  { pos: [-0.55,  0.4,  0.35], color: '#7EC8E3', rough: 0.2 },
  { pos: [0.25,   0.5,  0.3],  color: '#FFD966', rough: 0.2 },
  { pos: [0.75,   0.3, -0.3],  color: '#FFB347', rough: 0.25 },
];

// ── 공 하나 ──
function GachaBall({ position, color, roughness, visible = true }: {
  position: [number, number, number]; color: string; roughness: number; visible?: boolean;
}) {
  return (
    <group position={position} visible={visible}>
      {/* 공 몸체 */}
      <mesh castShadow>
        <sphereGeometry args={[0.28, 32, 32]}/>
        <meshStandardMaterial color={color} roughness={roughness} metalness={0.05}
          envMapIntensity={1.2}/>
      </mesh>
      {/* 캡슐 분리선 */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.28, 0.012, 8, 32]}/>
        <meshStandardMaterial color="rgba(255,255,255,0.6)" roughness={0.3} transparent opacity={0.5}/>
      </mesh>
      {/* 하이라이트 */}
      <mesh position={[-0.08, 0.12, 0.22]}>
        <sphereGeometry args={[0.07, 16, 16]}/>
        <meshBasicMaterial color="white" transparent opacity={0.55}/>
      </mesh>
    </group>
  );
}

// ── 유리 글로브 ──
function GlassGlobe({ droppingBall }: { droppingBall: boolean }) {
  return (
    <group position={[0, 1.55, 0]}>
      {/* 볼들 (글로브 안) */}
      {BALLS.map((b, i) => (
        <GachaBall
          key={i}
          position={b.pos as [number,number,number]}
          color={b.color}
          roughness={b.rough}
          visible={!(droppingBall && i === 6)}
        />
      ))}
      {/* 유리 구 */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.82, 64, 64]}/>
        <MeshTransmissionMaterial
          transmission={0.96}
          roughness={0.04}
          thickness={0.4}
          ior={1.55}
          chromaticAberration={0.04}
          color="#cce8ff"
          backside
          backsideThickness={0.3}
          envMapIntensity={1.5}
        />
      </mesh>
      {/* 글로브 rim (골드) */}
      <mesh position={[0, -1.82, 0]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[1.82, 0.09, 16, 80]}/>
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.12} envMapIntensity={2}/>
      </mesh>
    </group>
  );
}

// ── 기계 바디 ──
function MachineBody() {
  // 라떼(선반) 지오메트리로 곡선 바디 생성
  const bodyGeo = new THREE.LatheGeometry([
    new THREE.Vector2(0.5, -1.55),
    new THREE.Vector2(1.55, -1.25),
    new THREE.Vector2(1.7,  -0.85),
    new THREE.Vector2(1.62, -0.45),
    new THREE.Vector2(1.45, -0.1),
    new THREE.Vector2(1.3,   0.0),
  ], 64);

  return (
    <group position={[0, -0.15, 0]}>
      {/* 바디 */}
      <mesh geometry={bodyGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#7EC8E3" roughness={0.35} metalness={0.08}
          envMapIntensity={0.8}/>
      </mesh>
      {/* 바디 하이라이트 (왼쪽 밝은 면) */}
      <mesh geometry={bodyGeo} scale={[0.98, 0.98, 0.98]} position={[-0.1, 0, 0]}>
        <meshStandardMaterial color="#A8DFF0" roughness={0.5} metalness={0} transparent opacity={0.3}/>
      </mesh>

      {/* 골드 하단 링 */}
      <mesh position={[0, -1.55, 0]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[1.5, 0.09, 16, 80]}/>
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.12} envMapIntensity={2}/>
      </mesh>

      {/* 골드 링 (글로브 아래) */}
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[1.3, 0.11, 16, 80]}/>
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.12} envMapIntensity={2}/>
      </mesh>

      {/* 레버 패널 (앞면 크림색 판) */}
      <RoundedBox args={[1.1, 1.55, 0.12]} radius={0.12} smoothness={4} position={[0, -0.7, 1.62]}>
        <meshStandardMaterial color="#FDF5DC" roughness={0.6} metalness={0.05}/>
      </RoundedBox>
      {/* 패널 테두리 */}
      <RoundedBox args={[1.18, 1.62, 0.08]} radius={0.13} smoothness={4} position={[0, -0.7, 1.59]}>
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.15} envMapIntensity={2}/>
      </RoundedBox>

      {/* 레버 피벗 링 (골드) */}
      <mesh position={[0, -0.6, 1.72]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.35, 0.08, 16, 48]}/>
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.12} envMapIntensity={2}/>
      </mesh>
      {/* 레버 피벗 내부 크림 */}
      <mesh position={[0, -0.6, 1.72]}>
        <circleGeometry args={[0.27, 32]}/>
        <meshStandardMaterial color="#FDF5DC" roughness={0.6}/>
      </mesh>

      {/* 배출구 슬롯 */}
      <RoundedBox args={[0.7, 0.18, 0.1]} radius={0.04} smoothness={4} position={[0, -1.12, 1.72]}>
        <meshStandardMaterial color="#5A3800" roughness={0.7}/>
      </RoundedBox>
      {/* 배출구 트레이 */}
      <mesh position={[0, -1.62, 1.3]} rotation={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.7, 0.12, 32, 1, false, 0, Math.PI]}/>
        <meshStandardMaterial color="#FF9500" roughness={0.25} metalness={0.05} envMapIntensity={1}/>
      </mesh>

      {/* 발 3개 */}
      {[-1, 0, 1].map((x, i) => (
        <mesh key={i} position={[x * 0.85, -1.72, x === 0 ? 0.6 : 0]} castShadow>
          <sphereGeometry args={[0.22, 32, 32]}/>
          <meshStandardMaterial color="#FF9500" roughness={0.25} metalness={0.05} envMapIntensity={1}/>
        </mesh>
      ))}
    </group>
  );
}

// ── 상단 골드 볼 ──
function TopBall() {
  return (
    <mesh position={[0, 3.62, 0]} castShadow>
      <sphereGeometry args={[0.26, 32, 32]}/>
      <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.12} envMapIntensity={2.5}/>
    </mesh>
  );
}

// ── 레버 (회전 애니메이션) ──
function Lever({ targetAngle }: { targetAngle: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const currentAngle = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;
    currentAngle.current = THREE.MathUtils.lerp(currentAngle.current, targetAngle, 0.12);
    groupRef.current.rotation.x = (currentAngle.current * Math.PI) / 180;
  });

  return (
    <group ref={groupRef} position={[0, -0.75, 1.72]} rotation={[0, 0, 0]}>
      {/* 레버 바 */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.78, 16]}/>
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.15} envMapIntensity={2}/>
      </mesh>
      {/* 손잡이 볼 (오렌지) */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.22, 32, 32]}/>
        <meshStandardMaterial color="#FF9500" roughness={0.2} metalness={0.05} envMapIntensity={1.5}/>
      </mesh>
      {/* 손잡이 하이라이트 */}
      <mesh position={[-0.06, 0.93, 0.15]}>
        <sphereGeometry args={[0.07, 16, 16]}/>
        <meshBasicMaterial color="white" transparent opacity={0.55}/>
      </mesh>
    </group>
  );
}

// ── 낙하하는 공 ──
function DroppingBall({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startY = useRef(1.55);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current || !active) return;
    elapsed.current += delta;
    const t = Math.min(elapsed.current / 0.6, 1);
    meshRef.current.position.y = THREE.MathUtils.lerp(startY.current, -1.55, t * t);
    meshRef.current.scale.setScalar(1 - t * 0.3);
  });

  if (!active) return null;

  return (
    <mesh ref={meshRef} position={[0, 1.55, 0.8]} castShadow>
      <sphereGeometry args={[0.28, 32, 32]}/>
      <meshStandardMaterial color="#D8F0FF" roughness={0.1} metalness={0} transparent opacity={0.9}/>
    </mesh>
  );
}

// ── 스파클 파티클 ──
function Sparkles({ active }: { active: boolean }) {
  const count = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particleData = useRef(
    Array.from({ length: count }, () => ({
      pos: new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4),
      vel: new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 4 + 1, (Math.random() - 0.5) * 2),
      life: Math.random(),
      maxLife: 0.8 + Math.random() * 0.8,
      size: 0.04 + Math.random() * 0.08,
    }))
  );
  const dummy = new THREE.Object3D();
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current || !active) return;
    elapsed.current += delta;
    particleData.current.forEach((p, i) => {
      p.life += delta;
      if (p.life > p.maxLife) {
        p.life = 0;
        p.pos.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3);
      }
      const t = p.life / p.maxLife;
      dummy.position.set(
        p.pos.x + p.vel.x * t,
        p.pos.y + p.vel.y * t * 0.5,
        p.pos.z + p.vel.z * t
      );
      const scale = p.size * (1 - t);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} visible={active}>
      <sphereGeometry args={[1, 8, 8]}/>
      <meshBasicMaterial color="#FFD700"/>
    </instancedMesh>
  );
}

// ── 3D 씬 전체 ──
function Scene({ phase, leverAngle, onLeverClick }: {
  phase: Phase; leverAngle: number; onLeverClick: () => void;
}) {
  const targetAngle = phase === 'idle' ? leverAngle : phase === 'turning' || phase === 'dropping' || phase === 'sparkling' || phase === 'done' ? 180 : 0;

  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.6}/>
      <directionalLight position={[4, 8, 5]} intensity={1.8} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-near={0.1} shadow-camera-far={30}
        shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6}
        color="#fff8f0"/>
      <pointLight position={[-4, 4, 4]} intensity={0.8} color="#ffeedd"/>
      <pointLight position={[3, -1, 4]} intensity={0.4} color="#d0e8ff"/>
      <pointLight position={[0, 5, -3]} intensity={0.3} color="#ffffff"/>

      {/* HDR 환경 (반사용) */}
      <Environment preset="city"/>

      {/* 바닥 그림자 받는 면 */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 0]}>
        <planeGeometry args={[20, 20]}/>
        <shadowMaterial transparent opacity={0.2}/>
      </mesh>

      {/* 뽑기 기계 */}
      <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.08}>
        <group>
          <TopBall/>
          <GlassGlobe droppingBall={phase === 'dropping'}/>
          <MachineBody/>
          <Lever targetAngle={targetAngle}/>
          <DroppingBall active={phase === 'dropping'}/>
        </group>
      </Float>

      {/* 스파클 */}
      <Sparkles active={phase === 'sparkling'}/>

      {/* 클릭 이벤트용 투명 레버 히트박스 */}
      <mesh
        position={[0, -0.25, 2.3]}
        onClick={onLeverClick}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <boxGeometry args={[1.2, 1.6, 0.4]}/>
        <meshBasicMaterial transparent opacity={0} depthWrite={false}/>
      </mesh>
    </>
  );
}

// ── 메인 컴포넌트 ──
type Props = { universityName: string; onComplete: () => void; isLoading: boolean; };

export default function GumballMachine3D({ universityName, onComplete, isLoading }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [leverAngle, setLeverAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);
  const dragStartY = useRef(0);

  const triggerMachine = useCallback(() => {
    if (triggered.current || phase !== 'idle' || isLoading) return;
    triggered.current = true;
    setPhase('turning');
    setLeverAngle(180);
    setTimeout(() => setPhase('dropping'), 750);
    setTimeout(() => setPhase('sparkling'), 1400);
    setTimeout(() => { setPhase('done'); onComplete(); }, 3200);
  }, [phase, isLoading, onComplete]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (phase !== 'idle' || isLoading) return;
    setIsDragging(true);
    dragStartY.current = e.clientY;
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dy = dragStartY.current - e.clientY;
      const angle = Math.max(0, Math.min(180, dy * 1.5));
      setLeverAngle(angle);
      if (angle >= 140) { setIsDragging(false); triggerMachine(); }
    };
    const onUp = () => { setIsDragging(false); if (leverAngle < 140) setLeverAngle(0); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [isDragging, leverAngle, triggerMachine]);

  return (
    <div className="relative flex flex-col items-center w-full">
      <p className="text-sm text-gray-500 mb-3 text-center">
        <strong>{universityName}</strong>의 캐릭터를 뽑아보세요!
      </p>

      {/* 3D 캔버스 */}
      <div
        ref={canvasRef}
        className="w-72 h-96 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ background: 'radial-gradient(ellipse at 40% 30%, #FFF0D8, #FFE5C0 50%, #FAD8A0)' }}
        onPointerDown={handlePointerDown}
      >
        <Canvas
          shadows
          camera={{ position: [0, 0.8, 9], fov: 38 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Scene phase={phase} leverAngle={leverAngle} onLeverClick={triggerMachine}/>
          </Suspense>
        </Canvas>
      </div>

      {/* 버튼 */}
      <button
        onClick={triggerMachine}
        disabled={phase !== 'idle' || isLoading}
        className={`mt-5 px-9 py-4 rounded-2xl font-bold text-white text-base transition-all shadow-lg
          ${phase !== 'idle' || isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#FF6000] hover:bg-orange-500 active:scale-95'}`}
      >
        {isLoading ? '배정 중...' : phase !== 'idle' ? '뽑는 중...' : '🎰 레버 돌리기'}
      </button>
      <p className="mt-2 text-xs text-gray-400">3D 화면을 위아래로 드래그하거나 버튼을 눌러보세요</p>
    </div>
  );
}
