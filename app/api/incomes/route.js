import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET incomes for the current user (supports month/period/year and a simple search)
export async function GET(req) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || searchParams.get('q');
    const month = searchParams.get('month');
    const period = searchParams.get('period');
    const year = searchParams.get('year');

    let where = {
      userId: user.id
    };

    // Simple search against source
    if (search) {
      where.OR = [
        { source: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Month filter
    if (month && (period === 'month' || period === 'last12')) {
      const start = new Date(`${month}-01`);

      if (!isNaN(start.getTime())) {
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);

        where.date = {
          gte: start,
          lt: end
        };
      }
    }

    // Year filter
    if (period === 'year' && year) {
      const start = new Date(`${year}-01-01`);

      if (!isNaN(start.getTime())) {
        const end = new Date(`${Number(year) + 1}-01-01`);

        where.date = {
          gte: start,
          lt: end
        };
      }
    }

    const incomes = await prisma.income.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ incomes });

  } catch (e) {
    console.error('INCOMES API ERROR:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Create income
export async function POST(req) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const income = await prisma.income.create({
      data: {
        amount: parseFloat(body.amount),
        source: body.source || 'Other',
        date: body.date ? new Date(body.date) : new Date(),
        userId: user.id
      }
    });

    return NextResponse.json({ income });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
