import { cookies } from 'next/headers';

import AdminClient from './admin-client';
import {
  ADMIN_SESSION_COOKIE,
  isAdminAuthConfigured,
  isValidAdminSession,
} from '../../lib/admin-auth';
import { prisma } from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const cookieStore = await cookies();
  const isAuthenticated = isValidAdminSession(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  const { section } = await searchParams;
  const initialSection = section === 'songs' ? 'songs' : 'content';
  const initialSongs =
    isAuthenticated && initialSection === 'songs'
      ? await prisma.song.findMany({
          orderBy: { number: 'asc' },
          select: {
            id: true,
            number: true,
            title: true,
            lyrics: true,
            language: true,
          },
        })
      : [];

  return (
    <AdminClient
      isAuthenticated={isAuthenticated}
      isConfigured={isAdminAuthConfigured()}
      initialSection={initialSection}
      initialSongs={initialSongs}
    />
  );
}
