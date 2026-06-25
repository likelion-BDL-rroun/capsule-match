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

    // 1) Supabase Realtime — 변경 즉시 반영
    const channel = supabase
      .channel('live-assignments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'universities' }, () => load())
      .subscribe();

    // 2) 폴링 폴백 — Realtime 미설정 환경에서도 동작 (3초)
    const timer = setInterval(load, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [load]);

  const assignedRows = rows.filter((r) => r.assigned_character_id);
  const assignedCount = assignedRows.length;
  const total = rows.length;

  // 배정된 학교를 최신순(assigned_at desc)으로, 미배정은 이름순으로 뒤에
  const sorted = [...rows].sort((a, b) => {
    const aa = !!a.assigned_character_id, bb = !!b.assigned_character_id;
    if (aa && bb) return (b.assigned_at ?? '').localeCompare(a.assigned_at ?? '');
    if (aa) return -1;
    if (bb) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <main style={{ minHeight: '100dvh', background: '#0e0e0e', color: '#fff' }}>
      <style>{`
        .live-wrap { max-width: 720px; margin: 0 auto; padding: 28px 16px 80px; }
        .live-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
        .live-title { font-size: 22px; font-weight: 800; letter-spacing: 0.02em; margin: 0; }
        .live-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #2bd575; margin-right: 7px; vertical-align: middle; animation: live-pulse 1.4s ease-in-out infinite; }
        .live-stat { font-size: 13px; color: rgba(255,255,255,0.55); margin: 0 0 20px; }
        .live-stat b { color: #FF6000; font-weight: 800; font-size: 15px; }
        .live-list { display: flex; flex-direction: column; gap: 8px; }
        .live-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); transition: background 0.3s; }
        .live-row.assigned { background: rgba(255,96,0,0.08); border-color: rgba(255,96,0,0.25); }
        .live-row.flash { animation: live-flash 1.6s ease; }
        .live-thumb { width: 40px; height: 60px; border-radius: 7px; object-fit: cover; flex: 0 0 auto; background: rgba(255,255,255,0.06); }
        .live-thumb-empty { width: 40px; height: 60px; border-radius: 7px; flex: 0 0 auto; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.25); font-size: 18px; }
        .live-univ { font-size: 15px; font-weight: 700; }
        .live-char { font-size: 13px; color: #FF8a3d; font-weight: 700; margin-top: 2px; }
        .live-wait { font-size: 13px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        @keyframes live-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes live-flash { 0% { background: rgba(255,96,0,0.45); } 100% { background: rgba(255,96,0,0.08); } }
      `}</style>

      <div className="live-wrap">
        <div className="live-head">
          <h1 className="live-title"><span className="live-dot" />실시간 배정 현황</h1>
        </div>
        <p className="live-stat">
          <b>{assignedCount}</b> / {total}개 학교 배정 완료
        </p>

        {!loaded ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px 0' }}>불러오는 중…</p>
        ) : (
          <div className="live-list">
            {sorted.map((r) => {
              const isAssigned = !!r.assigned_character_id;
              const isFlash = flash[r.id] && Date.now() - flash[r.id] < 1700;
              return (
                <div key={r.id} className={`live-row${isAssigned ? ' assigned' : ''}${isFlash ? ' flash' : ''}`}>
                  {isAssigned && r.characters?.image_url ? (
                    <Image src={r.characters.image_url} alt={r.characters.name} width={40} height={60} className="live-thumb" unoptimized />
                  ) : (
                    <div className="live-thumb-empty">·</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
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
