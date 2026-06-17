'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { University } from '@/lib/types';
import UniversitySelect from '@/components/UniversitySelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import CodeInput from '@/components/CodeInput';
import CardCarousel from '@/components/CardCarousel';

type Step = 'select' | 'enterCode' | 'pickCapsule';

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
    setStep('select');
  };

  // 코드 입력
  if (step === 'enterCode' && selectedUniversity) {
    return (
      <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
        {isLoading && <LoadingOverlay />}
        <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto', padding: '32px 24px', minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <button onClick={() => { setStep('select'); setCodeError(''); }} style={{ position: 'absolute', top: 32, left: 24, color: 'rgba(255,255,255,0.35)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', zIndex: 5 }}>
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

  // 카드 뽑기
  if (step === 'pickCapsule' && selectedUniversity) {
    return (
      <main className="min-h-screen flex flex-col items-center" style={{ background: 'var(--bg)' }}>
        {isLoading && <LoadingOverlay message="캐릭터를 배정하는 중..." />}
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

  // 학교 선택
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
      <style>{`
        .univ-section-inner { padding: 80px 24px 120px; }
        .univ-title { font-size: 36px; }
        .univ-subtitle { font-size: 20px; margin-bottom: 80px; }
        @media (max-width: 768px) {
          .univ-section-inner { padding: 60px 16px 100px !important; }
          .univ-title { font-size: 24px !important; }
          .univ-subtitle { font-size: 15px !important; margin-bottom: 40px !important; }
        }
      `}</style>

      <div className="univ-section-inner" style={{ width: '100%', maxWidth: 1280, margin: '0 auto' }}>
        <button
          onClick={() => router.push('/')}
          style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 40, display: 'block' }}
        >
          ← 돌아가기
        </button>
        <h2 className="univ-title" style={{ fontWeight: 800, color: '#f0f0f0', marginBottom: 8, textAlign: 'center' }}>
          학교를 선택해주세요.
        </h2>
        <p className="univ-subtitle" style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
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
    </main>
  );
}
