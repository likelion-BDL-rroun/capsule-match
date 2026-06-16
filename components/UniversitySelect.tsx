'use client';

import Image from 'next/image';
import { University } from '@/lib/types';
import universityLogos from '@/lib/universityLogos';

type Props = {
  universities: University[];
  onSelect: (university: University) => void;
};

export default function UniversitySelect({ universities, onSelect }: Props) {
  return (
    <>
      <style>{`
        .univ-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (min-width: 744px) {
          .univ-grid { grid-template-columns: repeat(6, 1fr); gap: 16px; }
        }
        @media (min-width: 1280px) {
          .univ-grid { grid-template-columns: repeat(8, 1fr); gap: 16px; }
        }
      `}</style>
      <div className="univ-grid">

      {universities.map((uni) => {
        const isAssigned = !!uni.assigned_character_id;
        const logoUrl = universityLogos[uni.name];
        const initial = uni.name.replace(/[()\/\s]/g, '').charAt(0);

        return (
          <button
            key={uni.id}
            onClick={() => onSelect(uni)}
            className="flex flex-col items-center gap-2"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {/* 정사각형 박스 */}
            <div
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 14,
                border: isAssigned
                  ? '1.5px solid rgba(255,96,0,0.5)'
                  : '1.5px solid rgba(255,255,255,0.1)',
                background: isAssigned
                  ? 'rgba(255,96,0,0.1)'
                  : 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                if (!isAssigned) {
                  (e.currentTarget as HTMLDivElement).style.border = '1.5px solid rgba(255,96,0,0.5)';
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,96,0,0.08)';
                }
              }}
              onMouseLeave={e => {
                if (!isAssigned) {
                  (e.currentTarget as HTMLDivElement).style.border = '1.5px solid rgba(255,255,255,0.1)';
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
                }
              }}
            >
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={uni.name}
                  fill
                  style={{ objectFit: 'contain', padding: '16%' }}
                />
              ) : (
                <span style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: isAssigned ? 'rgba(255,96,0,0.6)' : 'rgba(255,255,255,0.25)',
                }}>
                  {initial}
                </span>
              )}

              {/* 배정 완료 뱃지 */}
              {isAssigned && (
                <div style={{
                  position: 'absolute', bottom: 5, left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 9, fontWeight: 700,
                  background: '#FF6000', color: '#fff',
                  padding: '2px 7px', borderRadius: 999,
                  whiteSpace: 'nowrap',
                }}>완료</div>
              )}
            </div>

            {/* 학교명 */}
            <span style={{
              fontSize: 10,
              fontWeight: 500,
              color: isAssigned ? 'rgba(255,96,0,0.7)' : 'rgba(255,255,255,0.5)',
              textAlign: 'center',
              lineHeight: 1.3,
              wordBreak: 'keep-all',
              width: '100%',
            }}>
              {uni.name
                .replace('대학교', '')
                .replace('국립', '')
                .replace('여자', '여자\n')}
            </span>
          </button>
        );
      })}
      </div>
    </>
  );
}
