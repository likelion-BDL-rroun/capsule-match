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
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px',
              borderRadius: 16,
              border: isAssigned
                ? '1px solid rgba(255,96,0,0.35)'
                : '1px solid rgba(255,255,255,0.07)',
              background: isAssigned
                ? 'rgba(255,96,0,0.08)'
                : 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              textAlign: 'left',
            }}
            onMouseEnter={e => {
              if (!isAssigned) (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,96,0,0.4)';
            }}
            onMouseLeave={e => {
              if (!isAssigned) (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.07)';
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 15, color: isAssigned ? 'rgba(255,255,255,0.5)' : '#f0f0f0' }}>
              {uni.name}
            </span>
            {isAssigned ? (
              <span style={{
                fontSize: 11, fontWeight: 600,
                background: 'rgba(255,96,0,0.2)', color: '#FF6000',
                padding: '3px 10px', borderRadius: 999,
              }}>배정 완료</span>
            ) : (
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>선택 →</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
