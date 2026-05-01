import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getUserFromRequest } from "../../../../lib/auth";

// ✅ GET SINGLE EXPENSE
export async function GET(req, { params }) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const expenseId = Number(id);

    if (isNaN(expenseId)) {
      return NextResponse.json({ error: "Invalid expense ID" }, { status: 400 });
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: user.id,
      },
      include: {
        category: true,
      },
    });

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ expense });
  } catch (error) {
    console.error("GET EXPENSE ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// ✅ DELETE EXPENSE
export async function DELETE(req, { params }) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const expenseId = Number(id);

    if (isNaN(expenseId)) {
      return NextResponse.json({ error: "Invalid expense ID" }, { status: 400 });
    }

    const existing = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    await prisma.expense.delete({
      where: {
        id: expenseId,
      },
    });

    return NextResponse.json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("DELETE EXPENSE ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}