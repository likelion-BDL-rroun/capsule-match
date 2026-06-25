import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 어드민 영역 인증 가드 (Next 16: middleware → proxy).
// /admin/login 만 공개, 나머지 /admin/* 는 admin_auth 쿠키 필요.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'likelion2026univ';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 로그인 페이지는 보호 제외
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const cookie = req.cookies.get('admin_auth');
  if (cookie?.value !== ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
