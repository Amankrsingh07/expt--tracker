import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getUserFromRequest } from "../../../lib/auth";

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export async function POST(req) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { category, monthlyBudget } = await req.json();

    if (!category || monthlyBudget == null) {
      return NextResponse.json(
        { error: "Missing category or monthlyBudget" },
        { status: 400 }
      );
    }

    const month = getCurrentMonth();

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month: {
          userId: user.id,
          category,
          month,
        },
      },
      update: {
        amount: Number(monthlyBudget),
      },
      create: {
        userId: user.id,
        category,
        amount: Number(monthlyBudget),
        month,
      },
    });

    return NextResponse.json({ budget });
  } catch (error) {
    console.error("Category Budget Error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to update category budget" },
      { status: 500 }
    );
  }
}

// export async function GET(req) {
//   const user = await getUserFromRequest(req);

//   if (!user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const { searchParams } = new URL(req.url);
//     const month = searchParams.get("month") || getCurrentMonth();

//     const budgets = await prisma.budget.findMany({
//       where: {
//         userId: user.id,
//         month,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return NextResponse.json({ budgets });
//   } catch (error) {
//     console.error("Category Budget Fetch Error:", error);

//     return NextResponse.json(
//       { error: error.message || "Failed to fetch category budgets" },
//       { status: 500 }
//     );
//   }
// }
export async function GET(req) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const month =
      searchParams.get("month") || new Date().toISOString().slice(0, 7);

    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ budgets });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}