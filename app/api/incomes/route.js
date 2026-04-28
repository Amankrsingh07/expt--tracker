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
    const month = searchParams.get("month");

    let dateFilter = {};

    if (month) {
      const startDate = new Date(`${month}-01T00:00:00`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      dateFilter = {
        date: {
          gte: startDate,
          lt: endDate,
        },
      };
    }

    const incomes = await prisma.income.findMany({
      where: {
        userId: user.id,
        ...dateFilter,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ incomes });
  } catch (error) {
    console.error("Income Fetch Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch incomes" },
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
    const { amount, source, date } = await req.json();

    if (!amount || !source) {
      return NextResponse.json(
        { error: "Amount and source are required" },
        { status: 400 }
      );
    }

    const income = await prisma.income.create({
      data: {
        userId: user.id,
        amount: Number(amount),
        source,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ income }, { status: 201 });
  } catch (error) {
    console.error("Income Create Error:", error);

    return NextResponse.json(
      { error: "Failed to create income" },
      { status: 500 }
    );
  }
}