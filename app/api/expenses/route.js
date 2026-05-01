import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getUserFromRequest } from "../../../lib/auth";

// ✅ GET EXPENSES MONTH-WISE
export async function GET(req) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || searchParams.get("q");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const period = searchParams.get("period");

    const fromDate = searchParams.get("fromDate") || searchParams.get("from");
    const toDate = searchParams.get("toDate") || searchParams.get("to");

    const categoryId = searchParams.get("categoryId");
    const categoryName = searchParams.get("category");
    const min = searchParams.get("min");
    const max = searchParams.get("max");

    const where = {
      userId: user.id,
    };

    // 🔍 Search
    if (search) {
      where.OR = [
        {
          description: {
            contains: search,
          },
        },
        {
          category: {
            name: {
              contains: search,
            },
          },
        },
      ];
    }

    // 📅 Date range
    if (fromDate && toDate) {
      const start = new Date(`${fromDate}T00:00:00.000Z`);
      const end = new Date(`${toDate}T00:00:00.000Z`);
      end.setUTCDate(end.getUTCDate() + 1);

      where.date = {
        gte: start,
        lt: end,
      };
    }

    // 📅 Only from date
    else if (fromDate) {
      const start = new Date(`${fromDate}T00:00:00.000Z`);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);

      where.date = {
        gte: start,
        lt: end,
      };
    }

    // 📅 Month filter: 2026-05
    else if (month && /^\d{4}-\d{2}$/.test(month)) {
      const start = new Date(`${month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setUTCMonth(end.getUTCMonth() + 1);

      where.date = {
        gte: start,
        lt: end,
      };
    }

    // 📅 Year filter
    else if (period === "year" && year) {
      const y = Number(year);

      if (!isNaN(y)) {
        const start = new Date(`${y}-01-01T00:00:00.000Z`);
        const end = new Date(`${y + 1}-01-01T00:00:00.000Z`);

        where.date = {
          gte: start,
          lt: end,
        };
      }
    }

    // 🏷 Category by ID
    if (categoryId && categoryId !== "all") {
      const catId = Number(categoryId);
      if (!isNaN(catId)) {
        where.categoryId = catId;
      }
    }

    // 🏷 Category by name
    if (categoryName && categoryName !== "all") {
      where.category = {
        name: categoryName,
      };
    }

    // 💰 Amount range
    if (min || max) {
      where.amount = {};

      if (min) {
        const minAmount = Number(min);
        if (!isNaN(minAmount)) where.amount.gte = minAmount;
      }

      if (max) {
        const maxAmount = Number(max);
        if (!isNaN(maxAmount)) where.amount.lte = maxAmount;
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ expenses });
  } catch (e) {
    console.error("EXPENSE GET ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ CREATE EXPENSE
export async function POST(req) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const amount = Number(body.amount);
    const categoryId = Number(body.categoryId);

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: user.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const expenseDate = body.date
      ? new Date(`${body.date}T00:00:00.000Z`)
      : new Date();

    if (isNaN(expenseDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        amount,
        categoryId,
        description: body.description || "",
        date: expenseDate,
        userId: user.id,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (e) {
    console.error("EXPENSE POST ERROR:", e);
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}