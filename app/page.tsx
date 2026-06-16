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
        <CornerGlow />
        <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }} className="flex flex-col">
          <button onClick={() => { setStep('intro'); setCodeError(''); }} style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 24, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            ← 뒤로
          </button>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f0', marginBottom: 24 }}>
            {selectedUniversity.name}<br />오픈 코드를 입력해주세요
          </h2>
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
      <main className="min-h-screen flex flex-col items-center px-5 py-10" style={{ background: 'var(--bg)' }}>
        {isLoading && <LoadingOverlay message="캐릭터를 배정하는 중..." />}
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f0', marginBottom: 4, textAlign: 'center' }}>
          {selectedUniversity.name}
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28, textAlign: 'center' }}>
          카드를 골라 캐릭터를 뽑아보세요!
        </p>
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

        {/* 배경 — 그리드 패턴 + 오렌지 글로우 */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle 800px at 100% 200px, rgba(255,96,0,0.35), transparent)',
            }}
          />
        </div>

        {/* 텍스트 + 버튼 */}
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,180,60,0.9)', fontWeight: 600, marginBottom: 12 }}>
            우리 학교 대표 캐릭터를 선택해주세요
          </p>
          <h1 style={{
            fontSize: 36, fontWeight: 900, color: '#fff',
            lineHeight: 1.15, margin: '0 0 32px',
            letterSpacing: '-0.5px',
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
              boxShadow: '0 0 28px rgba(255,96,0,0.45)',
            }}
          >
            학교 선택하기 →
          </button>
        </div>

        {/* 스크롤 힌트 */}
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 1 }}>SCROLL</span>
          <div style={{
            width: 1, height: 28,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
          }} />
        </div>
      </section>

      {/* ── 학교 선택 섹션 ── */}
      <section ref={selectRef} style={{ position: 'relative', overflow: 'hidden' }}>
        <CornerGlow />
        <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto', padding: '48px 24px 40px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f0', marginBottom: 6 }}>
          우리 학교를<br />선택해주세요.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24 }}>
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
