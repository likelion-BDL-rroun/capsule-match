'use client';

import Image from 'next/image';
import { useRef, useState, useEffect, useCallback } from 'react';

type Props = {
  universityName: string;
  characterName: string;
  characterImageUrl?: string | null;
  onShare?: () => void;
};

type Spark = {
  id: number;
  x: number; // card 기준 %
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
};

const SPARK_COLORS = [
  'rgba(255,255,255,0.95)',
  'rgba(200,220,255,0.9)',
  'rgba(255,200,240,0.9)',
  'rgba(180,255,220,0.85)',
  'rgba(255,230,150,0.9)',
];

let sparkId = 0;

export default function ResultCard({ universityName, characterName, characterImageUrl, onShare }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [sparks, setSparks] = useState<Spark[]>([]);
  const spawnTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cursorRef = useRef({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    card.style.setProperty('--rx', `${(y - 0.5) * -18}deg`);
    card.style.setProperty('--ry', `${(x - 0.5) * 18}deg`);
    card.style.setProperty('--mx', `${x * 100}%`);
    card.style.setProperty('--my', `${y * 100}%`);

    cursorRef.current = { x: x * 100, y: y * 100 };
    setCursorPos({ x: x * 100, y: y * 100 });
  };

  const spawnSparks = useCallback(() => {
    const { x, y } = cursorRef.current;
    const count = 2 + Math.floor(Math.random() * 2);
    const newSparks: Spark[] = Array.from({ length: count }, () => {
      const spread = 12;
      return {
        id: sparkId++,
        x: x + (Math.random() - 0.5) * spread,
        y: y + (Math.random() - 0.5) * spread,
        size: 3 + Math.random() * 5,
        duration: 500 + Math.random() * 600,
        delay: Math.random() * 100,
        color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
      };
    });
    setSparks(prev => [...prev.slice(-24), ...newSparks]);
    // 수명 지난 spark 제거
    setTimeout(() => {
      setSparks(prev => prev.filter(s => !newSparks.find(n => n.id === s.id)));
    }, 1200);
  }, []);

  useEffect(() => {
    if (isHovered) {
      spawnTimer.current = setInterval(spawnSparks, 80);
    } else {
      if (spawnTimer.current) clearInterval(spawnTimer.current);
      setSparks([]);
    }
    return () => { if (spawnTimer.current) clearInterval(spawnTimer.current); };
  }, [isHovered, spawnSparks]);

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    setIsHovered(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xs mx-auto">
      <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{universityName}</p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>의 캐릭터가 결정되었습니다</p>

      <div style={{ perspective: '900px' }} className="w-full">
        <div
          ref={cardRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
          style={{
            aspectRatio: '2 / 3',
            transform: 'rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))',
            transition: 'transform 0.08s ease-out',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
        >
          {/* 카드 이미지 */}
          {characterImageUrl ? (
            <Image src={characterImageUrl} alt={characterName} fill style={{ objectFit: 'cover' }} priority />
          ) : (
            <div className="w-full h-full bg-orange-50 flex items-center justify-center text-6xl">🎭</div>
          )}

          {/* holo-pattern — 커서 위치에서 마스크로 노출 */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'url(/holo-pattern.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isHovered ? 0.85 : 0,
            maskImage: isHovered
              ? `radial-gradient(circle 110px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)`
              : 'none',
            WebkitMaskImage: isHovered
              ? `radial-gradient(circle 110px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)`
              : 'none',
            mixBlendMode: 'overlay',
            transition: 'opacity 0.2s',
          }} />

          {/* 소프트 하이라이트 */}
          {isHovered && (
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `radial-gradient(ellipse 55% 45% at ${cursorPos.x}% ${cursorPos.y}%, rgba(255,255,255,0.12) 0%, transparent 70%)`,
            }} />
          )}

          {/* Stardust 파티클 */}
          {sparks.map(spark => (
            <div
              key={spark.id}
              className="absolute pointer-events-none"
              style={{
                left: `${spark.x}%`,
                top: `${spark.y}%`,
                width: spark.size,
                height: spark.size,
                borderRadius: '50%',
                background: spark.color,
                boxShadow: `0 0 ${spark.size * 2}px ${spark.color}`,
                transform: 'translate(-50%, -50%) scale(0)',
                animation: `stardust-pop ${spark.duration}ms ease-out ${spark.delay}ms forwards`,
                zIndex: 10,
              }}
            />
          ))}
        </div>
      </div>

      {/* stardust 키프레임 */}
      <style>{`
        @keyframes stardust-pop {
          0%   { transform: translate(-50%, -50%) scale(0);   opacity: 1; }
          40%  { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -60%) scale(0);   opacity: 0; }
        }
      `}</style>

      <p style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f0', marginTop: 24, marginBottom: 4 }}>{characterName}</p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>이 캐릭터는 이제 {universityName}에만 배정됩니다.</p>

      {onShare && (
        <button
          onClick={onShare}
          className="w-full mt-5 border-2 border-[#FF6000] text-[#FF6000] font-bold py-4 rounded-2xl text-base active:scale-95 transition-all"
        >
          결과 공유하기
        </button>
      )}
    </div>
  );
}
