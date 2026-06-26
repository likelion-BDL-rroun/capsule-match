'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingOverlay from '@/components/LoadingOverlay';
import CodeInput from '@/components/CodeInput';
import TicketIntro from '@/components/TicketIntro';
import CardCarousel from '@/components/CardCarousel';

// 시연용 페이지 — DB 쓰기 없음, 결과 고정
const DEMO_UNI_NAME = '멋쟁이사자처럼대학교';

type Step = 'ticketIntro' | 'enterCode' | 'pickCard';

export default function TestPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('ticketIntro');
  const [isLoading, setIsLoading] = useState(false);

  // 코드 입력: 아무 값이나 통과
  const handleCodeSubmit = async (code: string) => {
    if (!code.trim()) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600)); // 실제 검증처럼 약간 딜레이
    setIsLoading(false);
    setStep('pickCard');
  };

  // 카드 선택: 결과 페이지로 이동 (DB 호출 없음)
  const handleCardPick = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
    router.push('/test-page/result');
  };

  if (step === 'ticketIntro') {
    return (
      <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
        <TicketIntro
          universityName={DEMO_UNI_NAME}
          onContinue={() => setStep('enterCode')}
          onBack={() => router.push('/')}
        />
      </main>
    );
  }

  if (step === 'enterCode') {
    return (
      <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
        {isLoading && <LoadingOverlay />}
        <CodeInput
          universityName={DEMO_UNI_NAME}
          onSubmit={handleCodeSubmit}
          isLoading={isLoading}
          error=""
          onBack={() => setStep('ticketIntro')}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center pick-noscroll" style={{ background: 'var(--bg)', overflowX: 'hidden' }}>
      <style>{`
        .pick-noscroll { overflow: hidden; height: 100dvh; }
        @media (min-width: 769px) { .pick-noscroll { overflow: unset; height: auto; min-height: 100vh; } }
        .carousel-wrap { width: 100%; align-self: stretch; }
        .hint-mo { display: none; }
        .pick-header { padding: 40px 40px 24px; }
        .pick-title { font-size: 36px; }
        @media (max-width: 768px) {
          .hint-mo { display: inline; }
          .pick-header { padding: 20px 16px 16px; }
          .pick-title { font-size: 28px; }
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
              {DEMO_UNI_NAME}
            </span>
          </div>
        </div>
        <h2 className="pick-title" style={{ fontWeight: 800, color: '#fff', margin: '0 0 14px', letterSpacing: '0.02em', lineHeight: 1.5, textShadow: '0px 2px 8px rgba(214,81,0,0.3)' }}>
          두근두근, 어떤 파트너를 만날까요?<br />마음에 드는 카드를 골라보세요
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6, letterSpacing: '0.02em' }}>
          <span className="hint-mo">‹ › 버튼으로 넘기고, 원하는 카드를 선택하세요</span>
        </p>
      </div>
      <div className="carousel-wrap">
        <CardCarousel onComplete={handleCardPick} isLoading={isLoading} />
      </div>
    </main>
  );
}
