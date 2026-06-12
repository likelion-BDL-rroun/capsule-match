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
    <div className="w-full max-w-md mx-auto flex flex-col gap-6">
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
        <p className="text-sm text-orange-600 font-medium mb-1">입력 안내</p>
        <p className="text-sm text-gray-600">
          학교 대표에게 전달된 코드를 입력하면{' '}
          <strong>{universityName}</strong>의 캐릭터 캡슐을 열 수 있어요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {universityName} 캡슐 오픈 코드
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="예: TEST-001"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#FF6000] transition-colors"
            disabled={isLoading}
            autoComplete="off"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !code.trim()}
          className="w-full bg-[#FF6000] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50 active:scale-95 transition-all"
        >
          코드 확인하기
        </button>
      </form>
    </div>
  );
}
