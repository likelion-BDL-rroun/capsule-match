'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

type Row = {
  id: string;
  name: string;
  assigned_character_id: string | null;
  assigned_at: string | null;
  characters: { id: string; name: string; image_url: string | null } | null;
};

export default function LivePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [flash, setFlash] = useState<Record<string, number>>({});
  const prevAssigned = useRef<Record<string, boolean>>({});

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('universities')
      .select('id, name, assigned_character_id, assigned_at, characters:assigned_character_id ( id, name, image_url )')
      .order('name');
    const next = (data as Row[] | null) ?? [];

    // 새로 배정된 학교 감지 → 잠깐 하이라이트
    const newlyAssigned: Record<string, number> = {};
    for (const r of next) {
      const isAssigned = !!r.assigned_character_id;
      if (isAssigned && prevAssigned.current[r.id] === false) {
        newlyAssigned[r.id] = Date.now();
      }
      prevAssigned.current[r.id] = isAssigned;
    }
    if (Object.keys(newlyAssigned).length) {
      setFlash((f) => ({ ...f, ...newlyAssigned }));
    }
    setRows(next);
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel('live-assignments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'universities' }, () => load())
      .subscribe();
    const timer = setInterval(load, 3000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [load]);

  const assignedCount = rows.filter((r) => r.assigned_character_id).length;
  const total = rows.length;

  // 학교 선택 페이지와 동일하게 이름 가나다순 고정 정렬
  const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  return (
    <main style={{ minHeight: '100dvh', background: '#0e0e0e', color: '#fff' }}>
      <style>{`
        .live-wrap { max-width: 1232px; margin: 0 auto; padding: 20px 16px 28px; }
        .live-head { display: flex; align-items: baseline; gap: 14px; margin-bottom: 16px; flex-wrap: wrap; }
        .live-title { font-size: 22px; font-weight: 800; letter-spacing: 0.02em; margin: 0; }
        .live-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #2bd575; margin-right: 8px; vertical-align: middle; animation: live-pulse 1.4s ease-in-out infinite; }
        .live-stat { font-size: 14px; color: rgba(255,255,255,0.55); margin: 0; }
        .live-stat b { color: #FF6000; font-weight: 800; font-size: 16px; }

        .live-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        @media (min-width: 600px)  { .live-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 900px)  { .live-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (min-width: 1200px) { .live-grid { grid-template-columns: repeat(5, 1fr); gap: 7px; } }

        .live-cell { display: flex; align-items: center; gap: 9px; padding: 7px 10px; border-radius: 10px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); min-width: 0; transition: background 0.3s, border-color 0.3s; }
        .live-cell.assigned { background: rgba(255,96,0,0.09); border-color: rgba(255,96,0,0.28); }
        .live-cell.flash { animation: live-flash 1.6s ease; }
        .live-thumb { width: 30px; height: 44px; border-radius: 5px; object-fit: cover; flex: 0 0 auto; background: rgba(255,255,255,0.06); }
        .live-thumb-empty { width: 30px; height: 44px; border-radius: 5px; flex: 0 0 auto; background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.22); font-size: 14px; }
        .live-info { min-width: 0; flex: 1; }
        .live-univ { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .live-char { font-size: 12px; color: #FF8a3d; font-weight: 700; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .live-wait { font-size: 12px; color: rgba(255,255,255,0.32); margin-top: 1px; }

        @keyframes live-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes live-flash { 0% { background: rgba(255,96,0,0.45); } 100% { background: rgba(255,96,0,0.09); } }
      `}</style>

      <div className="live-wrap">
        <div className="live-head">
          <h1 className="live-title"><span className="live-dot" />실시간 배정 현황</h1>
          <p className="live-stat"><b>{assignedCount}</b> / {total}개 학교 배정 완료</p>
        </div>

        {!loaded ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px 0' }}>불러오는 중…</p>
        ) : (
          <div className="live-grid">
            {sorted.map((r) => {
              const isAssigned = !!r.assigned_character_id;
              const isFlash = flash[r.id] && Date.now() - flash[r.id] < 1700;
              return (
                <div key={r.id} className={`live-cell${isAssigned ? ' assigned' : ''}${isFlash ? ' flash' : ''}`}>
                  {isAssigned && r.characters?.image_url ? (
                    <Image src={r.characters.image_url} alt={r.characters.name} width={30} height={44} className="live-thumb" unoptimized />
                  ) : (
                    <div className="live-thumb-empty">·</div>
                  )}
                  <div className="live-info">
                    <div className="live-univ">{r.name}</div>
                    {isAssigned ? (
                      <div className="live-char">{r.characters?.name ?? '배정됨'}</div>
                    ) : (
                      <div className="live-wait">대기 중</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
