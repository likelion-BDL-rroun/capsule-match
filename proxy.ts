import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 어드민 영역 인증 가드 — admin_auth 쿠키가 없으면 로그인으로 보냄.
// /admin/login 은 matcher에서 제외(공개), 나머지 /admin/* 는 보호.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'likelion2026univ';

export function proxy(request: NextRequest) {
  const authed = request.cookies.get('admin_auth')?.value === ADMIN_PASSWORD;
  if (!authed) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/manage', '/admin/live'],
};
