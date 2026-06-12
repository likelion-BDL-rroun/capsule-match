'use client';

type Props = {
  message?: string;
};

export default function LoadingOverlay({ message = '처리 중...' }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex flex-col items-center justify-center z-50">
      <div className="bg-white rounded-2xl px-8 py-6 flex flex-col items-center gap-4 shadow-xl">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-[#FF6000] rounded-full animate-spin" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
}
