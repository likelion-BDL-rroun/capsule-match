'use client';

import { University } from '@/lib/types';

type Props = {
  universities: University[];
  onSelect: (university: University) => void;
};

export default function UniversitySelect({ universities, onSelect }: Props) {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3">
      {universities.map((uni) => {
        const isAssigned = !!uni.assigned_character_id;
        return (
          <button
            key={uni.id}
            onClick={() => onSelect(uni)}
            className={`
              w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 text-left transition-all
              ${isAssigned
                ? 'border-orange-200 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-white text-gray-800 hover:border-[#FF6000] hover:shadow-md active:scale-95'
              }
            `}
          >
            <span className="font-semibold text-base">{uni.name}</span>
            {isAssigned ? (
              <span className="text-xs font-medium bg-[#FF6000] text-white px-2 py-1 rounded-full">배정 완료</span>
            ) : (
              <span className="text-xs text-gray-400">선택 →</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
