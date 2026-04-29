import prisma from '@/lib/prisma';

// ✅ GET budgets month-wise
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = Number(searchParams.get('userId'));
    const month =
      searchParams.get('month') || new Date().toISOString().slice(0, 7);

    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json({ budgets });
  } catch (error) {
    console.error('GET BUDGET ERROR:', error);
    return Response.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// ✅ CREATE / UPDATE budget month-wise
export async function POST(req) {
  try {
    const body = await req.json();

    const userId = Number(body.userId);
    const category = body.category;
    const amount = Number(body.amount);
    const month = body.month || new Date().toISOString().slice(0, 7);

    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!category) {
      return Response.json(
        { error: 'category is required' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return Response.json(
        { error: 'amount is required' },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month: {
          userId,
          category,
          month
        }
      },
      update: {
        amount
      },
      create: {
        userId,
        category,
        amount,
        month
      }
    });

    return Response.json({ budget });
  } catch (error) {
    console.error('POST BUDGET ERROR:', error);
    return Response.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// ✅ DELETE budget
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);

    const id = Number(searchParams.get('id'));

    if (!id) {
      return Response.json(
        { error: 'Budget id is required' },
        { status: 400 }
      );
    }

    await prisma.budget.delete({
      where: { id }
    });

    return Response.json({
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('DELETE BUDGET ERROR:', error);
    return Response.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}