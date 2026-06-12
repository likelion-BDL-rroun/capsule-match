'use client';

type UniversityRow = {
  id: string;
  name: string;
  assigned_character_id: string | null;
  assigned_at: string | null;
  characters: { id: string; name: string; image_url: string | null } | null;
};

type Props = {
  universities: UniversityRow[];
  assigned: number;
  total: number;
  remaining: number;
  onResetClick: (university: UniversityRow) => void;
};

export default function AdminStatusTable({ universities, assigned, total, remaining, onResetClick }: Props) {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* 요약 통계 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#FF6000]">{assigned}</p>
          <p className="text-xs text-gray-500 mt-1">배정 완료</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{total - assigned}</p>
          <p className="text-xs text-gray-500 mt-1">미배정</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{remaining}</p>
          <p className="text-xs text-gray-500 mt-1">잔여 캐릭터</p>
        </div>
      </div>

      {/* 대학 목록 */}
      <div className="flex flex-col gap-2">
        {universities.map((uni) => (
          <div
            key={uni.id}
            className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{uni.name}</p>
              {uni.characters ? (
                <p className="text-xs text-[#FF6000] mt-0.5">{uni.characters.name}</p>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5">미배정</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {uni.assigned_at && (
                <p className="text-xs text-gray-400 hidden sm:block">
                  {new Date(uni.assigned_at).toLocaleString('ko-KR', {
                    month: 'numeric', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              )}
              {uni.characters ? (
                <button
                  onClick={() => onResetClick(uni)}
                  className="text-xs border border-red-200 text-red-500 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 active:scale-95 transition-all"
                >
                  배정 초기화
                </button>
              ) : (
                <span className="text-xs border border-gray-200 text-gray-300 px-3 py-1.5 rounded-lg">
                  미배정
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
