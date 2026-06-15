'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminStatusTable from '@/components/AdminStatusTable';
import ResetAssignmentModal from '@/components/ResetAssignmentModal';

type UniversityRow = {
  id: string;
  name: string;
  assigned_character_id: string | null;
  assigned_at: string | null;
  characters: { id: string; name: string; image_url: string | null } | null;
};

type StatusData = {
  universities: UniversityRow[];
  assigned: number;
  total: number;
  remaining: number;
};

export default function AdminPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [resetTarget, setResetTarget] = useState<UniversityRow | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch('/api/status');
    const json = await res.json();
    setData(json);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleResetConfirm = async (retireCharacter: boolean, reason: string) => {
    if (!resetTarget) return;
    setIsResetting(true);

    const res = await fetch('/api/admin/reset-assignment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        universityId: resetTarget.id,
        retireCharacter,
        reason,
      }),
    });
    const result = await res.json();
    setIsResetting(false);
    setResetTarget(null);

    if (result.success) {
      showToast(
        `${resetTarget.name} 배정이 초기화되었습니다. (${result.action === 'retired' ? '캐릭터 retired' : '캐릭터 후보 복귀'})`,
        'success'
      );
      loadStatus();
    } else {
      showToast(result.error ?? '초기화에 실패했습니다.', 'error');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">관리자 현황판</h1>
            <p className="text-sm text-gray-500 mt-1">캐릭터 배정 현황 및 초기화 관리</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadStatus}
              className="text-sm text-[#FF6000] font-medium border border-orange-200 px-3 py-2 rounded-xl"
            >
              새로고침
            </button>
            <button
              onClick={async () => {
                await fetch('/api/admin/auth', { method: 'DELETE' });
                router.push('/admin/login');
              }}
              className="text-sm text-gray-500 font-medium border border-gray-200 px-3 py-2 rounded-xl"
            >
              로그아웃
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-[#FF6000] rounded-full animate-spin" />
          </div>
        ) : data ? (
          <AdminStatusTable
            universities={data.universities}
            assigned={data.assigned}
            total={data.total}
            remaining={data.remaining}
            onResetClick={setResetTarget}
          />
        ) : (
          <p className="text-center text-gray-400 py-10">데이터를 불러올 수 없어요.</p>
        )}

        {/* 테스트 전용 초기화 SQL 안내 */}
        {/* ⚠️ 실제 운영 배포 전에는 이 섹션을 제거하거나 강력한 인증으로 보호하세요. */}
        <div className="mt-10 border-t border-dashed border-gray-200 pt-6">
          <p className="text-xs text-gray-400 font-semibold uppercase mb-2">⚠️ 테스트 전용 구역</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-yellow-800 mb-2">전체 데이터 초기화 SQL</p>
            <p className="text-xs text-yellow-700 mb-3">
              아래 SQL을 Supabase SQL Editor에서 실행하면 모든 배정 데이터가 초기화됩니다.<br />
              <strong>운영 배포 전에는 절대 사용하지 마세요.</strong>
            </p>
            <pre className="bg-yellow-100 rounded-lg p-3 text-xs text-yellow-900 overflow-x-auto whitespace-pre-wrap">
{`UPDATE universities SET assigned_character_id = NULL, assigned_at = NULL;
UPDATE characters SET status = 'available', assigned_university_id = NULL, assigned_at = NULL;
DELETE FROM assignment_logs;`}
            </pre>
          </div>
        </div>
      </div>

      {/* 배정 초기화 모달 */}
      {resetTarget && (
        <ResetAssignmentModal
          universityName={resetTarget.name}
          characterName={resetTarget.characters?.name ?? ''}
          onConfirm={handleResetConfirm}
          onCancel={() => setResetTarget(null)}
          isLoading={isResetting}
        />
      )}

      {/* 토스트 알림 */}
      {toast && (
        <div className={`
          fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-white
          ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}
        `}>
          {toast.message}
        </div>
      )}
    </main>
  );
}
