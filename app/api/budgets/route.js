import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getUserFromRequest } from "../../../lib/auth";

export async function GET(req) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month,
      },
      orderBy: {
        category: "asc",
      },
    });

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error("GET CATEGORY BUDGET ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const category = body.category;
    const amount = Number(body.amount ?? body.monthlyBudget);
    const month = body.month || new Date().toISOString().slice(0, 7);

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month: {
          userId: user.id,
          category,
          month,
        },
      },
      update: {
        amount,
      },
      create: {
        userId: user.id,
        category,
        amount,
        month,
      },
    });

    return NextResponse.json({ budget });
  } catch (error) {
    console.error("POST CATEGORY BUDGET ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}