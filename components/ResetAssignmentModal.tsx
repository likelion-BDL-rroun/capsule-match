'use client';

import { useState } from 'react';

type Props = {
  universityName: string;
  characterName: string;
  onConfirm: (retireCharacter: boolean, reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
};

export default function ResetAssignmentModal({
  universityName,
  characterName,
  onConfirm,
  onCancel,
  isLoading,
}: Props) {
  // 기본값: retired 처리 (운영 단계 권장)
  const [retireCharacter, setRetireCharacter] = useState(true);
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        {/* 헤더 */}
        <div className="bg-red-50 border-b border-red-100 px-5 py-4">
          <p className="text-red-600 font-bold text-base">배정 초기화</p>
          <p className="text-red-500 text-xs mt-0.5">이 작업은 사용자 화면에 재추첨 버튼을 만들지 않습니다.</p>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          {/* 대상 정보 */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">
            <span className="font-semibold">{universityName}</span> —{' '}
            <span className="text-[#FF6000]">{characterName}</span> 배정을 초기화합니다.
          </div>

          {/* 기존 캐릭터 처리 방식 */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">기존 캐릭터 처리 방식</p>
            <div className="flex flex-col gap-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="retireMode"
                  checked={retireCharacter}
                  onChange={() => setRetireCharacter(true)}
                  className="mt-0.5 accent-[#FF6000]"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">기존 캐릭터를 재사용하지 않음</p>
                  <p className="text-xs text-gray-400">캐릭터가 retired 처리되어 다시 뽑히지 않습니다. (운영 권장)</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="retireMode"
                  checked={!retireCharacter}
                  onChange={() => setRetireCharacter(false)}
                  className="mt-0.5 accent-[#FF6000]"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">기존 캐릭터를 다시 후보에 포함</p>
                  <p className="text-xs text-gray-400">캐릭터가 available로 돌아와 다른 학교에 배정될 수 있습니다.</p>
                </div>
              </label>
            </div>
          </div>

          {/* 사유 입력 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              초기화 사유를 입력해주세요 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="예: 담당자 요청으로 재배정 필요"
              rows={2}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#FF6000] resize-none"
              disabled={isLoading}
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={() => onConfirm(retireCharacter, reason)}
              disabled={isLoading || !reason.trim()}
              className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 active:scale-95 transition-all"
            >
              {isLoading ? '처리 중...' : '초기화 확인'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
