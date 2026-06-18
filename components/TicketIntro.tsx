'use client';

type Props = {
  universityName: string;
  onContinue: () => void;
  onBack?: () => void;
};

export default function TicketIntro({ universityName, onContinue, onBack }: Props) {
  return (
    <div className="ti-root">
      <style>{`
        .ti-root {
          min-height: 100dvh;
          background: #0e0e0e;
          display: flex;
          flex-direction: column;
          padding: 20px 16px 18px;
          max-width: 480px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          overflow: hidden;
        }
        .ti-back {
          align-self: flex-start;
          margin: 0;
          color: rgba(255,255,255,0.3);
          font-size: 14px;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          letter-spacing: 0.03em;
          z-index: 2;
          transition: color 0.15s;
        }
        .ti-back:hover { color: rgba(255,255,255,0.7); }

        .ti-stage {
          flex: 1;
          display: flex;
          flex-direction: column;
          z-index: 1;
        }
        .ti-group { display: contents; }

        .ti-text { order: 1; flex: 0 0 auto; }
        .ti-lion-wrap {
          order: 2;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 0;
          min-height: 200px;
        }
        .ti-cta { order: 3; flex: 0 0 auto; }

        .ti-title {
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          text-align: center;
          letter-spacing: 0.02em;
          line-height: 1.3;
          margin: 36px 0 14px;
          text-shadow: 0px 2px 8px rgba(214,81,0,0.3);
        }
        .ti-pill-row { display: flex; justify-content: center; margin-bottom: 16px; }
        .ti-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          border-radius: 99px;
          border: 1px solid rgba(255,96,0,0.35);
          background: linear-gradient(180deg, rgba(255,96,0,0) 30%, rgba(255,96,0,0.12) 100%);
        }
        .ti-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          text-align: center;
          line-height: 1.6;
          letter-spacing: 0.02em;
          margin: 0;
        }
        .ti-lion {
          max-height: min(46vh, 340px);
          width: auto;
          object-fit: contain;
          pointer-events: none;
          filter: none;
        }
        .ti-next {
          width: 100%;
          padding: 17px 10px;
          border-radius: 14px;
          background: #FF6000;
          color: #fff;
          font-size: 16px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          letter-spacing: 0.03em;
          text-shadow: 0px 2px 4px rgba(214,81,0,0.25);
          box-shadow: 0 8px 28px rgba(255,96,0,0.35);
          transition: transform 0.08s;
          animation: ti-glow-anim 2.4s ease-in-out infinite;
        }
        .ti-next:active { transform: scale(0.985); }

        @keyframes ti-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ti-glow-anim {
          0%, 100% { box-shadow: 0 0 24px 4px rgba(255,96,0,0.18); }
          50%      { box-shadow: 0 0 40px 10px rgba(255,96,0,0.28); }
        }

        /* ===== PC: 좌우 2단 배치 ===== */
        @media (min-width: 769px) {
          .ti-root { max-width: 1232px; padding: 28px 40px 40px; }
          .ti-stage {
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 64px;
          }
          .ti-group {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            max-width: 420px;
          }
          .ti-lion-wrap { order: 0; flex: 0 0 auto; padding: 0; min-height: 0; }
          .ti-lion { max-height: min(70vh, 520px); }
          .ti-text { order: 1; }
          .ti-cta { order: 2; width: 100%; margin-top: 28px; }
          .ti-title { font-size: 38px; text-align: left; margin: 0 0 20px; }
          .ti-pill-row { justify-content: flex-start; margin-bottom: 20px; }
          .ti-subtitle { font-size: 16px; text-align: left; }
          .ti-next { font-size: 18px; padding: 19px 10px; }
        }
      `}</style>


      {onBack && (
        <button onClick={onBack} className="ti-back">
          ‹ 돌아가기
        </button>
      )}

      <div className="ti-stage">
        {/* 사자 GIF */}
        <div className="ti-lion-wrap">
          <video
            src="/검표 영상.mp4"
            className="ti-lion"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>

        <div className="ti-group">
          {/* 텍스트 */}
          <div className="ti-text">
            <h1 className="ti-title">잠시 티켓 확인하겠습니다!</h1>
            <div className="ti-pill-row">
              <div className="ti-pill">
                <span style={{ fontSize: 12, color: '#9e9e9e', letterSpacing: '0.03em', fontWeight: 500 }}>
                  선택된 학교
                </span>
                <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.25)' }} />
                <span style={{ fontSize: 14, color: '#fff', letterSpacing: '0.02em', fontWeight: 700 }}>
                  {universityName}
                </span>
              </div>
            </div>
            <p className="ti-subtitle">
              티켓은 각 대학교당 1매만 발급됩니다.
              <br />
              해당 대학교 대표자만 티켓 코드를 입력해주세요
            </p>
          </div>

          {/* 버튼 */}
          <div className="ti-cta">
            <button onClick={onContinue} className="ti-next">
              티켓 코드 입력하러 가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
