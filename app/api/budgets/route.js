import prisma from "@/lib/prisma";

// GET budgets
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get("userId"));

    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return Response.json({ budgets });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST create/update budget
export async function POST(req) {
  try {
    const { category, amount, userId } = await req.json();

    const month = new Date().toISOString().slice(0, 7);

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month: {
          userId: Number(userId),
          category,
          month
        }
      },
      update: {
        amount: Number(amount)
      },
      create: {
        userId: Number(userId),
        category,
        amount: Number(amount),
        month
      }
    });

    return Response.json({ budget });

  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}