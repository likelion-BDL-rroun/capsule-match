'use client';

import { useRouter } from 'next/navigation';
import ResultCard from '@/components/ResultCard';
import CornerGlow from '@/components/CornerGlow';

// 시연용 고정 결과 — char_00은 이 페이지에서만 사용
const DEMO_RESULT = {
  universityName: '멋쟁이사자처럼대학교',
  characterName: '라이언',
  characterImageUrl: '/char_00.png',
};

export default function TestResultPage() {
  const router = useRouter();

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <CornerGlow />
      <style>{`
        @keyframes toast-in { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .result-inner { width: 100%; margin: 0 auto; display: flex; flex-direction: column; padding: 20px 16px 80px; position: relative; z-index: 1; }
        .result-back { color: rgba(255,255,255,0.3); font-size: 14px; font-weight: 500; margin-bottom: 28px; background: none; border: none; cursor: pointer; text-align: left; letter-spacing: 0.03em; }
        .result-back:hover { color: rgba(255,255,255,0.7); }
        .result-pill-row { display: flex; justify-content: center; margin-bottom: 20px; }
        .result-pill { display: inline-flex; align-items: center; gap: 10px; padding: 8px 16px; border-radius: 99px; border: 1px solid rgba(255,96,0,0.35); background: linear-gradient(180deg, rgba(255,96,0,0) 30%, rgba(255,96,0,0.12) 100%); }
        .result-title { font-size: 28px; font-weight: 800; color: #fff; text-align: center; margin: 0 0 24px; letter-spacing: 0.02em; line-height: 1.3; text-shadow: 0px 2px 8px rgba(214,81,0,0.3); }
        .result-buttons { display: flex; gap: 10px; width: 100%; max-width: 320px; margin: 24px auto 0; }
        .demo-badge { display: inline-block; padding: 4px 12px; border-radius: 99px; background: rgba(255,96,0,0.15); border: 1px solid rgba(255,96,0,0.3); color: #FF6000; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; margin: 0 auto 20px; }
        @media (min-width: 769px) {
          .result-inner { max-width: 1232px; padding: 28px 40px 60px; }
          .result-title { font-size: 36px; margin-bottom: 32px; }
          .result-buttons { max-width: 400px; }
        }
      `}</style>

      <div className="result-inner">
        <button onClick={() => router.push('/test-page')} className="result-back">
          ‹ 돌아가기
        </button>

        <div style={{ textAlign: 'center' }}>
          <span className="demo-badge">DEMO</span>
        </div>

        <div className="result-pill-row">
          <div className="result-pill">
            <span style={{ fontSize: 14, color: '#fff', letterSpacing: '0.02em', fontWeight: 700 }}>
              {DEMO_RESULT.universityName}
            </span>
          </div>
        </div>

        <h2 className="result-title">운명의 파트너를 만났어요!</h2>

        <ResultCard
          universityName={DEMO_RESULT.universityName}
          characterName={DEMO_RESULT.characterName}
          characterImageUrl={DEMO_RESULT.characterImageUrl}
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
