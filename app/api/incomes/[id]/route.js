import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

// GET single income
export async function GET(req, context) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { params } = context;
  const resolvedParams = await params;

  const id = resolvedParams?.id;

  if (!id) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const income = await prisma.income.findUnique({
    where: { id }
  });

  if (!income || income.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ income });
}

// UPDATE income
export async function PUT(req, context) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { params } = context;
  const resolvedParams = await params;

  try {
    const body = await req.json();
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const existing = await prisma.income.findUnique({ where: { id } });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await prisma.income.update({
      where: { id },
      data: {
        amount: body.amount !== undefined ? Number(body.amount) : existing.amount,
        source: body.source !== undefined ? body.source : existing.source,
        date: body.date ? new Date(body.date) : existing.date
      }
    });

    return NextResponse.json({ income: updated });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE income
export async function DELETE(req, context) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { params } = context;
    const resolvedParams = await params;

    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const existing = await prisma.income.findUnique({ where: { id } });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.income.delete({ where: { id } });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
