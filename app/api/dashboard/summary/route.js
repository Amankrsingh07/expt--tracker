import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

export async function GET(req) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const month =
      searchParams.get('month') || new Date().toISOString().slice(0, 7);

    const year = Number(month.slice(0, 4));

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // ✅ Income for selected month
    const incomes = await prisma.income.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      select: {
        id: true,
        amount: true,
        source: true,
        date: true
      }
    });

    // ✅ Expenses for selected month
    const expenses = await prisma.expense.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      include: {
        category: true
      }
    });

    // ✅ Budgets for selected month
    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month
      }
    });

    // =====================
    // INCOME CALCULATION
    // =====================
    const totalIncome = incomes.reduce(
      (sum, inc) => sum + Number(inc.amount || 0),
      0
    );

    const incomeBySource = {};

    incomes.forEach((inc) => {
      const source = inc.source || 'Other';
      incomeBySource[source] =
        (incomeBySource[source] || 0) + Number(inc.amount || 0);
    });

    // =====================
    // EXPENSE CALCULATION
    // =====================
    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount || 0),
      0
    );

    const expensesByCategory = {};
    const categoryDetails = {};

    expenses.forEach((exp) => {
      const catName = exp.category?.name || 'Uncategorized';

      if (!expensesByCategory[catName]) {
        expensesByCategory[catName] = 0;
        categoryDetails[catName] = {
          expenses: []
        };
      }

      expensesByCategory[catName] += Number(exp.amount || 0);

      categoryDetails[catName].expenses.push({
        id: exp.id,
        amount: Number(exp.amount || 0),
        description: exp.description,
        date: exp.date
      });
    });

    // =====================
    // BUDGET CALCULATION
    // =====================
    const budgetTracking = {};

    budgets.forEach((b) => {
      const categoryName = b.category;
      const allocated = Number(b.amount || 0);
      const spent = Number(expensesByCategory[categoryName] || 0);
      const remaining = allocated - spent;

      budgetTracking[categoryName] = {
        allocated,
        spent,
        remaining,
        percentUsed:
          allocated > 0 ? Math.round((spent / allocated) * 100) : 0
      };
    });

    // ✅ Also show expense categories even if budget not set
    Object.entries(expensesByCategory).forEach(([categoryName, spent]) => {
      if (!budgetTracking[categoryName]) {
        budgetTracking[categoryName] = {
          allocated: 0,
          spent: Number(spent || 0),
          remaining: -Number(spent || 0),
          percentUsed: 0
        };
      }
    });

    const monthlyLimit = budgets.reduce(
      (sum, b) => sum + Number(b.amount || 0),
      0
    );

    const remainingBudget = monthlyLimit - totalExpenses;

    const percentBudgetUsed =
      monthlyLimit > 0
        ? Math.round((totalExpenses / monthlyLimit) * 100)
        : 0;

    // =====================
    // SAVINGS
    // =====================
    const totalSavings = totalIncome - totalExpenses;

    const savingsRate =
      totalIncome > 0
        ? Math.round((totalSavings / totalIncome) * 100)
        : 0;

    return NextResponse.json({
      period: {
        month,
        year
      },

      income: {
        total: totalIncome,
        bySource: incomeBySource,
        count: incomes.length
      },

      expenses: {
        total: totalExpenses,
        byCategory: expensesByCategory,
        categoryDetails,
        count: expenses.length
      },

      budget: {
        monthlyLimit,
        spent: totalExpenses,
        remaining: remainingBudget,
        percentUsed: percentBudgetUsed,
        categoryBudgets: budgetTracking
      },

      savings: {
        total: totalSavings,
        rate: savingsRate
      },

      status: {
        isBudgetExceeded:
          monthlyLimit > 0 && totalExpenses > monthlyLimit,

        warning:
          monthlyLimit > 0 && totalExpenses > monthlyLimit
            ? 'Budget exceeded'
            : monthlyLimit > 0 && totalExpenses > monthlyLimit * 0.8
            ? 'Approaching budget limit'
            : null
      }
    });
  } catch (error) {
    console.error('Dashboard Summary Error:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}