'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { University } from '@/lib/types';
import UniversitySelect from '@/components/UniversitySelect';
import CodeInput from '@/components/CodeInput';
import LoadingOverlay from '@/components/LoadingOverlay';
import CardCarousel from '@/components/CardCarousel';
import CornerGlow from '@/components/CornerGlow';

type Step = 'intro' | 'selectUniversity' | 'enterCode' | 'pickCapsule';

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('intro');
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');

  useEffect(() => {
    if (step === 'selectUniversity') loadUniversities();
  }, [step]);

  const loadUniversities = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('universities')
      .select('id, name, assigned_character_id, assigned_at, created_at')
      .order('name');
    setUniversities((data as University[]) ?? []);
    setIsLoading(false);
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
    setStep('selectUniversity');
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {isLoading && step !== 'pickCapsule' && <LoadingOverlay />}

      {/* 인트로 */}
      {step === 'intro' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center min-h-screen relative overflow-hidden">
          <CornerGlow />
          <div className="relative mb-8">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,96,0,0.1)', border: '1px solid rgba(255,96,0,0.25)',
              borderRadius: 999, padding: '6px 16px', marginBottom: 20,
            }}>
              <span style={{ color: '#FF6000', fontSize: 13, fontWeight: 600 }}>🎴 캐릭터 카드 뽑기</span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#f0f0f0', lineHeight: 1.3, margin: '0 0 12px' }}>
              80개 대학,<br />80종 캐릭터
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              우리 학교의 캐릭터를<br />직접 뽑아보세요.
            </p>
          </div>

          <div style={{
            width: 120, height: 120,
            background: 'rgba(255,96,0,0.1)',
            border: '1px solid rgba(255,96,0,0.2)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 52, marginBottom: 40,
          }}>
            🎁
          </div>

          <button
            onClick={() => setStep('selectUniversity')}
            style={{
              width: '100%', maxWidth: 320,
              background: '#FF6000', color: '#fff',
              fontWeight: 700, fontSize: 17,
              padding: '16px 0', borderRadius: 18,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 0 32px rgba(255,96,0,0.4)',
            }}
          >
            시작하기
          </button>
        </div>
      )}

      {/* 학교 선택 */}
      {step === 'selectUniversity' && (
        <div className="flex-1 flex flex-col px-5 py-8 min-h-screen relative overflow-hidden">
          <CornerGlow />
          <button onClick={() => setStep('intro')} style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 24, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            ← 뒤로
          </button>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f0', marginBottom: 6 }}>우리 학교를<br />선택해주세요.</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24 }}>학교별로 단 하나의 캐릭터가 배정됩니다.</p>
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div style={{ width: 32, height: 32, border: '4px solid rgba(255,96,0,0.2)', borderTop: '4px solid #FF6000', borderRadius: '50%' }} className="animate-spin" />
            </div>
          ) : (
            <UniversitySelect universities={universities} onSelect={handleUniversitySelect} />
          )}
        </div>
      )}

      {/* 코드 입력 */}
      {step === 'enterCode' && selectedUniversity && (
        <div className="flex-1 flex flex-col px-5 py-8 min-h-screen relative overflow-hidden">
          <CornerGlow />
          <button onClick={() => { setStep('selectUniversity'); setCodeError(''); }} style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 24, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            ← 뒤로
          </button>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f0', marginBottom: 24 }}>
            {selectedUniversity.name}<br />캡슐 오픈 코드
          </h2>
          <CodeInput
            universityName={selectedUniversity.name}
            onSubmit={handleCodeSubmit}
            isLoading={isLoading}
            error={codeError}
          />
        </div>
      )}

      {/* 카드 뽑기 — glow 없음 */}
      {step === 'pickCapsule' && selectedUniversity && (
        <div className="flex-1 flex flex-col items-center px-5 py-10 min-h-screen">
          {isLoading && <LoadingOverlay message="캐릭터를 배정하는 중..." />}
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f0', marginBottom: 4, textAlign: 'center' }}>
            {selectedUniversity.name}
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28, textAlign: 'center' }}>
            카드를 골라 캐릭터를 뽑아보세요!
          </p>
          <CardCarousel onComplete={handleCapsulePick} isLoading={isLoading} />
        </div>
      )}
    </main>
  );
}
