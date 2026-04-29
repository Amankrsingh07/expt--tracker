import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

// ✅ SINGLE GET (Search + Filter combined)
// export async function GET(req) {
//   const user = await getUserFromRequest(req);

//   if (!user) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const { searchParams } = new URL(req.url);

//     const search = searchParams.get('search') || searchParams.get('q');
//     const month = searchParams.get('month');
//     const period = searchParams.get('period');
//     const year = searchParams.get('year');
//     const categoryId = searchParams.get('categoryId');

//     let where = {
//       userId: user.id
//     };

//     // 🔍 SEARCH
//     if (search) {
//       where.OR = [
//         { description: { contains: search, mode: 'insensitive' } },
//         {
//           category: {
//             is: {
//               name: { contains: search, mode: 'insensitive' }
//             }
//           }
//         }
//       ];
//     }

//     // 📅 MONTH FILTER
//     if (month && (period === 'month' || period === 'last12')) {
//       const start = new Date(`${month}-01`);

//       if (!isNaN(start.getTime())) {
//         const end = new Date(start);
//         end.setMonth(end.getMonth() + 1);

//         where.date = {
//           gte: start,
//           lt: end
//         };
//       }
//     }

//     // 📅 YEAR FILTER
//     if (period === 'year' && year) {
//       const start = new Date(`${year}-01-01`);

//       if (!isNaN(start.getTime())) {
//         const end = new Date(`${Number(year) + 1}-01-01`);

//         where.date = {
//           gte: start,
//           lt: end
//         };
//       }
//     }

//     // 🏷 CATEGORY FILTER
//     if (categoryId && categoryId !== '') {
//       const catId = parseInt(categoryId, 10);
//       if (!isNaN(catId)) {
//         where.categoryId = catId;
//       }
//     }

//     const expenses = await prisma.expense.findMany({
//       where,
//       include: { category: true },
//       orderBy: { date: 'desc' }
//     });

//     return NextResponse.json({ expenses });

//   } catch (e) {
//     console.error("API ERROR:", e);
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }
// ✅ SINGLE GET (Search + Filter combined)
export async function GET(req) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || searchParams.get('q');
    const month = searchParams.get('month'); // 1-12 OR YYYY-MM
    const year = searchParams.get('year');
    const period = searchParams.get('period');
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

    // 📅 MONTH + YEAR FILTER
    if (month && year) {
      const m = Number(month); // April = 4
      const y = Number(year);

      if (!isNaN(m) && !isNaN(y) && m >= 1 && m <= 12) {
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 1);

        where.date = {
          gte: start,
          lt: end
        };
      }
    }

    // 📅 SUPPORT OLD FORMAT: month=2026-04
    else if (month && month.includes('-')) {
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
    else if (period === 'year' && year) {
      const y = Number(year);

      if (!isNaN(y)) {
        const start = new Date(y, 0, 1);
        const end = new Date(y + 1, 0, 1);

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

    // Validate amount
    const amount = Number(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Validate categoryId
    const categoryId = body.categoryId !== undefined ? Number(body.categoryId) : NaN;
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid or missing categoryId' }, { status: 400 });
    }

    // Verify category exists and belongs to this user
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    if (category.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to use this category' }, { status: 403 });
    }

    // Validate date
    const date = body.date ? new Date(body.date) : new Date();
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        amount,
        categoryId,
        description: body.description || '',
        date,
        userId: user.id
      }
    });

    return NextResponse.json({ expense });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
// delete expance 