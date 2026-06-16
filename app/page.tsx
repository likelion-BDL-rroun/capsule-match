'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { University } from '@/lib/types';
import UniversitySelect from '@/components/UniversitySelect';
import CodeInput from '@/components/CodeInput';
import LoadingOverlay from '@/components/LoadingOverlay';
import CardCarousel from '@/components/CardCarousel';
import CornerGlow from '@/components/CornerGlow';

type Step = 'intro' | 'enterCode' | 'pickCapsule';

// 히어로 배경 떠다니는 입자 (SSR 하이드레이션 안정성을 위해 고정값)
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
  const [step, setStep] = useState<Step>('intro');
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    const { data } = await supabase
      .from('universities')
      .select('id, name, assigned_character_id, assigned_at, created_at')
      .order('name');
    setUniversities((data as University[]) ?? []);
  };

  const scrollToSelect = () => {
    selectRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUniversitySelect = (uni: University) => {
    setSelectedUniversity(uni);
    if (uni.assigned_character_id) { router.push(`/result/${uni.id}`); return; }
    setCodeError('');
    setStep('enterCode');
  };

  const handleCodeSubmit = async (code: string) => {
    if (!selectedUniversity) return;
    setIsLoading(true);
    setCodeError('');
    const res = await fetch('/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ universityId: selectedUniversity.id, code }),
    });
    const data = await res.json();
    setIsLoading(false);
    if (data.alreadyAssigned) { router.push(`/result/${selectedUniversity.id}`); return; }
    if (!data.success) { setCodeError(data.error); return; }
    setVerifiedCode(code);
    setStep('pickCapsule');
  };

  const handleCapsulePick = async () => {
    if (!selectedUniversity || !verifiedCode) return;
    setIsLoading(true);
    const res = await fetch('/api/assign-character', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ universityId: selectedUniversity.id, code: verifiedCode }),
    });
    const data = await res.json();
    setIsLoading(false);
    if (data.alreadyAssigned || data.success) { router.push(`/result/${selectedUniversity.id}`); return; }
    alert(data.error ?? '오류가 발생했어요. 다시 시도해주세요.');
    setStep('intro');
  };

  // 코드 입력 / 카드 뽑기 화면
  if (step === 'enterCode' && selectedUniversity) {
    return (
      <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
        {isLoading && <LoadingOverlay />}
        <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto', padding: '32px 24px', minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <button onClick={() => { setStep('intro'); setCodeError(''); }} style={{ position: 'absolute', top: 32, left: 24, color: 'rgba(255,255,255,0.35)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', zIndex: 5 }}>
            ← 뒤로
          </button>
          <CodeInput
            universityName={selectedUniversity.name}
            onSubmit={handleCodeSubmit}
            isLoading={isLoading}
            error={codeError}
          />
        </div>
      </main>
    );
  }

  if (step === 'pickCapsule' && selectedUniversity) {
    return (
      <main className="min-h-screen flex flex-col items-center" style={{ background: 'var(--bg)' }}>
        {isLoading && <LoadingOverlay message="캐릭터를 배정하는 중..." />}
        {/* 상단 설명 영역 — 투명 + 블러 */}
        <div style={{
          width: '100%', textAlign: 'center',
          padding: '40px 20px 24px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'rgba(14,14,14,0.4)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f0', marginBottom: 4 }}>
            {selectedUniversity.name}
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            카드를 골라 캐릭터를 뽑아보세요!
          </p>
        </div>
        <CardCarousel onComplete={handleCapsulePick} isLoading={isLoading} />
      </main>
    );
  }

  // 인트로 (히어로 + 학교 선택)
  return (
    <main style={{ background: 'var(--bg)' }}>

      {/* ── 히어로 섹션 ── */}
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
          @keyframes scroll-bounce {
            0%, 100% { transform: translateY(0); opacity: 0.5; }
            50%      { transform: translateY(6px); opacity: 1; }
          }
        `}</style>

        {/* 배경 — 다층 오렌지 글로우 + 그리드 + 입자 */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          {/* 페이드 그리드 */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 90% 70% at 70% 30%, black 20%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 70% 30%, black 20%, transparent 80%)',
          }} />
          {/* 메인 글로우 */}
          <div style={{
            position: 'absolute', top: '-10%', right: '-5%',
            width: 700, height: 700, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,96,0,0.42) 0%, rgba(255,96,0,0.12) 40%, transparent 70%)',
            filter: 'blur(20px)',
            animation: 'hero-glow-a 11s ease-in-out infinite',
          }} />
          {/* 보조 글로우 */}
          <div style={{
            position: 'absolute', bottom: '5%', left: '-10%',
            width: 560, height: 560, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,150,40,0.22) 0%, transparent 65%)',
            filter: 'blur(30px)',
            animation: 'hero-glow-b 14s ease-in-out infinite',
          }} />
          {/* 떠다니는 입자 */}
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
          {/* 하단 비네팅 */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 50%, rgba(14,14,14,0.6) 100%)',
          }} />
        </div>

        {/* 텍스트 + 버튼 */}
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,180,60,0.95)', fontWeight: 600, marginBottom: 14, letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6000', boxShadow: '0 0 10px #FF6000', display: 'inline-block' }} />
            우리 학교 대표 캐릭터를 선택해주세요
          </p>
          <h1 style={{
            fontSize: 'clamp(36px, 7vw, 64px)', fontWeight: 900,
            lineHeight: 1.1, margin: '0 0 32px',
            letterSpacing: '-1px',
            background: 'linear-gradient(120deg, #ffffff 30%, #ffd6a8 60%, #FF6000 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent', color: 'transparent',
          }}>
            Animal League<br />Hackathon 2026
          </h1>
          <button
            onClick={scrollToSelect}
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

        {/* 스크롤 힌트 */}
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          animation: 'scroll-bounce 1.8s ease-in-out infinite',
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 2 }}>SCROLL</span>
          <div style={{
            width: 1, height: 28,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)',
          }} />
        </div>
      </section>

      {/* ── 학교 선택 섹션 ── */}
      <section ref={selectRef} style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto', padding: '120px 24px 240px' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#f0f0f0', marginBottom: 8, textAlign: 'center' }}>
          학교를 선택해주세요.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20, marginBottom: 80, textAlign: 'center' }}>
          학교별로 단 하나의 캐릭터가 배정됩니다.
        </p>
        {universities.length === 0 ? (
          <div className="flex items-center justify-center" style={{ paddingTop: 60 }}>
            <div style={{ width: 32, height: 32, border: '4px solid rgba(255,96,0,0.2)', borderTop: '4px solid #FF6000', borderRadius: '50%' }} className="animate-spin" />
          </div>
        ) : (
          <UniversitySelect universities={universities} onSelect={handleUniversitySelect} />
        )}
        </div>
      </section>

    </main>
  );
}
