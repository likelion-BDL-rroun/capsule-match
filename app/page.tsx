'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import { University } from '@/lib/types';
import UniversitySelect from '@/components/UniversitySelect';

const SpinningCard3D = dynamic(() => import('@/components/SpinningCard3D'), { ssr: false });

const HERO_PARTICLES = [
  { left: '12%', top: '22%', size: 5, opacity: 0.5, dur: 9,    delay: 0,   color: 'rgba(255,150,60,0.9)' },
  { left: '78%', top: '18%', size: 7, opacity: 0.45, dur: 12,  delay: 1.5, color: 'rgba(255,96,0,0.85)' },
  { left: '32%', top: '62%', size: 4, opacity: 0.4,  dur: 10,  delay: 0.8, color: 'rgba(255,210,150,0.9)' },
  { left: '88%', top: '55%', size: 6, opacity: 0.5,  dur: 13,  delay: 2.2, color: 'rgba(255,120,40,0.8)' },
  { left: '55%', top: '30%', size: 3, opacity: 0.55, dur: 8,   delay: 0.4, color: 'rgba(255,255,255,0.8)' },
  { left: '20%', top: '78%', size: 5, opacity: 0.4,  dur: 11,  delay: 1.1, color: 'rgba(255,180,90,0.85)' },
  { left: '68%', top: '72%', size: 4, opacity: 0.45, dur: 9.5, delay: 1.8, color: 'rgba(255,255,255,0.7)' },
  { left: '45%', top: '12%', size: 6, opacity: 0.4,  dur: 14,  delay: 0.6, color: 'rgba(255,96,0,0.8)' },
  { left: '8%',  top: '48%', size: 4, opacity: 0.5,  dur: 10.5,delay: 2.5, color: 'rgba(255,200,130,0.85)' },
  { left: '92%', top: '35%', size: 5, opacity: 0.45, dur: 12.5,delay: 1.3, color: 'rgba(255,140,50,0.85)' },
];

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function HomePage() {
  const router = useRouter();
  const [universities, setUniversities] = useState<University[]>([]);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [gridVisible, setGridVisible] = useState(false);

  // DOM refs — 스크롤 애니메이션을 React state 없이 직접 업데이트
  const sceneRef      = useRef<HTMLDivElement>(null);
  const listSectionRef = useRef<HTMLElement>(null);
  const listHeaderRef  = useRef<HTMLDivElement>(null);
  const listGridRef    = useRef<HTMLDivElement>(null);
  const cardStageRef   = useRef<HTMLDivElement>(null);
  const bgHeroRef      = useRef<HTMLDivElement>(null);
  const bgSection2Ref  = useRef<HTMLDivElement>(null);
  const introCopyRef   = useRef<HTMLDivElement>(null);
  const scrollIndRef   = useRef<HTMLDivElement>(null);
  const bgSection2ImgRef = useRef<HTMLImageElement>(null);

  // Three.js가 useFrame에서 직접 읽는 tilt refs
  const tiltRef  = useRef<number>(0.12);
  const zTiltRef = useRef<number>(-0.35);

  // isMobile은 resize 때만 바뀌므로 ref로 관리 (리렌더 불필요)
  const isMobileRef = useRef(false);
  // isMobile state는 초기 JSX 렌더링용으로만 사용
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    supabase
      .from('universities')
      .select('id, name, assigned_character_id, assigned_at, created_at')
      .order('name')
      .then(({ data }) => setUniversities((data as University[]) ?? []));
  }, []);

  // 학교 리스트 등장 애니메이션
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (!e.isIntersecting) return;
        if (e.target === listHeaderRef.current) setHeaderVisible(true);
        if (e.target === listGridRef.current) setGridVisible(true);
        io.unobserve(e.target);
      }),
      { threshold: 0, rootMargin: '0px 0px -60px 0px' }
    );
    if (listHeaderRef.current) io.observe(listHeaderRef.current);
    if (listGridRef.current) io.observe(listGridRef.current);
    return () => io.disconnect();
  }, []);

  // 모바일 감지
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    isMobileRef.current = mq.matches;
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      isMobileRef.current = e.matches;
      setIsMobile(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // 스크롤 → DOM 직접 업데이트 (React 리렌더 없음)
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = sceneRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = clamp(-el.getBoundingClientRect().top, 0, total);
      const p = total > 0 ? scrolled / total : 0;

      const mobile = isMobileRef.current;
      const focus     = ease(range(p, 0.14, 0.46));
      const scrollIco = 1 - range(p, 0.01, 0.08);
      const grayOut   = 1 - ease(range(p, 0.08, 0.48));
      const orangeIn  = ease(range(p, 0.20, 0.44));
      const introIn   = ease(range(p, 0.52, 0.74));
      const cardScale = lerp(1, 0.86, focus);
      const cardTop   = lerp(50, 45, focus);
      const cardLeft  = lerp(20, 70, focus); // 데스크탑용 (모바일은 CSS !important)

      // Three.js ref 업데이트 (useFrame이 다음 프레임에 읽음)
      tiltRef.current  = lerp(0.12, 0, focus);
      zTiltRef.current = lerp(-0.35, 0, focus);

      // 카드 위치
      if (cardStageRef.current) {
        const s = cardStageRef.current.style;
        if (mobile) {
          s.top = `${cardTop}%`;
          s.transform = `translate(-50%, calc(-50% - 36px)) scale(${cardScale})`;
        } else {
          s.left = `${cardLeft}%`;
          s.top = '50%';
          s.transform = `translate(-50%, -50%) scale(${cardScale})`;
        }
      }

      // 1번 섹션 배경
      if (bgHeroRef.current) {
        const s = bgHeroRef.current.style;
        s.opacity = String(grayOut);
        s.transform = `translateY(${lerp(0, -140, 1 - grayOut)}px) scale(${lerp(1, 1.04, 1 - grayOut)})`;
      }

      // 2번 섹션 배경
      if (bgSection2Ref.current) {
        const s = bgSection2Ref.current.style;
        s.opacity = String(orangeIn);
        s.transform = `translateY(${lerp(80, -36, orangeIn)}px)`;
      }

      // 2번 섹션 배경 이미지 모바일 marginTop
      if (bgSection2ImgRef.current) {
        bgSection2ImgRef.current.style.marginTop = mobile ? '-20%' : '';
      }

      // 안내 텍스트
      if (introCopyRef.current) {
        const s = introCopyRef.current.style;
        s.opacity = String(introIn);
        s.pointerEvents = introIn > 0.5 ? 'auto' : 'none';
        if (mobile) {
          s.transform = `translate(-50%, ${lerp(20, 0, introIn)}px)`;
        } else {
          s.transform = `translateY(calc(-50% + ${lerp(28, 0, introIn)}px))`;
          s.right = `calc(${(100 - cardLeft).toFixed(1)}% + ${Math.round(200 * cardScale + 40)}px)`;
        }
      }

      // 스크롤 유도 아이콘
      if (scrollIndRef.current) {
        scrollIndRef.current.style.opacity = String(scrollIco);
      }
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const handleSelect = (uni: University) => {
    if (uni.assigned_character_id) router.push(`/result/${uni.id}`);
    else router.push(`/select?u=${uni.id}`);
  };

  return (
    <main style={{ background: 'var(--bg)' }}>
      <style>{`
        @keyframes sd-wheel { 0% { transform: translateY(0); opacity: 0; } 12% { transform: translateY(0); opacity: 1; } 58% { transform: translateY(7px); opacity: 1; } 72% { transform: translateY(7px); opacity: 0; } 73% { transform: translateY(0); opacity: 0; } 100% { transform: translateY(0); opacity: 0; } }
        @keyframes sd-fade  { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
        @keyframes hero-float  { 0%,100% { transform: translateY(0) translateX(0); opacity: var(--o); } 50% { transform: translateY(-26px) translateX(10px); opacity: calc(var(--o) * 1.6); } }
        @keyframes hero-glow-a { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.85; } 50% { transform: translate(-40px,30px) scale(1.15); opacity: 1; } }
        @keyframes hero-glow-b { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.6; }  50% { transform: translate(50px,-20px) scale(1.2); opacity: 0.9; } }
        .scene-sticky { position: sticky; top: 0; height: 100dvh; overflow: hidden; }
        .stage-frame { position: relative; width: 100%; max-width: 1232px; height: 100%; margin: 0 auto; padding: 0 24px; }
        .bg-text-layer { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
        .bg-hero-img { position: absolute; inset: 0; overflow: hidden; display: flex; align-items: center; }
        .bg-hero-img img { width: 100%; height: auto; display: block; flex-shrink: 0; }
        .bg-section2-img { position: absolute; inset: 0; overflow: hidden; display: flex; align-items: center; }
        .bg-section2-img img { width: 100%; height: auto; display: block; flex-shrink: 0; }
        .card-stage { position: absolute; top: 50%; width: clamp(280px, 26vw, 400px); aspect-ratio: 3 / 4; will-change: transform; overflow: visible; }
        .intro-copy { position: absolute; top: 50%; max-width: 380px; will-change: transform, opacity; }
        .intro-title { font-size: clamp(26px, 2.6vw, 42px); font-weight: 800; color: #fff; line-height: 1.25; margin: 0 0 18px; letter-spacing: 0.01em; }
        .intro-body  { font-size: clamp(14px, 1.1vw, 18px); font-weight: 500; color: rgba(255,255,255,0.6); line-height: 1.45; margin: 0; }
        .scroll-ind { position: absolute; bottom: 38px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; animation: sd-fade 2.4s ease-in-out infinite; }
        .scroll-ind .mouse { width: 24px; height: 38px; border: 2px solid rgba(255,255,255,0.4); border-radius: 12px; display: flex; justify-content: center; padding-top: 6px; }
        .scroll-ind .wheel { width: 3px; height: 7px; background: rgba(255,255,255,0.7); border-radius: 2px; animation: sd-wheel 1.6s ease-in-out infinite; }
        .list-section { width: 100%; max-width: 1232px; margin: 0 auto; padding: 200px 16px 120px; }
        .list-title { font-size: 28px; font-weight: 800; color: #fff; text-align: center; margin: 0 0 14px; }
        .list-subtitle { font-size: 13px; color: rgba(255,255,255,0.55); text-align: center; line-height: 1.6; margin: 0 0 40px; }
        @media (min-width: 769px) {
          .list-section { padding: 240px 40px 120px; }
          .list-title { font-size: 36px; }
          .list-subtitle { font-size: 18px; margin-bottom: 80px; }
        }
        .nav-arrows { position: fixed; bottom: 32px; right: 32px; display: flex; flex-direction: column; gap: 8px; z-index: 100; }
        .nav-arrow-btn { width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.18); background: rgba(14,14,14,0.7); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; cursor: pointer; color: rgba(255,255,255,0.7); transition: border-color 0.2s, color 0.2s, background 0.2s; }
        .nav-arrow-btn:hover { border-color: #FF6000; color: #FF6000; background: rgba(255,96,0,0.1); }
        @media (max-width: 768px) {
          .card-stage { width: clamp(260px, 72vw, 360px); left: 56vw !important; }
          .intro-copy { left: 50vw !important; width: calc(100vw - 48px) !important; top: calc(68% - 36px) !important; text-align: center; }
          .nav-arrows { bottom: 20px; right: 20px; }
          .nav-arrow-btn { width: 32px; height: 32px; }
          .bg-hero-img img { margin-top: -20px; }
        }
      `}</style>

      {/* ───── 스크롤 씬 ───── */}
      <div ref={sceneRef} style={{ height: '520vh', position: 'relative' }}>
        <div className="scene-sticky">

          {/* 글로우 + 파티클 */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,96,0,0.42) 0%, rgba(255,96,0,0.12) 40%, transparent 70%)', filter: 'blur(20px)', animation: 'hero-glow-a 11s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: '5%', left: '-10%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,150,40,0.22) 0%, transparent 65%)', filter: 'blur(30px)', animation: 'hero-glow-b 14s ease-in-out infinite' }} />
            {HERO_PARTICLES.map((pt, i) => (
              <div key={i} style={{ position: 'absolute', left: pt.left, top: pt.top, width: pt.size, height: pt.size, borderRadius: '50%', background: pt.color, boxShadow: `0 0 ${pt.size * 2}px ${pt.color}`, ['--o' as string]: pt.opacity, opacity: pt.opacity, animation: `hero-float ${pt.dur}s ease-in-out ${pt.delay}s infinite` }} />
            ))}
          </div>

          {/* 배경 레이어 */}
          <div className="bg-text-layer" style={{ zIndex: 1 }}>
            <div ref={bgHeroRef} className="bg-hero-img" style={{ opacity: 1 }}>
              <picture>
                <source media="(max-width: 768px)" srcSet="/mo-background_ver2.png" />
                <img src="/main.1_background_ver2.png" alt="" style={{ width: '100%', height: 'auto', display: 'block', flexShrink: 0 }} />
              </picture>
            </div>
            <div ref={bgSection2Ref} className="bg-section2-img" style={{ opacity: 0 }}>
              <img ref={bgSection2ImgRef} src="/main.2_background_ver2.png" alt="" />
            </div>
          </div>

          {/* 콘텐츠 프레임 */}
          <div className="stage-frame" style={{ zIndex: 3 }}>
            {/* 3D 카드 */}
            <div
              ref={cardStageRef}
              className="card-stage"
              style={{
                left: isMobile ? '56vw' : '50%',
                top: '50%',
                transform: 'translate(-50%, -50%) scale(1)',
              }}
            >
              <SpinningCard3D tiltRef={tiltRef} zTiltRef={zTiltRef} />
            </div>

            {/* 안내 텍스트 */}
            <div
              ref={introCopyRef}
              className="intro-copy"
              style={{
                zIndex: 4,
                opacity: 0,
                pointerEvents: 'none',
                transform: 'translateY(20px)',
              }}
            >
              <h2 className="intro-title">우리 학교에 어떤<br />파트너가 찾아올까요?</h2>
              <p className="intro-body">
                카드를 골라 우리 학교만의 캐릭터를 만나보세요.<br />
                2026 해커톤의 파트너가 됩니다.
              </p>
            </div>
          </div>

          {/* 스크롤 유도 */}
          <div ref={scrollIndRef} className="scroll-ind" style={{ zIndex: 5, pointerEvents: 'none' }}>
            <div className="mouse"><div className="wheel" /></div>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>SCROLL</span>
          </div>
        </div>
      </div>

      {/* ───── 우측 하단 네비게이션 화살표 ───── */}
      <div className="nav-arrows">
        <button className="nav-arrow-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="맨 위로">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 13V5M9 5L5 9M9 5l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button className="nav-arrow-btn" onClick={() => listSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} aria-label="학교 리스트로">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 5v8M9 13l-4-4M9 13l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* ───── 학교 리스트 ───── */}
      <section ref={listSectionRef} className="list-section">
        <div
          ref={listHeaderRef}
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(36px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <h2 className="list-title">학교를 확인하고 골라주세요</h2>
          <p className="list-subtitle">학교별 캐릭터 카드는 한 번만 매칭할 수 있어요</p>
        </div>
        <div
          ref={listGridRef}
          style={{
            opacity: gridVisible ? 1 : 0,
            transform: gridVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.65s ease 0.35s, transform 0.65s ease 0.35s',
          }}
        >
          {universities.length === 0 ? (
            <div className="flex items-center justify-center" style={{ paddingTop: 60 }}>
              <div style={{ width: 32, height: 32, border: '4px solid rgba(255,96,0,0.2)', borderTop: '4px solid #FF6000', borderRadius: '50%' }} className="animate-spin" />
            </div>
          ) : (
            <UniversitySelect universities={universities} onSelect={handleSelect} />
          )}
        </div>
      </section>
    </main>
  );
}
