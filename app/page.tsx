'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { University } from '@/lib/types';
import UniversitySelect from '@/components/UniversitySelect';
import CodeInput from '@/components/CodeInput';
import CapsulePicker from '@/components/CapsulePicker';
import LoadingOverlay from '@/components/LoadingOverlay';

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
    if (step === 'selectUniversity') {
      loadUniversities();
    }
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
    if (uni.assigned_character_id) {
      router.push(`/result/${uni.id}`);
      return;
    }
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

    if (data.alreadyAssigned) {
      router.push(`/result/${selectedUniversity.id}`);
      return;
    }
    if (!data.success) {
      setCodeError(data.error);
      return;
    }
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

    if (data.alreadyAssigned || data.success) {
      router.push(`/result/${selectedUniversity.id}`);
      return;
    }
    alert(data.error ?? '오류가 발생했어요. 다시 시도해주세요.');
    setStep('selectUniversity');
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {isLoading && step !== 'pickCapsule' && <LoadingOverlay />}

      {step === 'intro' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center min-h-screen">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2 mb-6">
              <span className="text-[#FF6000] text-sm font-medium">🎴 캐릭터 캡슐 뽑기</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-3">
              80개 대학,<br />80종 캐릭터
            </h1>
            <p className="text-gray-500 text-base leading-relaxed">
              우리 학교의 캐릭터를<br />직접 뽑아보세요.
            </p>
          </div>

          <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center text-6xl mb-10 shadow-inner">
            🎁
          </div>

          <button
            onClick={() => setStep('selectUniversity')}
            className="w-full max-w-xs bg-[#FF6000] text-white font-bold py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-all"
          >
            시작하기
          </button>
        </div>
      )}

      {step === 'selectUniversity' && (
        <div className="flex-1 flex flex-col px-5 py-8 min-h-screen">
          <button onClick={() => setStep('intro')} className="text-gray-400 text-sm mb-6 self-start">
            ← 뒤로
          </button>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">우리 학교를<br />선택해주세요.</h2>
          <p className="text-gray-500 text-sm mb-6">학교별로 단 하나의 캐릭터가 배정됩니다.</p>
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-orange-200 border-t-[#FF6000] rounded-full animate-spin" />
            </div>
          ) : (
            <UniversitySelect universities={universities} onSelect={handleUniversitySelect} />
          )}
        </div>
      )}

      {step === 'enterCode' && selectedUniversity && (
        <div className="flex-1 flex flex-col px-5 py-8 min-h-screen">
          <button
            onClick={() => { setStep('selectUniversity'); setCodeError(''); }}
            className="text-gray-400 text-sm mb-6 self-start"
          >
            ← 뒤로
          </button>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
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

      {step === 'pickCapsule' && selectedUniversity && (
        <div className="flex-1 flex flex-col px-5 py-8 min-h-screen">
          {isLoading && <LoadingOverlay message="캐릭터를 배정하는 중..." />}
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
            {selectedUniversity.name}<br />캐릭터 캡슐을 선택해주세요.
          </h2>
          <div className="mt-8">
            <CapsulePicker
              universityName={selectedUniversity.name}
              onPick={handleCapsulePick}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </main>
  );
}
