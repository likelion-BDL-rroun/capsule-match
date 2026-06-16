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
        .univ-item:hover .univ-box {
          border-color: #FF6000 !important;
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
            className="univ-item"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
          >
            {/* 정사각형 박스 */}
            <div
              className={isAssigned ? 'univ-box assigned' : 'univ-box'}
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 14,
                border: isAssigned ? '2px solid #8f3e1b' : '2px solid #343232',
                background: isAssigned ? '#261711' : 'rgba(35,35,33,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
            >
              {/* 로고 or 플레이스홀더 */}
              <div style={{ width: '45%', aspectRatio: '1/1', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {logoUrl ? (
                  <Image src={logoUrl} alt={uni.name} fill style={{ objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: 16, fontWeight: 800, color: isAssigned ? '#FF6000' : '#949494' }}>{initial}</span>
                )}
              </div>

              {/* 학교명 + 뱃지 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%', padding: '0 6px' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: isAssigned ? '#FF6000' : '#949494', textAlign: 'center', lineHeight: 1.2, wordBreak: 'keep-all', letterSpacing: '0.03em' }}>
                  {uni.name.replace('대학교', '').replace('국립', '')}
                </span>
                <div style={{
                  background: isAssigned ? '#FF6000' : '#3e3e3d',
                  color: isAssigned ? '#fff' : '#949494',
                  fontSize: 10, fontWeight: 500,
                  padding: '3px 8px', borderRadius: 999,
                  letterSpacing: '0.03em', whiteSpace: 'nowrap',
                }}>
                  {isAssigned ? '완료' : '미배정'}
                </div>
              </div>
            </div>
          </button>
        );
      })}
      </div>
    </>
  );
}
