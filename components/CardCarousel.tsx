'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';

const N = 17;
const STEP = 360 / N;   // ~21.2° per card
const RADIUS = 490;     // 원 반지름
const CENTER_Y = 880;   // 원의 중심 y (컨테이너 상단 기준 px)
const CARD_W = 180;
const CARD_H = 256;
const DRAG_PX_PER_STEP = 60;  // 카드 한 칸 이동에 필요한 드래그 px
const SCROLL_PX_PER_STEP = 200; // 카드 한 칸 이동에 필요한 스크롤 px

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const rotRef = useRef(0);       // 소스 오브 트루스
  const velRef = useRef(0);       // 현재 속도 (deg/frame)
  const rafRef = useRef<number | null>(null);
  const isAnimating = useRef(false);

  const startRAF = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;

      // 감쇠: 프레임레이트 독립적 마찰
      velRef.current *= Math.pow(0.88, dt / 16);
      rotRef.current += velRef.current * (dt / 16);
      setRotation(rotRef.current);

      if (Math.abs(velRef.current) > 0.05) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // 가장 가까운 카드로 스냅
        const snapped = Math.round(rotRef.current / STEP) * STEP;
        rotRef.current = snapped;
        setRotation(snapped);
        setIsScrolling(false);
        isAnimating.current = false;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // 스크롤로 회전 (스크롤 다운 = 반시계, 스크롤 업 = 시계)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (picked) return;
      e.preventDefault();
      setIsScrolling(true);
      // deltaY → 속도 누적 (감도 조절: 0.04)
      velRef.current -= e.deltaY * 0.04;
      // RAF가 안 돌고 있으면 시작
      if (!isAnimating.current) {
        rotRef.current = rotRef.current; // sync (rotRef already correct)
        startRAF();
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [picked, startRAF]);

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
    const next = dragStartRot.current + (delta / DRAG_PX_PER_STEP) * STEP;
    rotRef.current = next;
    setRotation(next);
  }, [picked]);

  const onPointerUp = useCallback(() => {
    if (dragStartX.current === null) return;
    dragStartX.current = null;
    setIsDragging(false);
    // 가장 가까운 카드로 스냅
    const snapped = Math.round(rotRef.current / STEP) * STEP;
    rotRef.current = snapped;
    setRotation(snapped);
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

    // 원 위에 카드 배치
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
      transition: (isDragging || isScrolling)
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
        {picked ? '캐릭터를 배정하는 중...' : '스크롤하거나 드래그해서 카드를 돌려보세요'}
      </p>

      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: 620, overflow: 'hidden', touchAction: 'pan-y' }}
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

        {/* 하단 블러 오버레이 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 140, pointerEvents: 'none', zIndex: 150,
          backdropFilter: 'blur(1px)',
          WebkitBackdropFilter: 'blur(1px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 60%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 60%)',
        }} />

        {/* 하단 페이드아웃 그라디언트 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 140, pointerEvents: 'none', zIndex: 151,
          background: 'linear-gradient(to top, hsl(0 0% 5%) 0%, hsl(0 0% 4.2% / 0.83907) 6.49%, hsl(0 0% 3.5% / 0.69957) 13.72%, hsl(0 0% 2.9% / 0.57926) 20.3%, hsl(0 0% 2.38% / 0.47611) 26.3%, hsl(0 0% 1.94% / 0.38821) 31.79%, hsl(0 0% 1.57% / 0.3138) 36.84%, hsl(0 0% 1.26% / 0.25126) 41.48%, hsl(0 0% 1% / 0.19912) 45.76%, hsl(0 0% 0.78% / 0.15601) 49.71%, hsl(0 0% 0.6% / 0.12072) 53.36%, hsl(0 0% 0.46% / 0.09212) 56.71%, hsl(0 0% 0.35% / 0.06922) 59.81%, hsl(0 0% 0.26% / 0.05112) 62.65%, hsl(0 0% 0.19% / 0.03702) 65.27%, hsl(0 0% 0.13% / 0.02622) 67.66%, hsl(0 0% 0.09% / 0.0181) 69.85%, hsl(0 0% 0.06% / 0.01213) 71.83%, hsl(0 0% 0.04% / 0.00785) 73.63%, hsl(0 0% 0.02% / 0.00488) 75.25%, hsl(0 0% 0.01% / 0.00288) 76.7%, hsl(0 0% 0.01% / 0.0016) 77.98%, hsl(0 0% 0% / 0.00082) 79.11%, hsl(0 0% 0% / 0.00038) 80.08%, hsl(0 0% 0% / 0.00015) 80.9%, hsl(0 0% 0% / 0.00005) 81.59%, hsl(0 0% 0% / 0.00001) 82.13%, hsl(0 0% 0% / 0) 82.55%, hsl(0 0% 0% / 0) 82.84%, hsl(0 0% 0% / 0) 83%)',
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
                padding: '15px 48px', borderRadius: 16,
                border: 'none', cursor: isLoading ? 'wait' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
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
          position: 'absolute', inset: 0, zIndex: 2,
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
