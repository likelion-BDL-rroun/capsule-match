'use client';

import Image from 'next/image';

type Props = {
  universityName: string;
  characterName: string;
  characterImageUrl?: string | null;
  // 나중에 공유 기능 추가를 위한 확장 prop
  onShare?: () => void;
};

export default function ResultCard({ universityName, characterName, characterImageUrl, onShare }: Props) {
  return (
    <div className="w-full max-w-sm mx-auto">
      {/* 결과 카드 - 나중에 SNS 공유 이미지로 확장할 수 있도록 독립적인 레이아웃으로 구성 */}
      <div className="bg-gradient-to-b from-orange-50 to-white border-2 border-[#FF6000] rounded-3xl overflow-hidden shadow-xl">
        {/* 카드 헤더 */}
        <div className="bg-[#FF6000] px-6 py-4 text-center">
          <p className="text-white text-sm font-medium opacity-80">매칭 완료!</p>
          <p className="text-white font-bold text-lg">{universityName}</p>
        </div>

        {/* 캐릭터 이미지 영역 */}
        <div className="flex justify-center py-8">
          {characterImageUrl ? (
            <div className="relative w-32 h-32">
              <Image
                src={characterImageUrl}
                alt={characterName}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            // 이미지가 없을 때 임시 플레이스홀더
            <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center text-5xl">
              🎭
            </div>
          )}
        </div>

        {/* 캐릭터 이름 */}
        <div className="text-center px-6 pb-6">
          <p className="text-gray-500 text-sm mb-1">{universityName}의 캐릭터는</p>
          <p className="text-2xl font-bold text-gray-900">{characterName}</p>
          <p className="text-xs text-gray-400 mt-3">
            이 캐릭터는 이제 {universityName}에만 배정됩니다.
          </p>
        </div>
      </div>

      {/* 공유 버튼 - 나중에 활성화할 수 있도록 구조만 잡아둡니다 */}
      {onShare && (
        <button
          onClick={onShare}
          className="w-full mt-4 border-2 border-[#FF6000] text-[#FF6000] font-bold py-4 rounded-2xl text-base active:scale-95 transition-all"
        >
          결과 공유하기
        </button>
      )}
    </div>
  );
}
