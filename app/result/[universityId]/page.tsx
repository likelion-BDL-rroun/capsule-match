'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ResultCard from '@/components/ResultCard';

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
  const [error, setError] = useState('');

  useEffect(() => {
    if (universityId) loadResult();
  }, [universityId]);

  const loadResult = async () => {
    setIsLoading(true);
    const { data, error: dbError } = await supabase
      .from('universities')
      .select(`
        name, assigned_at,
        characters:assigned_character_id ( name, image_url )
      `)
      .eq('id', universityId)
      .single();

    if (dbError || !data) {
      setError('결과를 불러올 수 없어요.');
      setIsLoading(false);
      return;
    }

    const character = (Array.isArray(data.characters) ? data.characters[0] : data.characters) as { name: string; image_url: string | null } | null;

    if (!character) {
      // 아직 배정 안 된 학교라면 홈으로 이동
      router.replace('/');
      return;
    }

    setResult({
      universityName: data.name,
      characterName: character.name,
      characterImageUrl: character.image_url,
      assignedAt: data.assigned_at ?? '',
    });
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-[#FF6000] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4">
        <p className="text-gray-500">{error}</p>
        <button onClick={() => router.push('/')} className="text-[#FF6000] font-semibold">
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col px-5 py-8">
      <button onClick={() => router.push('/')} className="text-gray-400 text-sm mb-8 self-start">
        ← 처음으로
      </button>

      <div className="mb-6 text-center">
        <p className="text-sm text-gray-400">
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

      <button
        onClick={() => router.push('/')}
        className="w-full max-w-sm mx-auto mt-6 bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl text-base active:scale-95 transition-all"
      >
        다른 학교 결과 보기
      </button>
    </main>
  );
}
