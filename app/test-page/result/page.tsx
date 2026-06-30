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
  const [isSharing, setIsSharing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const uni = new URLSearchParams(window.location.search).get('uni');
    if (uni) setUniversityName(uni);
    if (sessionStorage.getItem('test_result_from_flow') === '1') setShowBack(true);
  }, []);

  const handleDownload = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const res = await fetch(DEMO_CHARACTER_IMAGE);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${DEMO_CHARACTER_NAME}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSharing(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

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
            onClick={handleShare}
            disabled={isSharing}
            style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: 'rgba(255,255,255,0.12)',
              border: 'none', color: 'rgba(255,255,255,0.85)',
              fontWeight: 700, fontSize: 15, padding: '15px 0', borderRadius: 16,
              cursor: isSharing ? 'wait' : 'pointer', opacity: isSharing ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            공유하기
          </button>
          <button
            onClick={handleDownload}
            disabled={isSharing}
            style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: '#FF6000', border: 'none', color: '#fff',
              fontWeight: 700, fontSize: 15, padding: '15px 0', borderRadius: 16,
              cursor: isSharing ? 'wait' : 'pointer', opacity: isSharing ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            이미지 저장
          </button>
        </div>

        {linkCopied && (
          <div style={{
            position: 'fixed', left: '50%', bottom: 40, transform: 'translateX(-50%)',
            background: 'rgba(30,30,30,0.95)', color: '#fff',
            fontSize: 14, fontWeight: 600, letterSpacing: '0.01em',
            padding: '12px 20px', borderRadius: 99,
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 300, whiteSpace: 'nowrap', pointerEvents: 'none',
            animation: 'toast-in 0.2s ease both',
          }}>
            링크가 복사되었습니다!
          </div>
        )}
      </div>
    </main>
  );
}
