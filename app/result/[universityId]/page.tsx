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

    if (dbError || !data) { setError('결과를 불러올 수 없어요.'); setIsLoading(false); return; }

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
      <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', padding: '32px 24px' }}>
      <CornerGlow />

      <button onClick={() => router.push('/')} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 28, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        ← 처음으로
      </button>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
          {result?.assignedAt && new Date(result.assignedAt).toLocaleString('ko-KR')} 배정
        </p>
      </div>

      {result && (
        <ResultCard
          universityName={result.universityName}
          characterName={result.characterName}
          characterImageUrl={result.characterImageUrl}
        />
      )}

      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 320, margin: '24px auto 0' }}>
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
      </div>
    </main>
  );
}
