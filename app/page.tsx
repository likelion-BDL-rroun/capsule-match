'use client';

import { useRouter } from 'next/navigation';

const HERO_PARTICLES = [
  { left: '12%', top: '22%', size: 5, opacity: 0.5, dur: 9, delay: 0, color: 'rgba(255,150,60,0.9)' },
  { left: '78%', top: '18%', size: 7, opacity: 0.45, dur: 12, delay: 1.5, color: 'rgba(255,96,0,0.85)' },
  { left: '32%', top: '62%', size: 4, opacity: 0.4, dur: 10, delay: 0.8, color: 'rgba(255,210,150,0.9)' },
  { left: '88%', top: '55%', size: 6, opacity: 0.5, dur: 13, delay: 2.2, color: 'rgba(255,120,40,0.8)' },
  { left: '55%', top: '30%', size: 3, opacity: 0.55, dur: 8, delay: 0.4, color: 'rgba(255,255,255,0.8)' },
  { left: '20%', top: '78%', size: 5, opacity: 0.4, dur: 11, delay: 1.1, color: 'rgba(255,180,90,0.85)' },
  { left: '68%', top: '72%', size: 4, opacity: 0.45, dur: 9.5, delay: 1.8, color: 'rgba(255,255,255,0.7)' },
  { left: '45%', top: '12%', size: 6, opacity: 0.4, dur: 14, delay: 0.6, color: 'rgba(255,96,0,0.8)' },
  { left: '8%', top: '48%', size: 4, opacity: 0.5, dur: 10.5, delay: 2.5, color: 'rgba(255,200,130,0.85)' },
  { left: '92%', top: '35%', size: 5, opacity: 0.45, dur: 12.5, delay: 1.3, color: 'rgba(255,140,50,0.85)' },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <main style={{ background: 'var(--bg)' }}>
      <section style={{
        minHeight: '100dvh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 0 52px 0',
      }}>
        <style>{`
          @keyframes hero-float {
            0%, 100% { transform: translateY(0) translateX(0); opacity: var(--o); }
            50%      { transform: translateY(-26px) translateX(10px); opacity: calc(var(--o) * 1.6); }
          }
          @keyframes hero-glow-a {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.85; }
            50%      { transform: translate(-40px, 30px) scale(1.15); opacity: 1; }
          }
          @keyframes hero-glow-b {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
            50%      { transform: translate(50px, -20px) scale(1.2); opacity: 0.9; }
          }
          @keyframes hero-btn-pulse {
            0%, 100% { box-shadow: 0 0 28px rgba(255,96,0,0.45); }
            50%      { box-shadow: 0 0 48px 6px rgba(255,96,0,0.6); }
          }
          @keyframes hero-cards-float {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50%      { transform: translateX(-50%) translateY(-14px); }
          }
          .hero-cards-mobile { display: none; }
          .hero-inner { padding: 0 40px; }
          @media (max-width: 768px) {
            .hero-cards-pc { display: none; }
            .hero-cards-mobile { display: block; }
            .hero-inner { padding: 0 20px; }
          }
        `}</style>

        {/* 배경 */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 90% 70% at 70% 30%, black 20%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 70% 30%, black 20%, transparent 80%)',
          }} />
          <div style={{
            position: 'absolute', top: '-10%', right: '-5%',
            width: 700, height: 700, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,96,0,0.42) 0%, rgba(255,96,0,0.12) 40%, transparent 70%)',
            filter: 'blur(20px)',
            animation: 'hero-glow-a 11s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '5%', left: '-10%',
            width: 560, height: 560, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,150,40,0.22) 0%, transparent 65%)',
            filter: 'blur(30px)',
            animation: 'hero-glow-b 14s ease-in-out infinite',
          }} />
          {HERO_PARTICLES.map((p, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: p.left, top: p.top,
              width: p.size, height: p.size, borderRadius: '50%',
              background: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              ['--o' as string]: p.opacity,
              opacity: p.opacity,
              animation: `hero-float ${p.dur}s ease-in-out ${p.delay}s infinite`,
            }} />
          ))}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 50%, rgba(14,14,14,0.6) 100%)',
          }} />
        </div>

        {/* 카드 3장 — PC */}
        <img
          src="/카드3장.png"
          alt="Animal League 카드"
          className="hero-cards hero-cards-pc"
          style={{
            position: 'absolute',
            top: '1%', left: '56%',
            transform: 'translateX(-50%)',
            width: 'min(94%, 1056px)',
            height: 'auto',
            zIndex: 1,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 24px 60px rgba(49,20,11,0.45))',
            animation: 'hero-cards-float 6s ease-in-out infinite',
          }}
        />
        {/* 카드 3장 — 모바일 */}
        <img
          src="/모바일 카드3장.png"
          alt="Animal League 카드"
          className="hero-cards hero-cards-mobile"
          style={{
            position: 'absolute',
            top: '15%', left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            height: 'auto',
            zIndex: 1,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 24px 60px rgba(49,20,11,0.45))',
            animation: 'hero-cards-float 6s ease-in-out infinite',
          }}
        />

        {/* 텍스트 + 버튼 */}
        <div className="hero-inner" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1232, margin: '0 auto' }}>
          <h1 style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(44px, 9vw, 82px)', fontWeight: 400,
            lineHeight: 1.25, margin: '0 0 16px',
            letterSpacing: '0.03em',
            color: '#fff',
            textShadow: '0px 2px 4px rgba(214,81,0,0.25)',
          }}>
            Animal League<br />Hackathon 2026
          </h1>
          <p style={{
            fontSize: 'clamp(17px, 3vw, 32px)', fontWeight: 700,
            color: '#fff', margin: '0 0 32px',
            letterSpacing: '0.03em', lineHeight: 1.25,
            textShadow: '0px 2px 4px rgba(214,81,0,0.25)',
          }}>
            카드 뽑기 게임으로 대표 캐릭터를 매칭해주세요
          </p>
          <button
            onClick={() => router.push('/select')}
            style={{
              background: '#FF6000', color: '#fff',
              fontWeight: 700, fontSize: 16,
              padding: '15px 32px', borderRadius: 16,
              border: 'none', cursor: 'pointer',
              animation: 'hero-btn-pulse 2.6s ease-in-out infinite',
            }}
          >
            학교 선택하기 →
          </button>
        </div>

      </section>
    </main>
  );
}
