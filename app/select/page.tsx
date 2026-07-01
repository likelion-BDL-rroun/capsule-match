'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { University } from '@/lib/types';
import LoadingOverlay from '@/components/LoadingOverlay';
import CodeInput from '@/components/CodeInput';
import TicketIntro from '@/components/TicketIntro';
import CardCarousel from '@/components/CardCarousel';
import { logEvent } from '@/lib/analytics';

type Step = 'select' | 'ticketIntro' | 'enterCode' | 'pickCard';

export default function SelectPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('select');
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');
  const deepLinked = useRef(false);

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    if (step === 'pickCard') window.scrollTo(0, 0);
  }, [step]);

  // 메인 페이지에서 학교 선택 후 ?u= 파라미터로 진입 시 자동 선택
  // 유효한 학교가 없으면 학교 리스트는 노출하지 않고 메인 페이지 하단 리스트로 보냄
  useEffect(() => {
    if (deepLinked.current || universities.length === 0) return;
    deepLinked.current = true;
    const uid = new URLSearchParams(window.location.search).get('u');
    const uni = uid ? universities.find((u) => u.id === uid) : null;
    if (uni) {
      handleUniversitySelect(uni);
    } else {
      router.replace('/');
    }
  }, [universities]);

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
    if (!data.success) { logEvent('code_fail', selectedUniversity.id); setCodeError(data.error); return; }
    logEvent('code_success', selectedUniversity.id);
    setVerifiedCode(code);
    setStep('pickCard');
  };

  const handleCardPick = async () => {
    if (!selectedUniversity || !verifiedCode) return;
    logEvent('card_clicked', selectedUniversity.id);
    setIsLoading(true);
    const res = await fetch('/api/assign-character', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ universityId: selectedUniversity.id, code: verifiedCode }),
    });
    const data = await res.json();
    setIsLoading(false);
    if (data.alreadyAssigned || data.success) {
      // 플로우를 직접 거친 사람 표시 — 공유 링크로 들어온 사람에겐 없음(돌아가기 버튼 노출 여부 판단용)
      sessionStorage.setItem('result_from_flow', selectedUniversity.id);
      router.push(`/result/${selectedUniversity.id}`);
      return;
    }
    alert(data.error ?? '오류가 발생했어요. 다시 시도해주세요.');
    router.push('/');
  };

  // 티켓 확인 인트로
  if (step === 'ticketIntro' && selectedUniversity) {
    return (
      <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
        <TicketIntro
          universityName={selectedUniversity.name}
          onContinue={() => setStep('enterCode')}
          onBack={() => router.push('/')}
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
  if (step === 'pickCard' && selectedUniversity) {
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
          <h2 className="pick-title" style={{ fontWeight: 800, color: '#fff', margin: '0 0 16px',
            letterSpacing: '0.02em', lineHeight: 1.5,
            textShadow: '0px 2px 8px rgba(214,81,0,0.3)' }}>
어떤 파트너를 만날까요?<br />마음에 드는 카드를 골라보세요
          </h2>
          {/* 서브타이틀 — PC 전용 */}
          <p className="pick-subtitle">원하는 파트너 카드를 골라서 클릭해보세요</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0,
            lineHeight: 1.6, letterSpacing: '0.02em' }}>
            <span className="hint-mo">‹ › 버튼으로 넘기고, 원하는 카드를 선택하세요</span>
          </p>
        </div>
        <style>{`
          .carousel-wrap { width: 100%; align-self: stretch; }
          .hint-mo { display: none; }
          .pick-header { padding: 40px 40px 24px; }
          .pick-title { font-size: 36px; }
          .pick-subtitle { font-size: 16px; color: rgba(255,255,255,0.55); margin: 0; letter-spacing: 0.02em; }
          @media (max-width: 768px) {
            .hint-pc { display: none; }
            .hint-mo { display: inline; }
            .pick-header { padding: 20px 16px 16px; }
            .pick-title { font-size: 26px; }
            .pick-subtitle { display: none; }
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
          <CardCarousel onComplete={handleCardPick} isLoading={isLoading} />
        </div>
      </main>
    );
  }

  // 학교 리스트 화면은 더 이상 노출하지 않음 — 딥링크 처리 전/리다이렉트 직전 로딩만 표시
  return (
    <main className="flex items-center justify-center" style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
      <div style={{ width: 32, height: 32, border: '4px solid rgba(255,96,0,0.2)', borderTop: '4px solid #FF6000', borderRadius: '50%' }} className="animate-spin" />
    </main>
  );
}
