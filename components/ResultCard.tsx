'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

type Props = {
  universityName: string;
  characterName: string;
  characterImageUrl?: string | null;
  onShare?: () => void;
};

export default function ResultCard({ universityName, characterName, characterImageUrl, onShare }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

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
    card.style.setProperty('--hue', `${x * 360}deg`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    setIsHovered(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xs mx-auto">
      {/* 학교명 */}
      <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{universityName}</p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>의 캐릭터가 결정되었습니다</p>

      {/* 카드 */}
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
          {characterImageUrl ? (
            <Image
              src={characterImageUrl}
              alt={characterName}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          ) : (
            <div className="w-full h-full bg-orange-50 flex items-center justify-center text-6xl">
              🎭
            </div>
          )}

          {/* 홀로그래픽 shimmer — hover 시에만 */}
          {isHovered && (
            <>
              <div className="absolute inset-0 pointer-events-none" style={{
                background: `conic-gradient(
                  from calc(var(--hue, 0deg) - 90deg) at var(--mx, 50%) var(--my, 50%),
                  hsla(0,80%,65%,0.13), hsla(60,80%,65%,0.13),
                  hsla(120,80%,65%,0.13), hsla(180,80%,65%,0.13),
                  hsla(240,80%,65%,0.13), hsla(300,80%,65%,0.13),
                  hsla(360,80%,65%,0.13))`,
                mixBlendMode: 'screen',
              }} />
              <div className="absolute inset-0 pointer-events-none" style={{
                background: `radial-gradient(ellipse 60% 50% at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.28) 0%, transparent 70%)`,
              }} />
            </>
          )}
        </div>
      </div>

      {/* 캐릭터명 */}
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
