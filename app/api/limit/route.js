import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export async function POST(req) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { monthlyLimit } = await req.json();
    if (monthlyLimit == null) return NextResponse.json({ error: 'Missing' }, { status: 400 });
    const existing = await prisma.limit.findUnique({ where: { userId: user.id } });
    if (existing) {
      const updated = await prisma.limit.update({ where: { id: existing.id }, data: { monthlyLimit: Number(monthlyLimit) } });
      return NextResponse.json({ limit: updated });
    }
    const created = await prisma.limit.create({ data: { monthlyLimit: Number(monthlyLimit), userId: user.id } });
    return NextResponse.json({ limit: created });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const existing = await prisma.limit.findUnique({ where: { userId: user.id } });
    return NextResponse.json({ monthlyLimit: existing ? existing.monthlyLimit : 0 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
