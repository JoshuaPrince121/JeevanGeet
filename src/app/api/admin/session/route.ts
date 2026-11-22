import { NextResponse } from 'next/server';

import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookie,
  createAdminSession,
  expiredAdminSessionCookie,
  isAdminAuthConfigured,
  isSameOriginRequest,
  isValidAdminSession,
  verifyAdminCredentials,
} from '../../../../lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(ADMIN_SESSION_COOKIE.length + 1);

  return NextResponse.json(
    {
      configured: isAdminAuthConfigured(),
      authenticated: isValidAdminSession(cookie),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  }
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: 'Admin sign-in has not been configured.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email =
    typeof body === 'object' && body !== null && 'email' in body
      ? body.email
      : undefined;
  const password =
    typeof body === 'object' && body !== null && 'password' in body
      ? body.password
      : undefined;
  if (
    typeof email !== 'string' ||
    email.length > 320 ||
    typeof password !== 'string' ||
    password.length === 0 ||
    password.length > 1024 ||
    !verifyAdminCredentials(email, password)
  ) {
    return NextResponse.json(
      { error: 'Incorrect email or password.' },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ authenticated: true });
  response.headers.set(
    'Set-Cookie',
    adminSessionCookie(createAdminSession(), request.url),
  );
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  }
  const response = NextResponse.json({ authenticated: false });
  response.headers.set('Set-Cookie', expiredAdminSessionCookie(request.url));
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
