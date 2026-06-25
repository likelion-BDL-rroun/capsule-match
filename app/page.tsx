'use client';

import { useRouter } from 'next/navigation';

const HERO_PARTICLES = [
  { left: '12%', top: '22%', size: 5, opacity: 0.5, dur: 9, delay: 0, color: 'rgba(255,150,60,0.9)' },
  { left: '78%', top: '18%', size: 7, opacity: 0.45, dur: 12, delay: 1.5, color: 'rgba(255,96,0,0.85)' },
  { left: '32%', top: '62%', size: 4, opacity: 0.4, dur: 10, delay: 0.8, color: 'rgba(255,210,150,0.9)' },
  { left: '88%', top: '55%', size: 6, opacity: 0.5, dur: 13, delay: 2.2, color: 'rgba(255,120,40,0.8)' },
  { left: '55%', top: '14%', size: 3, opacity: 0.55, dur: 8, delay: 0.4, color: 'rgba(255,255,255,0.8)' },
  { left: '20%', top: '78%', size: 5, opacity: 0.4, dur: 11, delay: 1.1, color: 'rgba(255,180,90,0.85)' },
  { left: '68%', top: '74%', size: 4, opacity: 0.45, dur: 9.5, delay: 1.8, color: 'rgba(255,255,255,0.7)' },
  { left: '45%', top: '10%', size: 6, opacity: 0.4, dur: 14, delay: 0.6, color: 'rgba(255,96,0,0.8)' },
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 20px 56px',
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
          /* 카드 3D 회전 */
          @keyframes card-spin { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
          @keyframes card-bob  { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
          @keyframes card-shadow { 0%,100% { transform: translateX(-50%) scale(1); opacity: 0.45; } 50% { transform: translateX(-50%) scale(0.82); opacity: 0.28; } }

          .spin-stage { perspective: 1200px; width: clamp(190px, 42vw, 260px); }
          .spin-bob { animation: card-bob 5s ease-in-out infinite; }
          .spin-card {
            position: relative; width: 100%; aspect-ratio: 2 / 3;
            transform-style: preserve-3d;
            animation: card-spin 8s linear infinite;
          }
          .spin-face {
            position: absolute; inset: 0; border-radius: 16px; overflow: hidden;
            backface-visibility: hidden; -webkit-backface-visibility: hidden;
            box-shadow: 0 24px 60px rgba(49,20,11,0.5), 0 0 0 1px rgba(255,255,255,0.06);
          }
          .spin-face img { width: 100%; height: 100%; object-fit: cover; display: block; }
          .spin-face.back { transform: rotateY(180deg); }
          .spin-shadow {
            position: absolute; left: 50%; bottom: -34px;
            width: 60%; height: 26px; border-radius: 50%;
            background: radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%);
            filter: blur(6px); animation: card-shadow 5s ease-in-out infinite; pointer-events: none;
          }

          .hero-copy { text-align: center; margin-top: 56px; max-width: 560px; }
          .hero-eyebrow { font-size: 13px; font-weight: 700; letter-spacing: 0.18em; color: #FF8a3d; margin: 0 0 14px; text-transform: uppercase; }
          .hero-title { font-family: 'Anton', sans-serif; font-weight: 400; font-size: clamp(34px, 7vw, 56px); line-height: 1.05; letter-spacing: 0.03em; color: #fff; margin: 0 0 18px; text-shadow: 0px 2px 4px rgba(214,81,0,0.25); }
          .hero-desc { font-size: clamp(14px, 2.4vw, 17px); font-weight: 500; line-height: 1.65; color: rgba(255,255,255,0.62); margin: 0 0 32px; }
          .hero-cta {
            background: #FF6000; color: #fff; font-weight: 700; font-size: 16px;
            padding: 16px 34px; border-radius: 16px; border: none; cursor: pointer;
            animation: hero-btn-pulse 2.6s ease-in-out infinite;
          }
        `}</style>

        {/* 배경 */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 38%, black 20%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 38%, black 20%, transparent 80%)',
          }} />
          <div style={{
            position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)',
            width: 640, height: 640, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,96,0,0.34) 0%, rgba(255,96,0,0.10) 42%, transparent 70%)',
            filter: 'blur(24px)',
            animation: 'hero-glow-a 11s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '2%', left: '-10%',
            width: 520, height: 520, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,150,40,0.18) 0%, transparent 65%)',
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
        </div>

        {/* 회전하는 카드 */}
        <div className="spin-stage" style={{ position: 'relative', zIndex: 2 }}>
          <div className="spin-bob">
            <div className="spin-card">
              <div className="spin-face front"><img src="/card-back-0624.png" alt="Animal League 카드" /></div>
              <div className="spin-face back"><img src="/card-back-0624.png" alt="" /></div>
            </div>
            <div className="spin-shadow" />
          </div>
        </div>

        {/* 설명 + 버튼 */}
        <div className="hero-copy" style={{ position: 'relative', zIndex: 2 }}>
          <p className="hero-eyebrow">LIKELION UNIV.</p>
          <h1 className="hero-title">ANIMAL LEAGUE<br />CHARACTER MATCH</h1>
          <p className="hero-desc">
            80개 대학, 80개의 캐릭터.<br />
            우리 학교에 어떤 동물 파트너가 찾아올까요?<br />
            카드를 골라 나만의 캐릭터를 만나보세요.
          </p>
          <button className="hero-cta" onClick={() => router.push('/select')}>
            학교 선택하기 →
          </button>
        </div>
      </section>
    </main>
  );
}
