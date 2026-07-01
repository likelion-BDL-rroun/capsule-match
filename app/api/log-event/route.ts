import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 허용된 이벤트만 기록 (임의 값 스팸 방지)
const ALLOWED = new Set([
  'visit',
  'school_selected',
  'code_success',
  'code_fail',
  'card_clicked',
  'complete',
]);

// 실패해도 UX에 영향이 없도록 항상 204로 조용히 응답. 개인정보/코드는 저장하지 않음.
export async function POST(req: NextRequest) {
  try {
    const { session_id, event, school } = await req.json();
    if (ALLOWED.has(event)) {
      await supabaseAdmin.from('event_logs').insert({
        session_id: typeof session_id === 'string' ? session_id.slice(0, 64) : null,
        event,
        school: typeof school === 'string' ? school.slice(0, 64) : null,
      });
    }
  } catch {
    // 로깅 실패는 조용히 무시
  }
  return new NextResponse(null, { status: 204 });
}
