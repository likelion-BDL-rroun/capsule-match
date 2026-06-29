'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import LoadingOverlay from '@/components/LoadingOverlay';
import CodeInput from '@/components/CodeInput';
import TicketIntro from '@/components/TicketIntro';
import CardCarousel from '@/components/CardCarousel';

// 시연용 플로우 — DB 쓰기 없음, 결과 고정(/test-page/result)
const DEMO_UNI_NAME = '멋쟁이사자처럼대학교';

type Step = 'loading' | 'ticketIntro' | 'enterCode' | 'pickCard';

export default function TestSelectPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('loading');
  const [uniName, setUniName] = useState(DEMO_UNI_NAME);
  const [isLoading, setIsLoading] = useState(false);
  const resolved = useRef(false);

  // 메인(테스트) 페이지에서 ?u= 로 진입 → 학교 이름만 조회 후 데모 플로우 시작
  useEffect(() => {
    if (resolved.current) return;
    resolved.current = true;
    const uid = new URLSearchParams(window.location.search).get('u');
    if (!uid) { router.replace('/test-page'); return; }
    supabase
      .from('universities')
      .select('name')
      .eq('id', uid)
      .single()
      .then(({ data }) => {
        if (data?.name) setUniName(data.name);
        setStep('ticketIntro');
      });
  }, [router]);

  useEffect(() => {
    if (step === 'pickCard') window.scrollTo(0, 0);
  }, [step]);

  // 코드 입력: 아무 값이나 통과
  const handleCodeSubmit = async (code: string) => {
    if (!code.trim()) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setIsLoading(false);
    setStep('pickCard');
  };

  // 카드 선택: 결과 페이지로 이동 (DB 호출 없음). 선택한 학교 이름을 함께 전달
  const handleCardPick = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
    // 플로우를 직접 거친 사람 표시 (공유 링크 진입 시 없음)
    sessionStorage.setItem('test_result_from_flow', '1');
    router.push(`/test-page/result?uni=${encodeURIComponent(uniName)}`);
  };

  if (step === 'ticketIntro') {
    return (
      <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
        <TicketIntro
          universityName={uniName}
          onContinue={() => setStep('enterCode')}
          onBack={() => router.push('/test-page')}
        />
      </main>
    );
  }

  if (step === 'enterCode') {
    return (
      <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
        {isLoading && <LoadingOverlay />}
        <CodeInput
          universityName={uniName}
          onSubmit={handleCodeSubmit}
          isLoading={isLoading}
          error=""
          onBack={() => setStep('ticketIntro')}
        />
      </main>
    );
  }

  if (step === 'pickCard') {
    return (
      <main className="min-h-screen flex flex-col items-center pick-noscroll" style={{ background: 'var(--bg)', overflowX: 'hidden' }}>
        <style>{`
          .pick-noscroll { overflow: hidden; height: 100dvh; }
          @media (min-width: 769px) { .pick-noscroll { overflow: unset; height: auto; min-height: 100vh; } }
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
            .carousel-wrap { transform: scale(0.78); transform-origin: top center; margin-bottom: calc(620px * -0.22); }
          }
        `}</style>
        {isLoading && <LoadingOverlay message="캐릭터를 배정하는 중..." />}
        <div className="pick-header" style={{
          width: '100%', textAlign: 'center',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'rgba(14,14,14,0.4)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '8px 16px', borderRadius: 99,
              border: '1px solid rgba(255,96,0,0.35)',
              background: 'linear-gradient(180deg, rgba(255,96,0,0) 30%, rgba(255,96,0,0.12) 100%)',
            }}>
              <span style={{ fontSize: 14, color: '#fff', letterSpacing: '0.02em', fontWeight: 700 }}>
                {uniName}
              </span>
            </div>
          </div>
          <h2 className="pick-title" style={{ fontWeight: 800, color: '#fff', margin: '0 0 14px', letterSpacing: '0.02em', lineHeight: 1.5, textShadow: '0px 2px 8px rgba(214,81,0,0.3)' }}>
            어떤 파트너를 만날까요?<br />마음에 드는 카드를 골라보세요
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6, letterSpacing: '0.02em' }}>
            <span className="hint-mo">‹ › 버튼으로 넘기고, 원하는 카드를 선택하세요</span>
            <span className="hint-pc">원하는 파트너 카드를 골라서 클릭해보세요</span>
          </p>
        </div>
        <div className="carousel-wrap">
          <CardCarousel onComplete={handleCardPick} isLoading={isLoading} />
        </div>
      </main>
    );
  }

  // 로딩 (학교 이름 조회 중)
  return (
    <main className="flex items-center justify-center" style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
      <div style={{ width: 32, height: 32, border: '4px solid rgba(255,96,0,0.2)', borderTop: '4px solid #FF6000', borderRadius: '50%' }} className="animate-spin" />
    </main>
  );
}
