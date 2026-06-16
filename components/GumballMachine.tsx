'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

type Phase = 'idle' | 'turning' | 'dropping' | 'sparkling' | 'done';

type Props = {
  universityName: string;
  onComplete: () => void;
  isLoading: boolean;
};

const SPARKLE_POS = [
  { x: '8%',  y: '15%', delay: 0,   size: 28 },
  { x: '85%', y: '10%', delay: 80,  size: 22 },
  { x: '3%',  y: '55%', delay: 160, size: 32 },
  { x: '88%', y: '50%', delay: 40,  size: 24 },
  { x: '47%', y: '3%',  delay: 120, size: 28 },
  { x: '15%', y: '80%', delay: 200, size: 20 },
  { x: '75%', y: '78%', delay: 60,  size: 26 },
  { x: '42%', y: '88%', delay: 140, size: 22 },
];

export default function GumballMachine({ universityName, onComplete, isLoading }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [leverAngle, setLeverAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const leverCenterRef = useRef<{ x: number; y: number } | null>(null);
  const triggered = useRef(false);

  const triggerMachine = useCallback(() => {
    if (triggered.current) return;
    triggered.current = true;
    setPhase('turning');
    setTimeout(() => setPhase('dropping'), 750);
    setTimeout(() => setPhase('sparkling'), 1400);
    setTimeout(() => { setPhase('done'); onComplete(); }, 3000);
  }, [onComplete]);

  // SVG 좌표 → 각도 계산
  const getSvgAngle = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 280 / rect.width;
    const scaleY = 420 / rect.height;
    // 레버 피벗: SVG 좌표 (140, 296)
    const dx = (clientX - rect.left) * scaleX - 140;
    const dy = (clientY - rect.top) * scaleY - 296;
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return Math.min(angle, 180);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const angle = getSvgAngle(e.clientX, e.clientY);
    setLeverAngle(angle);
    if (angle >= 150) { setIsDragging(false); triggerMachine(); }
  }, [isDragging, getSvgAngle, triggerMachine]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    const t = e.touches[0];
    const angle = getSvgAngle(t.clientX, t.clientY);
    setLeverAngle(angle);
    if (angle >= 150) { setIsDragging(false); triggerMachine(); }
  }, [isDragging, getSvgAngle, triggerMachine]);

  const stopDrag = useCallback(() => {
    if (isDragging) { setIsDragging(false); setLeverAngle(0); }
  }, [isDragging]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', stopDrag);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', stopDrag);
    };
  }, [handleMouseMove, handleTouchMove, stopDrag]);

  const handleLeverDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== 'idle' || isLoading) return;
    e.preventDefault();
    setIsDragging(true);
    leverCenterRef.current = { x: 140, y: 296 };
  };

  const isAnimating = phase !== 'idle';
  const displayAngle = phase === 'turning' ? 180 : phase === 'idle' ? leverAngle : 180;

  return (
    <div className="relative flex flex-col items-center w-full">

      {/* ── 스파클 오버레이 ── */}
      {phase === 'sparkling' && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="absolute rounded-full border-2 border-yellow-300 animate-shimmer-ring"
                style={{ width: 120 + i * 40, height: 120 + i * 40, animationDelay: `${i * 120}ms`, opacity: 0 }} />
            ))}
          </div>
          {SPARKLE_POS.map((s, i) => (
            <div key={i} className="absolute animate-sparkle" style={{ left: s.x, top: s.y, animationDelay: `${s.delay}ms` }}>
              <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="#FFD700">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
              </svg>
            </div>
          ))}
          {['✨','🌟','💫','⭐','✨'].map((e, i) => (
            <div key={i} className="absolute text-2xl animate-float-up"
              style={{ left: `${15 + i * 18}%`, bottom: '25%', animationDelay: `${i * 90}ms` }}>{e}</div>
          ))}
        </div>
      )}

      {/* ── 안내 문구 ── */}
      <p className="text-sm text-gray-500 mb-4 text-center">
        <strong>{universityName}</strong>의 캐릭터를 뽑아보세요!
      </p>

      {/* ── 뽑기 기계 SVG ── */}
      <svg
        ref={svgRef}
        viewBox="0 0 280 430"
        className={`w-64 mx-auto drop-shadow-2xl ${phase === 'sparkling' ? 'animate-glow-pulse' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* 골드 */}
          <radialGradient id="gm-gold" cx="35%" cy="28%" r="65%">
            <stop offset="0%" stopColor="#FFF5B0"/>
            <stop offset="35%" stopColor="#D4AF37"/>
            <stop offset="75%" stopColor="#A07800"/>
            <stop offset="100%" stopColor="#C8960C"/>
          </radialGradient>
          <linearGradient id="gm-gold-ring" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE87C"/>
            <stop offset="30%" stopColor="#D4AF37"/>
            <stop offset="55%" stopColor="#B8860B"/>
            <stop offset="80%" stopColor="#D4AF37"/>
            <stop offset="100%" stopColor="#FFE87C"/>
          </linearGradient>
          {/* 블루 바디 */}
          <radialGradient id="gm-body" cx="28%" cy="22%" r="78%">
            <stop offset="0%" stopColor="#C8E8F5"/>
            <stop offset="40%" stopColor="#7EC8E3"/>
            <stop offset="100%" stopColor="#4AA8C8"/>
          </radialGradient>
          {/* 글로브 유리 */}
          <radialGradient id="gm-globe" cx="32%" cy="22%" r="72%">
            <stop offset="0%" stopColor="rgba(240,252,255,0.75)"/>
            <stop offset="25%" stopColor="rgba(210,240,255,0.4)"/>
            <stop offset="60%" stopColor="rgba(160,215,240,0.18)"/>
            <stop offset="100%" stopColor="rgba(100,180,220,0.28)"/>
          </radialGradient>
          {/* 오렌지 */}
          <radialGradient id="gm-orange" cx="35%" cy="28%" r="65%">
            <stop offset="0%" stopColor="#FFD580"/>
            <stop offset="45%" stopColor="#FF9500"/>
            <stop offset="100%" stopColor="#CC5500"/>
          </radialGradient>
          {/* 공들 */}
          <radialGradient id="gm-ball-blue" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#D0EEFF"/>
            <stop offset="50%" stopColor="#7EC8E3"/>
            <stop offset="100%" stopColor="#4AAAC8"/>
          </radialGradient>
          <radialGradient id="gm-ball-orange" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#FFE0A0"/>
            <stop offset="50%" stopColor="#FFB347"/>
            <stop offset="100%" stopColor="#E07820"/>
          </radialGradient>
          <radialGradient id="gm-ball-yellow" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#FFF5B0"/>
            <stop offset="50%" stopColor="#FFD966"/>
            <stop offset="100%" stopColor="#D4A800"/>
          </radialGradient>
          <radialGradient id="gm-ball-clear" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)"/>
            <stop offset="40%" stopColor="rgba(220,240,255,0.6)"/>
            <stop offset="100%" stopColor="rgba(160,210,240,0.4)"/>
          </radialGradient>
          {/* 레버 바 */}
          <linearGradient id="gm-lever-bar" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A07800"/>
            <stop offset="35%" stopColor="#FFE87C"/>
            <stop offset="65%" stopColor="#FFE87C"/>
            <stop offset="100%" stopColor="#A07800"/>
          </linearGradient>
          {/* 필터 */}
          <filter id="gm-shadow" x="-20%" y="-15%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="rgba(0,0,0,0.18)"/>
          </filter>
          <filter id="gm-inner-shadow">
            <feOffset dx="0" dy="3"/>
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          <filter id="gm-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* 글로브 클립 */}
          <clipPath id="gm-globe-clip">
            <circle cx="140" cy="128" r="100"/>
          </clipPath>
        </defs>

        {/* 바닥 그림자 */}
        <ellipse cx="140" cy="422" rx="95" ry="8" fill="rgba(0,0,0,0.12)"/>

        {/* ── 상단 골드 볼 ── */}
        <circle cx="140" cy="20" r="14" fill="url(#gm-gold)" filter="url(#gm-shadow)"/>
        <ellipse cx="134" cy="14" rx="5" ry="3" fill="rgba(255,255,255,0.65)" transform="rotate(-20 134 14)"/>

        {/* ── 글로브 외곽 링 ── */}
        <circle cx="140" cy="128" r="106" fill="rgba(180,220,240,0.25)" filter="url(#gm-shadow)"/>

        {/* ── 글로브 안 공들 ── */}
        <g clipPath="url(#gm-globe-clip)">
          {/* 행 1 */}
          <circle cx="72"  cy="80"  r="21" fill="url(#gm-ball-blue)"/>
          <ellipse cx="65" cy="73" rx="7" ry="4.5" fill="rgba(255,255,255,0.6)" transform="rotate(-15 65 73)"/>
          <line x1="51" y1="80" x2="93" y2="80" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>

          <circle cx="118" cy="68" r="24" fill="url(#gm-ball-orange)"/>
          <ellipse cx="110" cy="60" rx="8" ry="5" fill="rgba(255,255,255,0.6)" transform="rotate(-15 110 60)"/>
          <line x1="94" y1="68" x2="142" y2="68" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>

          <circle cx="168" cy="70" r="22" fill="url(#gm-ball-yellow)"/>
          <ellipse cx="161" cy="63" rx="7" ry="4.5" fill="rgba(255,255,255,0.6)" transform="rotate(-15 161 63)"/>
          <line x1="146" y1="70" x2="190" y2="70" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>

          <circle cx="210" cy="84" r="20" fill="url(#gm-ball-clear)" stroke="rgba(180,220,255,0.5)" strokeWidth="1"/>
          <ellipse cx="204" cy="77" rx="6" ry="3.5" fill="rgba(255,255,255,0.7)" transform="rotate(-15 204 77)"/>
          <line x1="190" y1="84" x2="230" y2="84" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>

          {/* 행 2 */}
          <circle cx="88"  cy="120" r="22" fill="url(#gm-ball-clear)" stroke="rgba(180,220,255,0.5)" strokeWidth="1"
            opacity={phase === 'dropping' ? 0.2 : 1}/>
          <ellipse cx="81" cy="113" rx="7" ry="4.5" fill="rgba(255,255,255,0.7)" transform="rotate(-15 81 113)"
            opacity={phase === 'dropping' ? 0.2 : 1}/>
          <line x1="66" y1="120" x2="110" y2="120" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"
            opacity={phase === 'dropping' ? 0.2 : 1}/>

          <circle cx="140" cy="114" r="26" fill="url(#gm-ball-orange)"/>
          <ellipse cx="131" cy="106" rx="9" ry="5.5" fill="rgba(255,255,255,0.6)" transform="rotate(-15 131 106)"/>
          <line x1="114" y1="114" x2="166" y2="114" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>

          <circle cx="192" cy="118" r="21" fill="url(#gm-ball-yellow)"/>
          <ellipse cx="185" cy="111" rx="7" ry="4.5" fill="rgba(255,255,255,0.6)" transform="rotate(-15 185 111)"/>
          <line x1="171" y1="118" x2="213" y2="118" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>

          {/* 행 3 */}
          <circle cx="78"  cy="160" r="20" fill="url(#gm-ball-blue)"/>
          <ellipse cx="72" cy="153" rx="6" ry="4" fill="rgba(255,255,255,0.6)" transform="rotate(-15 72 153)"/>
          <line x1="58" y1="160" x2="98" y2="160" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>

          <circle cx="124" cy="156" r="22" fill="url(#gm-ball-clear)" stroke="rgba(180,220,255,0.5)" strokeWidth="1"/>
          <ellipse cx="117" cy="149" rx="7" ry="4.5" fill="rgba(255,255,255,0.7)" transform="rotate(-15 117 149)"/>

          <circle cx="170" cy="158" r="21" fill="url(#gm-ball-orange)"/>
          <ellipse cx="163" cy="151" rx="7" ry="4" fill="rgba(255,255,255,0.6)" transform="rotate(-15 163 151)"/>
          <line x1="149" y1="158" x2="191" y2="158" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>

          <circle cx="212" cy="160" r="18" fill="url(#gm-ball-yellow)"/>
          <ellipse cx="206" cy="154" rx="6" ry="3.5" fill="rgba(255,255,255,0.6)" transform="rotate(-15 206 154)"/>
        </g>

        {/* 글로브 유리 오버레이 */}
        <circle cx="140" cy="128" r="100" fill="url(#gm-globe)"
          stroke="rgba(255,255,255,0.55)" strokeWidth="3"/>

        {/* 유리 광택 하이라이트 */}
        <path d="M 76 58 Q 88 46 112 62" stroke="rgba(255,255,255,0.65)" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M 65 80 Q 70 68 82 76" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M 72 100 Q 75 92 84 98" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* ── 골드 링 (글로브↔바디) ── */}
        <rect x="30" y="224" width="220" height="16" rx="6" fill="url(#gm-gold-ring)" filter="url(#gm-shadow)"/>
        <rect x="30" y="224" width="220" height="5" rx="3" fill="rgba(255,255,255,0.35)"/>
        <rect x="30" y="234" width="220" height="4" rx="2" fill="rgba(0,0,0,0.12)"/>

        {/* ── 바디 ── */}
        <rect x="46" y="236" width="188" height="138" rx="32" fill="url(#gm-body)" filter="url(#gm-shadow)"/>
        {/* 바디 하이라이트 */}
        <path d="M 64 248 Q 95 238 138 242" stroke="rgba(255,255,255,0.42)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>

        {/* ── 레버 패널 ── */}
        <rect x="106" y="252" width="68" height="96" rx="13" fill="#FDF5DC" stroke="url(#gm-gold-ring)" strokeWidth="2.5"/>
        {/* 패널 내부 그림자 */}
        <rect x="106" y="252" width="68" height="10" rx="10" fill="rgba(0,0,0,0.05)"/>

        {/* 레버 피벗 링 (골드 외부) */}
        <circle cx="140" cy="295" r="24" fill="url(#gm-gold)" filter="url(#gm-shadow)"/>
        <circle cx="140" cy="295" r="20" fill="#FDF5DC" stroke="url(#gm-gold-ring)" strokeWidth="2"/>
        <circle cx="140" cy="295" r="14" fill="url(#gm-gold)" opacity="0.55"/>
        <ellipse cx="133" cy="287" rx="5" ry="3" fill="rgba(255,255,255,0.65)" transform="rotate(-20 133 287)"/>

        {/* ── 레버 (회전) ── */}
        <g
          transform={`rotate(${phase === 'turning' ? 0 : displayAngle} 140 295)`}
          style={{
            cursor: phase === 'idle' && !isLoading ? 'grab' : 'default',
            transition: phase === 'turning' ? 'transform 0.7s cubic-bezier(0.4,0,0.2,1)' : isDragging ? 'none' : 'transform 0.25s ease-out',
          }}
          onMouseDown={handleLeverDown}
          onTouchStart={handleLeverDown}
        >
          {/* 레버 바 */}
          <rect x="136" y="265" width="8" height="32" rx="4" fill="url(#gm-lever-bar)"/>
          {/* 손잡이 (오렌지 볼) */}
          <circle cx="140" cy="260" r="14" fill="url(#gm-orange)" filter="url(#gm-shadow)"/>
          <ellipse cx="134" cy="253" rx="5" ry="3.5" fill="rgba(255,255,255,0.65)" transform="rotate(-20 134 253)"/>
          <circle cx="140" cy="260" r="14" fill="none" stroke="rgba(160,80,0,0.35)" strokeWidth="1.5"/>
        </g>

        {/* CSS로 turning 애니메이션 override */}
        {phase === 'turning' && (
          <g transform="rotate(180 140 295)">
            <rect x="136" y="265" width="8" height="32" rx="4" fill="url(#gm-lever-bar)" className="animate-lever-turn" style={{ transformOrigin: '140px 295px' }}/>
            <circle cx="140" cy="260" r="14" fill="url(#gm-orange)" filter="url(#gm-shadow)"/>
            <ellipse cx="134" cy="253" rx="5" ry="3.5" fill="rgba(255,255,255,0.65)" transform="rotate(-20 134 253)"/>
          </g>
        )}

        {/* 배출구 슬롯 */}
        <rect x="120" y="332" width="40" height="12" rx="4" fill="#6B4F0A" opacity="0.75"/>
        <rect x="120" y="332" width="40" height="5" rx="3" fill="rgba(0,0,0,0.35)"/>

        {/* ── 하단 골드 링 ── */}
        <rect x="30" y="370" width="220" height="12" rx="5" fill="url(#gm-gold-ring)"/>
        <rect x="30" y="370" width="220" height="4" rx="3" fill="rgba(255,255,255,0.3)"/>

        {/* ── 배출 트레이 ── */}
        <path d="M 105 378 Q 105 408 140 408 Q 175 408 175 378 Z" fill="url(#gm-orange)"/>
        <path d="M 110 378 Q 110 400 140 400 Q 170 400 170 378 Z" fill="rgba(255,255,255,0.18)"/>

        {/* 트레이 안 공 (sparkling/done) */}
        {(phase === 'sparkling' || phase === 'done') && (
          <g className="animate-ball-bounce" style={{ transformOrigin: '140px 392px' }}>
            <circle cx="140" cy="392" r="14" fill="url(#gm-ball-clear)" stroke="rgba(180,220,255,0.6)" strokeWidth="1.5" filter="url(#gm-glow)"/>
            <ellipse cx="134" cy="385" rx="5" ry="3" fill="rgba(255,255,255,0.8)" transform="rotate(-15 134 385)"/>
            <line x1="126" y1="392" x2="154" y2="392" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
          </g>
        )}

        {/* ── 발 ── */}
        {[88, 140, 192].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy="412" r="12" fill="url(#gm-orange)"/>
            <ellipse cx={cx - 5} cy="406" rx="4" ry="2.5" fill="rgba(255,255,255,0.55)" transform={`rotate(-15 ${cx-5} 406)`}/>
          </g>
        ))}

        {/* 공 낙하 애니메이션 */}
        {phase === 'dropping' && (
          <circle cx="140" cy="128" r="20" fill="url(#gm-ball-clear)"
            stroke="rgba(180,220,255,0.6)" strokeWidth="1.5" className="animate-ball-drop"/>
        )}
      </svg>

      {/* ── 레버 돌리기 버튼 ── */}
      <button
        onClick={triggerMachine}
        disabled={isAnimating || isLoading}
        className={`mt-5 px-9 py-4 rounded-2xl font-bold text-white text-base transition-all shadow-lg
          ${isAnimating || isLoading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-[#FF6000] hover:bg-orange-500 active:scale-95'}`}
      >
        {isLoading ? '배정 중...' : isAnimating ? '뽑는 중...' : '🎰 레버 돌리기'}
      </button>
      <p className="mt-2 text-xs text-gray-400">레버를 드래그하거나 버튼을 눌러보세요</p>
    </div>
  );
}
