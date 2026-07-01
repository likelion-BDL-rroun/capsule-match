'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ResultCard from '@/components/ResultCard';
import CornerGlow from '@/components/CornerGlow';
import { logEvent } from '@/lib/analytics';

type ResultData = {
  universityName: string;
  characterName: string;
  characterImageUrl: string | null;
  assignedAt: string;
};

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const universityId = params.universityId as string;
  const [result, setResult] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [error, setError] = useState('');
  // 플로우를 직접 거쳐 들어온 경우에만 돌아가기 버튼 노출 (공유 링크 진입 시 없음)
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if (universityId) loadResult();
  }, [universityId]);

  useEffect(() => {
    if (sessionStorage.getItem('result_from_flow') === universityId) setShowBack(true);
  }, [universityId]);

  const loadResult = async () => {
    setIsLoading(true);
    const { data, error: dbError } = await supabase
      .from('universities')
      .select(`name, assigned_at, characters:assigned_character_id ( name, image_url )`)
      .eq('id', universityId)
      .single();

    if (dbError || !data) { setError('결과를 불러오지 못했어요. 잠시 후 다시 시도해요.'); setIsLoading(false); return; }

    const character = (Array.isArray(data.characters) ? data.characters[0] : data.characters) as { name: string; image_url: string | null } | null;

    if (!character) { router.replace('/'); return; }

    setResult({
      universityName: data.name,
      characterName: character.name,
      characterImageUrl: character.image_url,
      assignedAt: data.assigned_at ?? '',
    });
    setIsLoading(false);

    // 캐릭터 공개 완료 — 플로우를 직접 끝낸 사람만 집계 (공유 링크 방문자 제외)
    if (sessionStorage.getItem('result_from_flow') === universityId) {
      logEvent('complete', universityId);
    }
  };

  const fetchBlob = async () => {
    const res = await fetch(result!.characterImageUrl!);
    return res.blob();
  };

  const handleDownload = async () => {
    if (!result?.characterImageUrl || isSharing) return;
    setIsSharing(true);
    try {
      const blob = await fetchBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.characterName ?? 'character'}.png`;
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
      // 클립보드 API가 막힌 환경 폴백
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

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ width: 40, height: 40, border: '4px solid rgba(255,96,0,0.2)', borderTop: '4px solid #FF6000', borderRadius: '50%' }} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: 16, background: 'var(--bg)' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>{error}</p>
        <button onClick={() => router.push('/')} style={{ color: '#FF6000', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>홈으로 돌아가기</button>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <CornerGlow />
      <style>{`
        @keyframes toast-in { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .result-inner { width: 100%; maxWidth: 480px; margin: 0 auto; display: flex; flex-direction: column; padding: 64px 16px 80px; position: relative; z-index: 1; }
        .result-inner.has-back { padding-top: 20px; }
        .result-back { color: rgba(255,255,255,0.3); font-size: 14px; font-weight: 500; margin-bottom: 28px; background: none; border: none; cursor: pointer; text-align: left; letter-spacing: 0.03em; }
        .result-back:hover { color: rgba(255,255,255,0.7); }
        .result-pill-row { display: flex; justify-content: center; margin-bottom: 20px; }
        .result-pill { display: inline-flex; align-items: center; gap: 10px; padding: 8px 16px; border-radius: 99px; border: 1px solid rgba(255,96,0,0.35); background: linear-gradient(180deg, rgba(255,96,0,0) 30%, rgba(255,96,0,0.12) 100%); }
        .result-title { font-size: 28px; font-weight: 800; color: #fff; text-align: center; margin: 0 0 24px; letter-spacing: 0.02em; line-height: 1.3; text-shadow: 0px 2px 8px rgba(214,81,0,0.3); }
        .result-buttons { display: flex; gap: 10px; width: 100%; max-width: 320px; margin: 24px auto 0; }
        .result-time { font-size: 13px; color: rgba(255,255,255,0.45); text-align: center; margin-top: 32px; }
        @media (min-width: 769px) {
          .result-inner { max-width: 1232px; padding: 72px 40px 60px; }
          .result-inner.has-back { padding-top: 28px; }
          .result-title { font-size: 36px; margin-bottom: 32px; }
          .result-buttons { max-width: 400px; }
          .result-time { font-size: 13px; margin-top: 20px; }
        }
      `}</style>
      <div className={`result-inner${showBack ? ' has-back' : ''}`}>
        {showBack && (
          <button onClick={() => router.push('/')} className="result-back">
            ‹ 돌아가기
          </button>
        )}
        <div className="result-pill-row">
          <div className="result-pill">
            <span style={{ fontSize: 14, color: '#fff', letterSpacing: '0.02em', fontWeight: 700 }}>{result?.universityName}</span>
          </div>
        </div>
        <h2 className="result-title">운명의 파트너를 만났어요!</h2>

        {result && (
          <ResultCard
            universityName={result.universityName}
            characterName={result.characterName}
            characterImageUrl={result.characterImageUrl}
          />
        )}

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
