import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  // 환경변수 미설정 시 로그인 자체를 막음 (빈 비밀번호로 뚫리는 것 방지)
  if (!ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, error: '서버에 비밀번호가 설정되지 않았어요.' }, { status: 500 });
  }

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, error: '비밀번호가 올바르지 않아요.' }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set('admin_auth', ADMIN_PASSWORD, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8시간
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete('admin_auth');
  return res;
}
