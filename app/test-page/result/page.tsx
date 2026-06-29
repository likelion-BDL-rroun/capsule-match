'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ResultCard from '@/components/ResultCard';
import CornerGlow from '@/components/CornerGlow';

// 시연용 결과 — char_00은 이 페이지에서만 사용
const DEMO_CHARACTER_NAME = '사자';
const DEMO_CHARACTER_IMAGE = '/char_00.png';

export default function TestResultPage() {
  const router = useRouter();
  // 선택했던 학교 이름을 쿼리(?uni=)에서 받음
  const [universityName, setUniversityName] = useState('');
  // 플로우를 직접 거쳐 들어온 경우에만 돌아가기 버튼 노출
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const uni = new URLSearchParams(window.location.search).get('uni');
    if (uni) setUniversityName(uni);
    if (sessionStorage.getItem('test_result_from_flow') === '1') setShowBack(true);
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <CornerGlow />
      <style>{`
        @keyframes toast-in { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .result-inner { width: 100%; margin: 0 auto; display: flex; flex-direction: column; padding: 64px 16px 80px; position: relative; z-index: 1; }
        .result-inner.has-back { padding-top: 20px; }
        .result-back { color: rgba(255,255,255,0.3); font-size: 14px; font-weight: 500; margin-bottom: 28px; background: none; border: none; cursor: pointer; text-align: left; letter-spacing: 0.03em; }
        .result-back:hover { color: rgba(255,255,255,0.7); }
        .result-pill-row { display: flex; justify-content: center; margin-bottom: 20px; }
        .result-pill { display: inline-flex; align-items: center; gap: 10px; padding: 8px 16px; border-radius: 99px; border: 1px solid rgba(255,96,0,0.35); background: linear-gradient(180deg, rgba(255,96,0,0) 30%, rgba(255,96,0,0.12) 100%); }
        .result-title { font-size: 28px; font-weight: 800; color: #fff; text-align: center; margin: 0 0 24px; letter-spacing: 0.02em; line-height: 1.3; text-shadow: 0px 2px 8px rgba(214,81,0,0.3); }
        .result-buttons { display: flex; gap: 10px; width: 100%; max-width: 320px; margin: 24px auto 0; }
        @media (min-width: 769px) {
          .result-inner { max-width: 1232px; padding: 72px 40px 60px; }
          .result-inner.has-back { padding-top: 28px; }
          .result-title { font-size: 36px; margin-bottom: 32px; }
          .result-buttons { max-width: 400px; }
        }
      `}</style>

      <div className={`result-inner${showBack ? ' has-back' : ''}`}>
        {showBack && (
          <button onClick={() => router.push('/test-page')} className="result-back">
            ‹ 돌아가기
          </button>
        )}
        <div className="result-pill-row">
          <div className="result-pill">
            <span style={{ fontSize: 14, color: '#fff', letterSpacing: '0.02em', fontWeight: 700 }}>
              {universityName}
            </span>
          </div>
        </div>

        <h2 className="result-title">운명의 파트너를 만났어요!</h2>

        <ResultCard
          universityName={universityName}
          characterName={DEMO_CHARACTER_NAME}
          characterImageUrl={DEMO_CHARACTER_IMAGE}
        />

        <div className="result-buttons">
          <button
            onClick={() => router.push('/test-page')}
            style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: 'rgba(255,255,255,0.12)',
              border: 'none', color: 'rgba(255,255,255,0.85)',
              fontWeight: 700, fontSize: 15, padding: '15px 0', borderRadius: 16,
              cursor: 'pointer',
            }}
          >
            다시 해보기
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: '#FF6000', border: 'none', color: '#fff',
              fontWeight: 700, fontSize: 15, padding: '15px 0', borderRadius: 16,
              cursor: 'pointer',
            }}
          >
            홈으로
          </button>
        </div>
      </div>
    </main>
  );
}
