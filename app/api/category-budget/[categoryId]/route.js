import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getUserFromRequest } from "../../../../lib/auth";

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export async function DELETE(req, context) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;
    const categoryName = decodeURIComponent(params.categoryId);
    const month = getCurrentMonth();

    const budget = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        category: categoryName,
        month,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      );
    }

    await prisma.budget.delete({
      where: {
        id: budget.id,
      },
    });

    return NextResponse.json({
      message: "Budget deleted successfully",
      deleted: true,
    });
  } catch (error) {
    console.error("Category Budget Delete Error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to delete category budget" },
      { status: 500 }
    );
  }
}

export async function GET(req, context) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;
    const categoryName = decodeURIComponent(params.categoryId);
    const month = getCurrentMonth();

    const budget = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        category: categoryName,
        month,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ budget });
  } catch (error) {
    console.error("Category Budget Fetch Error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch category budget" },
      { status: 500 }
    );
  }
}

export async function PUT(req, context) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;
    const categoryName = decodeURIComponent(params.categoryId);
    const { monthlyBudget } = await req.json();

    if (monthlyBudget == null || Number(monthlyBudget) < 0) {
      return NextResponse.json(
        { error: "Monthly budget must be valid" },
        { status: 400 }
      );
    }

    const month = getCurrentMonth();

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month: {
          userId: user.id,
          category: categoryName,
          month,
        },
      },
      update: {
        amount: Number(monthlyBudget),
      },
      create: {
        userId: user.id,
        category: categoryName,
        amount: Number(monthlyBudget),
        month,
      },
    });

    return NextResponse.json({
      message: "Budget updated successfully",
      budget,
    });
  } catch (error) {
    console.error("Category Budget Update Error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to update category budget" },
      { status: 500 }
    );
  }
}