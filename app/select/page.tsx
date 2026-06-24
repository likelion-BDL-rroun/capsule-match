'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { University } from '@/lib/types';
import UniversitySelect from '@/components/UniversitySelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import CodeInput from '@/components/CodeInput';
import TicketIntro from '@/components/TicketIntro';
import CardCarousel from '@/components/CardCarousel';

type Step = 'select' | 'ticketIntro' | 'enterCode' | 'pickCapsule';

export default function SelectPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('select');
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');

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

  const handleUniversitySelect = (uni: University) => {
    setSelectedUniversity(uni);
    if (uni.assigned_character_id) { router.push(`/result/${uni.id}`); return; }
    setCodeError('');
    setStep('ticketIntro');
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
    setStep('select');
  };

  // 티켓 확인 인트로
  if (step === 'ticketIntro' && selectedUniversity) {
    return (
      <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
        <TicketIntro
          universityName={selectedUniversity.name}
          onContinue={() => setStep('enterCode')}
          onBack={() => setStep('select')}
        />
      </main>
    );
  }

  // 코드 입력
  if (step === 'enterCode' && selectedUniversity) {
    return (
      <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
        {isLoading && <LoadingOverlay />}
        <CodeInput
          universityName={selectedUniversity.name}
          onSubmit={handleCodeSubmit}
          isLoading={isLoading}
          error={codeError}
          onBack={() => { setStep('ticketIntro'); setCodeError(''); }}
        />
      </main>
    );
  }

  // 카드 뽑기
  if (step === 'pickCapsule' && selectedUniversity) {
    return (
      <main className="min-h-screen flex flex-col items-center pick-noscroll" style={{ background: 'var(--bg)', overflowX: 'hidden' }}>
        <style>{`.pick-noscroll { overflow: hidden; height: 100dvh; } @media (min-width: 769px) { .pick-noscroll { overflow: unset; height: auto; min-height: 100vh; } }`}</style>
        {isLoading && <LoadingOverlay message="캐릭터를 배정하는 중..." />}
        <div className="pick-header" style={{
          width: '100%', textAlign: 'center',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'rgba(14,14,14,0.4)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          {/* 학교명 pill — 코드 입력 페이지와 동일 */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '8px 16px', borderRadius: 99,
              border: '1px solid rgba(255,96,0,0.35)',
              background: 'linear-gradient(180deg, rgba(255,96,0,0) 30%, rgba(255,96,0,0.12) 100%)',
            }}>
              <span style={{ fontSize: 14, color: '#fff', letterSpacing: '0.02em', fontWeight: 700 }}>
                {selectedUniversity.name}
              </span>
            </div>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '0 0 14px',
            letterSpacing: '0.02em', lineHeight: 1.5,
            textShadow: '0px 2px 8px rgba(214,81,0,0.3)' }}>
            두근두근, 어떤 파트너를 만날까요?<br />마음에 드는 카드를 골라보세요
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0,
            lineHeight: 1.6, letterSpacing: '0.02em' }}>
            <span className="hint-mo">‹ › 버튼으로 넘기고, 원하는 카드를 선택하세요</span>
          </p>
        </div>
        <style>{`
          .carousel-wrap { width: 100%; align-self: stretch; }
          .hint-mo { display: none; }
          .pick-header { padding: 40px 40px 24px; }
          @media (max-width: 768px) {
            .hint-pc { display: none; }
            .hint-mo { display: inline; }
            .pick-header { padding: 20px 16px 16px; }
          }
          @media (max-width: 768px) {
            .carousel-wrap {
              transform: scale(0.78);
              transform-origin: top center;
              margin-bottom: calc(620px * -0.22);
            }
          }
        `}</style>
        <div className="carousel-wrap">
          <CardCarousel onComplete={handleCapsulePick} isLoading={isLoading} />
        </div>
      </main>
    );
  }

  // 학교 선택
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
      <style>{`
        .univ-section-inner { padding: 20px 16px 120px; }
        .univ-back { color: rgba(255,255,255,0.3); font-size: 14px; font-weight: 500; letter-spacing: 0.03em; background: none; border: none; cursor: pointer; display: block; transition: color 0.15s; }
        .univ-back:hover { color: rgba(255,255,255,0.7); }
        .univ-title { font-size: 24px; font-weight: 800; color: #fff; text-align: center; margin: 36px 0 14px; }
        .univ-subtitle { font-size: 13px; color: rgba(255,255,255,0.55); text-align: center; line-height: 1.6; margin: 0 0 40px; }
        @media (min-width: 769px) {
          .univ-section-inner { padding: 28px 40px 120px; }
          .univ-title { font-size: 36px; }
          .univ-subtitle { font-size: 18px; margin-bottom: 80px; }
        }
      `}</style>

      <div className="univ-section-inner" style={{ width: '100%', maxWidth: 1232, margin: '0 auto' }}>
        <button className="univ-back" onClick={() => router.push('/')}>
          ‹ 돌아가기
        </button>
        <h2 className="univ-title">
        안녕하세요!
        <br />
        학교를 확인하고 골라주세요
        </h2>
        <p className="univ-subtitle">
        학교별 캐릭터 카드는 한 번만 매칭할 수 있어요
        </p>
        {universities.length === 0 ? (
          <div className="flex items-center justify-center" style={{ paddingTop: 60 }}>
            <div style={{ width: 32, height: 32, border: '4px solid rgba(255,96,0,0.2)', borderTop: '4px solid #FF6000', borderRadius: '50%' }} className="animate-spin" />
          </div>
        ) : (
          <UniversitySelect universities={universities} onSelect={handleUniversitySelect} />
        )}
      </div>
    </main>
  );
}
