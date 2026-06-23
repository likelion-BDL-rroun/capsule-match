'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setIsLoading(false);

    if (data.success) {
      router.push('/admin');
      router.refresh();
    } else {
      setError(data.error ?? '비밀번호가 올바르지 않아요.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm overflow-hidden">
        <div className="bg-[#FF6000] px-6 py-5 text-center">
          <p className="text-white font-bold text-lg">관리자 로그인</p>
          <p className="text-orange-100 text-xs mt-1">캡슐 매칭 관리자 전용</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              관리자 비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FF6000] transition-colors"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-[#FF6000] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50 active:scale-95 transition-all"
          >
            {isLoading ? '확인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </main>
  );
}
