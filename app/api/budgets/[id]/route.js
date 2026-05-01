import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getUserFromRequest } from "../../../../lib/auth";

export async function DELETE(req, { params }) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const category = decodeURIComponent(id);

    const { searchParams } = new URL(req.url);
    const month =
      searchParams.get("month") || new Date().toISOString().slice(0, 7);

    const existing = await prisma.budget.findUnique({
      where: {
        userId_category_month: {
          userId: user.id,
          category,
          month,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: `No budget found for ${category} in ${month}` },
        { status: 404 }
      );
    }

    await prisma.budget.delete({
      where: {
        userId_category_month: {
          userId: user.id,
          category,
          month,
        },
      },
    });

    return NextResponse.json({
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("DELETE BUDGET ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Failed to delete budget" },
      { status: 500 }
    );
  }
}