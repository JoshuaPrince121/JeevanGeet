import { NextResponse } from 'next/server';

import {
  ADMIN_SESSION_COOKIE,
  isSameOriginRequest,
  isValidAdminSession,
} from './admin-auth';

export function requireAdmin(request: Request, requireSameOrigin = false) {
  if (requireSameOrigin && !isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  }

  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(ADMIN_SESSION_COOKIE.length + 1);
  if (!isValidAdminSession(cookie)) {
    return NextResponse.json({ error: 'Sign in as admin.' }, { status: 401 });
  }

  return null;
}

export function reportApiError(message: string, error: unknown) {
  console.error(message, error);
  const detail = error instanceof Error ? error.message : 'Unknown server error.';
  return NextResponse.json(
    { error: `${message} ${detail}` },
    { status: 500 },
  );
}
