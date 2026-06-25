'use client';

import { useRouter } from 'next/navigation';

export default function AdminHubPage() {
  const router = useRouter();

  const cards = [
    {
      key: 'live',
      title: '실시간 배정 현황',
      desc: '학교별 배정 상황을 실시간으로 봐요',
      href: '/admin/live',
    },
    {
      key: 'manage',
      title: '매칭 관리',
      desc: '배정 현황 확인 및 초기화를 해요',
      href: '/admin/manage',
    },
  ];

  return (
    <main style={{ minHeight: '100dvh', background: '#0e0e0e', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .hub-wrap { width: 100%; max-width: 760px; margin: 0 auto; padding: 64px 20px 40px; flex: 1; display: flex; flex-direction: column; }
        .hub-title { font-size: 26px; font-weight: 800; margin: 0 0 6px; letter-spacing: 0.02em; }
        .hub-sub { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0 0 36px; }
        .hub-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 700px) { .hub-grid { grid-template-columns: 1fr 1fr; } }
        .hub-card { text-align: left; cursor: pointer; padding: 28px 24px; border-radius: 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.1); transition: border-color 0.15s, transform 0.08s, background 0.15s; }
        .hub-card:hover { border-color: rgba(255,96,0,0.6); background: rgba(255,96,0,0.08); }
        .hub-card:active { transform: scale(0.99); }
        .hub-card h2 { font-size: 19px; font-weight: 800; margin: 0 0 8px; color: #fff; }
        .hub-card p { font-size: 13.5px; color: rgba(255,255,255,0.55); margin: 0; line-height: 1.5; }
        .hub-card .hub-arrow { color: #FF6000; font-weight: 800; font-size: 15px; margin-top: 16px; display: inline-block; }
        .hub-logout { margin-top: auto; align-self: flex-start; color: rgba(255,255,255,0.35); font-size: 13px; font-weight: 500;
          background: none; border: none; cursor: pointer; padding: 8px 0; transition: color 0.15s; }
        .hub-logout:hover { color: rgba(255,255,255,0.7); }
      `}</style>

      <div className="hub-wrap">
        <h1 className="hub-title">관리자 메뉴</h1>
        <p className="hub-sub">이동할 페이지를 선택해요</p>

        <div className="hub-grid">
          {cards.map((c) => (
            <button key={c.key} className="hub-card" onClick={() => router.push(c.href)}>
              <h2>{c.title}</h2>
              <p>{c.desc}</p>
              <span className="hub-arrow">들어가기 ›</span>
            </button>
          ))}
        </div>

        <button
          className="hub-logout"
          onClick={async () => {
            await fetch('/api/admin/auth', { method: 'DELETE' });
            router.push('/admin/login');
          }}
        >
          로그아웃
        </button>
      </div>
    </main>
  );
}
