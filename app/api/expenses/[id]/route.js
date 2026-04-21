import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

// ✅ GET SINGLE EXPENSE

export async function GET(req, context) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { params } = context;
  const resolvedParams = await params;

  const id = parseInt(resolvedParams?.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { category: true }
  });

  if (!expense || expense.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ expense });
}

// ✅ UPDATE EXPENSE
export async function PUT(req, context) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { params } = context;
  const resolvedParams = await params;

  try {
    const body = await req.json();
    const id = parseInt(resolvedParams?.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const existing = await prisma.expense.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        amount: Number(body.amount),
        categoryId: Number(body.categoryId),
        description: body.description || '',
        date: new Date(body.date)
      }
    });

    return NextResponse.json({ expense: updated });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ✅ DELETE EXPENSE

export async function DELETE(req, context) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // ✅ FIX: await params
    const { params } = context;
    const resolvedParams = await params;

    console.log("PARAMS:", resolvedParams);

    const id = parseInt(resolvedParams?.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const existing = await prisma.expense.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}