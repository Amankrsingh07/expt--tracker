import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export async function GET(req) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const categories = await prisma.category.findMany({ where: { userId: user.id } });
  return NextResponse.json({ categories });
}

export async function POST(req) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: 'Missing' }, { status: 400 });
  const category = await prisma.category.create({ data: { name, userId: user.id } });
  return NextResponse.json({ category });
}
