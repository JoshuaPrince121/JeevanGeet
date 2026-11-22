import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { isSameOriginRequest, isValidAdminSession } from '../../../../lib/admin-auth';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  }
  const cookie = req.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('jg_admin_session='))
    ?.slice('jg_admin_session='.length);
  if (!isValidAdminSession(cookie)) {
    return NextResponse.json({ error: 'Sign in as admin.' }, { status: 401 });
  }

  const { id } = await params;
  await prisma.song.delete({ where: { id } });
  return NextResponse.json({ message: 'Deleted' });
}