import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'jg_admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

export function isAdminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_EMAIL.includes('@') &&
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_PASSWORD.length >= 16 &&
      process.env.ADMIN_SESSION_SECRET &&
      process.env.ADMIN_SESSION_SECRET.length >= 32,
  );
}

export function verifyAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expected = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expected || !isAdminAuthConfigured()) return false;

  const suppliedEmailHash = createHash('sha256')
    .update(email.trim().toLowerCase())
    .digest();
  const expectedEmailHash = createHash('sha256')
    .update(expectedEmail.trim().toLowerCase())
    .digest();
  const suppliedHash = createHash('sha256').update(password).digest();
  const expectedHash = createHash('sha256').update(expected).digest();
  return (
    timingSafeEqual(suppliedEmailHash, expectedEmailHash) &&
    timingSafeEqual(suppliedHash, expectedHash)
  );
}

export function createAdminSession() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!secret || !email || !password || !isAdminAuthConfigured()) {
    throw new Error('Admin authentication is not configured.');
  }

  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  const payload = `${expiresAt}.${randomBytes(32).toString('base64url')}`;
  const signature = sign(payload, sessionSigningKey(secret, email, password));
  return `${payload}.${signature}`;
}

export function isValidAdminSession(value: string | undefined) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!value || !secret || !email || !password || !isAdminAuthConfigured()) {
    return false;
  }

  const [expiresAt, nonce, suppliedSignature, ...extra] = value.split('.');
  if (
    extra.length > 0 ||
    !nonce ||
    !suppliedSignature ||
    !/^\d+$/.test(expiresAt)
  ) {
    return false;
  }

  const expiry = Number(expiresAt);
  if (!Number.isSafeInteger(expiry) || expiry <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expectedSignature = Buffer.from(
    sign(
      `${expiresAt}.${nonce}`,
      sessionSigningKey(secret, email, password),
    ),
    'base64url',
  );
  const actualSignature = Buffer.from(suppliedSignature, 'base64url');
  return (
    expectedSignature.length === actualSignature.length &&
    timingSafeEqual(expectedSignature, actualSignature)
  );
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function adminSessionCookie(value: string, requestUrl: string) {
  const secure = new URL(requestUrl).protocol === 'https:' ? '; Secure' : '';
  return `${ADMIN_SESSION_COOKIE}=${value}; Path=/; Max-Age=${ADMIN_SESSION_MAX_AGE}; HttpOnly; SameSite=Strict${secure}`;
}

export function expiredAdminSessionCookie(requestUrl: string) {
  const secure = new URL(requestUrl).protocol === 'https:' ? '; Secure' : '';
  return `${ADMIN_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${secure}`;
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function sessionSigningKey(secret: string, email: string, password: string) {
  return createHmac('sha256', secret)
    .update(`${email.trim().toLowerCase()}:${password}`)
    .digest('base64url');
}
