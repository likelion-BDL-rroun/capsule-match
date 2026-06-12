'use client';

import { useState } from 'react';

type Props = {
  universityName: string;
  onPick: () => void;
  isLoading: boolean;
};

// 캡슐 개수 - 나중에 애니메이션을 추가할 때 확장할 수 있도록 배열로 관리합니다.
const CAPSULE_COUNT = 5;

export default function CapsulePicker({ universityName, onPick, isLoading }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (isLoading || selected !== null) return;
    setSelected(index);
    // 선택 후 잠깐 딜레이를 주어 "내가 직접 골랐다"는 느낌을 줍니다.
    setTimeout(() => onPick(), 600);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 mb-4">
          <span className="text-green-600 text-sm font-medium">✓ 인증 완료!</span>
        </div>
        <p className="text-gray-600 text-sm">
          선택한 순간, 아직 배정되지 않은 캐릭터 중<br />
          하나가 <strong>{universityName}</strong>에 연결됩니다.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: CAPSULE_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={isLoading || selected !== null}
            className={`
              aspect-square rounded-2xl flex items-center justify-center text-3xl
              border-2 transition-all duration-300
              ${selected === i
                ? 'border-[#FF6000] bg-orange-50 scale-110 shadow-lg'
                : selected !== null
                  ? 'border-gray-200 bg-gray-50 opacity-40'
                  : 'border-gray-200 bg-white hover:border-[#FF6000] hover:shadow-md active:scale-90'
              }
            `}
          >
            {selected === i ? '🎁' : '📦'}
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        캡슐 하나를 직접 선택해보세요
      </p>
    </div>
  );
}
