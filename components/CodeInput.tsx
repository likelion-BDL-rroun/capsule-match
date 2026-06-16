'use client';

import { useState } from 'react';

type Props = {
  universityName: string;
  onSubmit: (code: string) => void;
  isLoading: boolean;
  error?: string;
};

// 페이지 배경색 — 펀치 홀 표현에 사용
const BG = '#0e0e0e';

export default function CodeInput({ universityName, onSubmit, isLoading, error }: Props) {
  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) onSubmit(code.trim());
  };

  return (
    <div className="w-full mx-auto" style={{ maxWidth: 420 }}>
      <style>{`
        @keyframes coupon-in {
          0%   { opacity: 0; transform: translateY(16px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes coupon-glow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(255,96,0,0.3), 0 24px 60px rgba(0,0,0,0.5), 0 0 50px rgba(255,96,0,0.12); }
          50%      { box-shadow: 0 0 0 1px rgba(255,96,0,0.45), 0 24px 60px rgba(0,0,0,0.5), 0 0 70px rgba(255,96,0,0.22); }
        }
        @keyframes code-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>

      {/* ── 쿠폰(티켓) ── */}
      <div
        style={{
          position: 'relative',
          borderRadius: 22,
          background: 'linear-gradient(165deg, #2a1408 0%, #1c1a18 55%, #161616 100%)',
          animation: 'coupon-in 0.5s cubic-bezier(0.22,1,0.36,1) both, coupon-glow 3s ease-in-out 0.5s infinite',
        }}
      >
        {/* ── 상단: 쿠폰 정보 ── */}
        <div style={{ padding: '28px 26px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <span style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '0.18em',
              color: '#FF6000', textTransform: 'uppercase',
            }}>
              Capsule Coupon
            </span>
            <span style={{ fontSize: 22, lineHeight: 1 }}>🎟️</span>
          </div>

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 6px' }}>
            이 쿠폰으로 캡슐을 열 수 있어요
          </p>
          <h3 style={{
            fontSize: 24, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.25,
            letterSpacing: '-0.02em',
          }}>
            {universityName}
          </h3>

          {/* 발행처 / 캡슐 1회 표기 */}
          <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: '0 0 3px', letterSpacing: '0.08em' }}>ISSUED BY</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 600 }}>LIKELION</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: '0 0 3px', letterSpacing: '0.08em' }}>VALUE</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 600 }}>캐릭터 캡슐 1회</p>
            </div>
          </div>
        </div>

        {/* ── 절취선 + 펀치 홀 ── */}
        <div style={{ position: 'relative', height: 1 }}>
          {/* 왼쪽 펀치 홀 */}
          <div style={{
            position: 'absolute', left: -13, top: '50%', transform: 'translateY(-50%)',
            width: 26, height: 26, borderRadius: '50%', background: BG,
            boxShadow: 'inset 0 0 0 1px rgba(255,96,0,0.2)',
          }} />
          {/* 오른쪽 펀치 홀 */}
          <div style={{
            position: 'absolute', right: -13, top: '50%', transform: 'translateY(-50%)',
            width: 26, height: 26, borderRadius: '50%', background: BG,
            boxShadow: 'inset 0 0 0 1px rgba(255,96,0,0.2)',
          }} />
          {/* 점선 */}
          <div style={{
            position: 'absolute', left: 20, right: 20, top: 0,
            borderTop: '2px dashed rgba(255,255,255,0.18)',
          }} />
        </div>

        {/* ── 하단(스텁): 코드 입력 ── */}
        <form onSubmit={handleSubmit} style={{ padding: '26px 26px 28px' }}>
          <label style={{
            display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.4)', marginBottom: 10, textTransform: 'uppercase',
          }}>
            쿠폰 코드 입력
          </label>

          <div style={{ animation: error ? 'code-shake 0.4s ease' : undefined }}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="LION-000"
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.35)',
                border: error
                  ? '1.5px solid rgba(239,68,68,0.6)'
                  : focused
                  ? '1.5px solid rgba(255,96,0,0.7)'
                  : '1.5px dashed rgba(255,255,255,0.22)',
                borderRadius: 12,
                padding: '16px 18px',
                fontSize: 22, fontWeight: 700,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                letterSpacing: '0.18em',
                color: '#fff',
                textAlign: 'center',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={isLoading}
              autoComplete="off"
              autoCapitalize="characters"
            />
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: 13, margin: '10px 2px 0', textAlign: 'center' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            style={{
              width: '100%', marginTop: 16,
              background: '#FF6000', color: '#fff',
              fontWeight: 800, fontSize: 16,
              padding: '15px 0', borderRadius: 14,
              border: 'none', cursor: isLoading || !code.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !code.trim() ? 0.4 : 1,
              boxShadow: '0 0 24px rgba(255,96,0,0.3)',
              transition: 'opacity 0.2s, transform 0.1s',
            }}
          >
            쿠폰 사용하기
          </button>
        </form>
      </div>

      <p style={{
        textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)',
        marginTop: 18, lineHeight: 1.6,
      }}>
        코드는 학교 대표에게 전달되었어요.<br />학교당 한 번만 사용할 수 있습니다.
      </p>
    </div>
  );
}
