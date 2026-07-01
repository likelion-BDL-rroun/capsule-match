// 클라이언트 전용 이벤트 로깅 — 비동기 fire-and-forget.
// 개인정보/학교코드는 절대 저장하지 않음. school은 학교 ID만, session_id는 브라우저 세션 식별용 UUID만.

export type AnalyticsEvent =
  | 'visit'            // 메인 페이지 진입
  | 'school_selected'  // 학교 선택 완료
  | 'code_success'     // 코드 인증 성공
  | 'code_fail'        // 코드 인증 실패
  | 'card_clicked'     // 카드 선택
  | 'complete';        // 캐릭터 공개 완료

const SESSION_KEY = 'analytics_session_id';

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

// UX에 절대 영향을 주지 않도록 await 없이 발사하고 실패는 조용히 무시한다.
export function logEvent(event: AnalyticsEvent, school?: string | null) {
  if (typeof window === 'undefined') return;
  try {
    const body = JSON.stringify({ session_id: getSessionId(), event, school: school ?? null });
    fetch('/api/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true, // 페이지 이동/이탈 중에도 전송 보장
    }).catch(() => {});
  } catch {
    // 로깅 실패는 서비스 흐름에 절대 영향 주지 않음
  }
}
