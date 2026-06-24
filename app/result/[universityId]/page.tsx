'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ResultCard from '@/components/ResultCard';
import CornerGlow from '@/components/CornerGlow';

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
  const [error, setError] = useState('');

  useEffect(() => {
    if (universityId) loadResult();
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
    if (!result?.characterImageUrl || isSharing) return;
    setIsSharing(true);
    try {
      const blob = await fetchBlob();
      const file = new File([blob], `${result.characterName ?? 'character'}.png`, { type: blob.type });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `${result.universityName} 캐릭터` });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSharing(false);
    }
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
        .result-inner { width: 100%; maxWidth: 480px; margin: 0 auto; display: flex; flex-direction: column; padding: 20px 16px 80px; position: relative; z-index: 1; }
        .result-back { color: rgba(255,255,255,0.3); font-size: 14px; font-weight: 500; margin-bottom: 28px; background: none; border: none; cursor: pointer; text-align: left; letter-spacing: 0.03em; }
        .result-back:hover { color: rgba(255,255,255,0.7); }
        .result-pill-row { display: flex; justify-content: center; margin-bottom: 20px; }
        .result-pill { display: inline-flex; align-items: center; gap: 10px; padding: 8px 16px; border-radius: 99px; border: 1px solid rgba(255,96,0,0.35); background: linear-gradient(180deg, rgba(255,96,0,0) 30%, rgba(255,96,0,0.12) 100%); }
        .result-title { font-size: 24px; font-weight: 800; color: #fff; text-align: center; margin: 0 0 24px; letter-spacing: 0.02em; line-height: 1.3; text-shadow: 0px 2px 8px rgba(214,81,0,0.3); }
        .result-buttons { display: flex; gap: 10px; width: 100%; max-width: 320px; margin: 24px auto 0; }
        .result-time { font-size: 13px; color: rgba(255,255,255,0.45); text-align: center; margin-top: 32px; }
        @media (min-width: 769px) {
          .result-inner { max-width: 1232px; padding: 28px 40px 60px; }
          .result-title { font-size: 36px; margin-bottom: 32px; }
          .result-buttons { max-width: 400px; }
          .result-time { font-size: 13px; margin-top: 20px; }
        }
      `}</style>
      <div className="result-inner">
        <button onClick={() => router.push('/')} className="result-back">
          ‹ 돌아가기
        </button>

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
              flex: 1, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)', color: '#fff',
              fontWeight: 700, fontSize: 15, padding: '15px 0', borderRadius: 16,
              cursor: isSharing ? 'wait' : 'pointer', opacity: isSharing ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            공유하기
          </button>
          <button
            onClick={handleDownload}
            disabled={isSharing}
            style={{
              flex: 1, background: '#FF6000', border: 'none', color: '#fff',
              fontWeight: 700, fontSize: 15, padding: '15px 0', borderRadius: 16,
              cursor: isSharing ? 'wait' : 'pointer', opacity: isSharing ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            다운로드
          </button>
        </div>

        {result?.assignedAt && (
          <p className="result-time">
            {new Date(result.assignedAt).toLocaleString('ko-KR')} 배정
          </p>
        )}
        {result && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: 8 }}>
            이 캐릭터는 이제 {result.universityName}에만 배정됩니다.
          </p>
        )}
      </div>
    </main>
  );
}
