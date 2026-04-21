import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

// ✅ SINGLE GET (Search + Filter combined)
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
    const categoryId = searchParams.get('categoryId');

    let where = {
      userId: user.id
    };

    // 🔍 SEARCH
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        {
          category: {
            is: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ];
    }

    // 📅 MONTH FILTER
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

    // 📅 YEAR FILTER
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

    // 🏷 CATEGORY FILTER
    if (categoryId && categoryId !== '') {
      const catId = parseInt(categoryId, 10);
      if (!isNaN(catId)) {
        where.categoryId = catId;
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ expenses });

  } catch (e) {
    console.error("API ERROR:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


// ✅ CREATE EXPENSE
export async function POST(req) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const expense = await prisma.expense.create({
      data: {
        amount: Number(body.amount),
        categoryId: Number(body.categoryId),
        description: body.description || '',
        date: new Date(body.date),
        userId: user.id
      }
    });

    return NextResponse.json({ expense });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}