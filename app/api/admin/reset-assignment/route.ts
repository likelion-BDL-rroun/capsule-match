import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { universityId, retireCharacter, reason } = await req.json();

    if (!universityId) {
      return NextResponse.json({ success: false, error: '대학 ID가 필요합니다.' }, { status: 400 });
    }
    if (!reason?.trim()) {
      return NextResponse.json({ success: false, error: '초기화 사유를 입력해주세요.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.rpc('reset_university_assignment', {
      p_university_id: universityId,
      p_retire_character: retireCharacter ?? true,
      p_reason: reason.trim(),
    });

    if (error) {
      console.error('Reset RPC error:', error);
      return NextResponse.json({ success: false, error: '초기화 중 오류가 발생했습니다.' }, { status: 500 });
    }

    if (data?.error_code === 'NOT_ASSIGNED') {
      return NextResponse.json({ success: false, error: '배정된 캐릭터가 없는 대학입니다.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, action: data?.action });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: '일시적인 오류가 발생했습니다.' }, { status: 500 });
  }
}
