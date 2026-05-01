import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getUserFromRequest } from "../../../lib/auth";

export async function GET(req) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  let where = { userId: user.id };

  if (month) {
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);

    where.date = {
      gte: start,
      lt: end,
    };
  }

  const incomes = await prisma.income.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ incomes });
}

export async function POST(req) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { amount, source, date } = await req.json();

    const incomeAmount = Number(amount);

    if (isNaN(incomeAmount) || incomeAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!source || source.trim() === "") {
      return NextResponse.json({ error: "Source is required" }, { status: 400 });
    }

    let incomeDate;

    if (date) {
      incomeDate = new Date(`${date}T00:00:00.000Z`);
    } else {
      incomeDate = new Date();
    }

    if (isNaN(incomeDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Send date as YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const income = await prisma.income.create({
      data: {
        userId: user.id,
        amount: incomeAmount,
        source: source.trim(),
        date: incomeDate,
      },
    });

    return NextResponse.json({ income }, { status: 201 });
  } catch (error) {
    console.error("Income Create Error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create income" },
      { status: 500 }
    );
  }
}