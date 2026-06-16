'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

const N = 13;
const STEP = 360 / N;   // ~27.7° per card
const RADIUS = 490;     // 카드 하단이 닿는 원의 반지름
const CENTER_Y = 860;   // 원의 중심 y (컨테이너 상단 기준 px)
const CARD_W = 180;
const CARD_H = 256;
const DRAG_PX_PER_STEP = 60;  // 카드 한 칸 이동에 필요한 드래그 px

interface Props {
  onComplete: () => void;
  isLoading: boolean;
}

export default function CardCarousel({ onComplete, isLoading }: Props) {
  const [rotation, setRotation] = useState(0);   // 실수, 무제한
  const [isDragging, setIsDragging] = useState(false);
  const [picked, setPicked] = useState(false);
  const [pickedCard, setPickedCard] = useState<number | null>(null);

  const dragStartX = useRef<number | null>(null);
  const dragStartRot = useRef(0);
  const didDrag = useRef(false);

  // 현재 앞에 있는 카드 (각도 0에 가장 가까운 카드)
  const frontCard = ((Math.round(-rotation / STEP) % N) + N) % N;

  const onPointerDown = useCallback((clientX: number) => {
    if (picked) return;
    dragStartX.current = clientX;
    dragStartRot.current = rotation;
    didDrag.current = false;
    setIsDragging(true);
  }, [picked, rotation]);

  const onPointerMove = useCallback((clientX: number) => {
    if (dragStartX.current === null || picked) return;
    const delta = clientX - dragStartX.current;
    if (Math.abs(delta) > 5) didDrag.current = true;
    setRotation(dragStartRot.current + (delta / DRAG_PX_PER_STEP) * STEP);
  }, [picked]);

  const onPointerUp = useCallback(() => {
    if (dragStartX.current === null) return;
    dragStartX.current = null;
    setIsDragging(false);
    // 가장 가까운 카드로 스냅
    setRotation(r => Math.round(r / STEP) * STEP);
  }, []);

  const handleCardClick = (i: number) => {
    if (didDrag.current || picked || isLoading) return;
    if (i === frontCard) return;  // 앞 카드 클릭해도 선택 안 됨 — 버튼으로만 선택 가능
    // 비중심 카드 클릭 시 해당 카드를 앞으로 당기기
    const visualAngle = ((i * STEP + rotation) % 360 + 360) % 360;
    const short = visualAngle > 180 ? visualAngle - 360 : visualAngle;
    setRotation(r => r - short);
  };

  const getStyle = (i: number): React.CSSProperties => {
    const visualAngleDeg = i * STEP + rotation;

    // -180..180 정규화
    const norm = ((visualAngleDeg % 360) + 360) % 360;
    const a = norm > 180 ? norm - 360 : norm;
    const aRad = (a * Math.PI) / 180;
    const cosA = Math.cos(aRad);

    // 카드 하단 중심을 원 위에 배치하고, 카드 중심은 반지름 방향으로 CARD_H/2 만큼 밀어냄
    const R_center = RADIUS + CARD_H / 2;
    const cx = Math.sin(aRad) * R_center;
    const cy = CENTER_Y - Math.cos(aRad) * R_center;

    const zIndex = Math.round(50 + 50 * cosA);

    const isPickedCard = picked && pickedCard === i;
    const isFront = i === frontCard && !picked;

    const scale = isPickedCard ? 1.05 : isFront ? 1.08 : 0.82;
    // 바닥 고정 스케일: 카드가 커질 때 하단이 움직이지 않도록 위로만 늘어남
    const bottomAnchorOffset = isFront ? CARD_H * (scale - 1) : 0;
    const ty = isPickedCard ? cy - CARD_H / 2 - 160 : cy - CARD_H / 2 - bottomAnchorOffset;

    return {
      position: 'absolute',
      left: '50%',
      top: 0,
      width: CARD_W,
      height: CARD_H,
      borderRadius: 16,
      transform: `translate(calc(-50% + ${cx}px), ${ty}px) rotate(${isPickedCard ? 0 : a}deg) scale(${scale})`,
      zIndex: isPickedCard ? 200 : zIndex,
      boxShadow: isFront
        ? '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1.5px rgba(255,255,255,0.14), 0 0 40px rgba(255,96,0,0.2)'
        : '0 8px 20px rgba(0,0,0,0.3)',
      transition: isDragging
        ? 'none'
        : 'transform 0.42s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease',
      cursor: 'pointer',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      willChange: 'transform',
    };
  };

  return (
    <div className="flex flex-col items-center w-full select-none">
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
        {picked ? '캐릭터를 배정하는 중...' : '카드를 돌려 원하는 카드를 선택하세요'}
      </p>

      <div
        className="relative w-full"
        style={{ height: 520, overflow: 'hidden', touchAction: 'pan-y' }}
        onMouseDown={e => onPointerDown(e.clientX)}
        onMouseMove={e => { if (dragStartX.current !== null) onPointerMove(e.clientX); }}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={e => onPointerDown(e.touches[0].clientX)}
        onTouchMove={e => { e.preventDefault(); onPointerMove(e.touches[0].clientX); }}
        onTouchEnd={onPointerUp}
      >
        {Array.from({ length: N }).map((_, i) => (
          <div key={i} style={getStyle(i)} onClick={() => handleCardClick(i)}>
            <CardFace isPicked={picked && pickedCard === i} />
          </div>
        ))}

        {/* 하단 페이드아웃 그라디언트 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 140, pointerEvents: 'none', zIndex: 150,
          background: 'linear-gradient(to bottom, transparent 0%, var(--bg) 100%)',
        }} />

        {/* 선택 버튼 — 카드 위에 얹힘 */}
        {!picked && (
          <div style={{
            position: 'absolute', bottom: 32, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', zIndex: 200,
          }}>
            <button
              onClick={() => {
                if (isLoading) return;
                setPicked(true);
                setPickedCard(frontCard);
                setTimeout(() => onComplete(), 900);
              }}
              disabled={isLoading}
              style={{
                background: '#FF6000', color: '#fff',
                fontWeight: 700, fontSize: 15,
                padding: '15px 48px', borderRadius: 18,
                border: 'none', cursor: isLoading ? 'wait' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                boxShadow: '0 0 28px rgba(255,96,0,0.4)',
                transition: 'opacity 0.2s',
              }}
            >
              이 카드 선택하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CardFace({ isPicked }: { isPicked: boolean }) {
  return (
    <div className="w-full h-full relative overflow-hidden rounded-2xl">
      <Image
        src="/card-back.png"
        alt="카드"
        fill
        style={{ objectFit: 'cover' }}
        draggable={false}
        priority
      />
      {isPicked && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,200,50,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 16,
        }}>
          <span style={{ fontSize: 36 }}>✨</span>
        </div>
      )}
    </div>
  );
}
