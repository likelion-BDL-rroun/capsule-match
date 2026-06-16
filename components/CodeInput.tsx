'use client';

import { useState } from 'react';

type Props = {
  universityName: string;
  onSubmit: (code: string) => void;
  isLoading: boolean;
  error?: string;
};

export default function CodeInput({ universityName, onSubmit, isLoading, error }: Props) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) onSubmit(code.trim());
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-5">
      <div style={{
        background: 'rgba(255,96,0,0.07)',
        border: '1px solid rgba(255,96,0,0.2)',
        borderRadius: 16, padding: '16px 18px',
      }}>
        <p style={{ color: '#FF6000', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>입력 안내</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
          학교 대표에게 전달된 코드를 입력하면{' '}
          <strong style={{ color: '#f0f0f0' }}>{universityName}</strong>의 캐릭터 캡슐을 열 수 있어요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            {universityName} 캡슐 오픈 코드
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="예: TEST-001"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '14px 16px',
              fontSize: 15,
              color: '#f0f0f0',
              outline: 'none',
              transition: 'border 0.2s',
            }}
            onFocus={e => (e.target.style.border = '1px solid rgba(255,96,0,0.5)')}
            onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.1)')}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 12, padding: '12px 16px',
          }}>
            <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !code.trim()}
          style={{
            width: '100%', background: '#FF6000', color: '#fff',
            fontWeight: 700, fontSize: 16,
            padding: '15px 0', borderRadius: 16,
            border: 'none', cursor: isLoading || !code.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !code.trim() ? 0.45 : 1,
            boxShadow: '0 0 24px rgba(255,96,0,0.25)',
            transition: 'opacity 0.2s',
          }}
        >
          코드 확인하기
        </button>
      </form>
    </div>
  );
}
