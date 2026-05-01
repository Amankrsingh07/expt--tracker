import { getUserFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req) {
  const user = await getUserFromRequest(req);
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const url = new URL(req.url);
  const onlyUnread = url.searchParams.get('unread') === '1';

  const where = { userId: user.id };
  if (onlyUnread) where.read = false;

  const notifs = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return new Response(JSON.stringify({ notifications: notifs }), { status: 200 });
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const body = await req.json();
    const { title, body: b, type = 'info', meta } = body;

    if (!title) return new Response(JSON.stringify({ error: 'Missing title' }), { status: 400 });

    const notif = await prisma.notification.create({
      data: {
        userId: user.id,
        title,
        body: b || null,
        type,
        meta: meta || null,
      }
    });

    return new Response(JSON.stringify({ notification: notif }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}