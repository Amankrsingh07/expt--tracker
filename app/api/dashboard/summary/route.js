import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

/**
 * GET /api/dashboard/summary
 * Returns comprehensive financial overview:
 * - Total Income (all sources: salary, freelance, business, etc.)
 * - Total Expenses (all categories)
 * - Category-wise expense breakdown
 * - Budget allocation & tracking (category-wise)
 * - Remaining budget per category
 * - Overall budget status
 */
export async function GET(req) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear());

    // 📊 1. FETCH ALL INCOMES (Total income from all sources)
    const incomes = await prisma.income.findMany({
      where: { userId: user.id },
      select: { id: true, amount: true, source: true, date: true }
    });

    // 📊 2. FETCH EXPENSES FOR MONTH WITH CATEGORIES
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const expenses = await prisma.expense.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      include: { category: true }
    });

    // 📊 3. FETCH BUDGET LIMITS (Overall limit)
    const budgetLimit = await prisma.limit.findUnique({
      where: { userId: user.id }
    });

    // 📊 4. FETCH CATEGORY BUDGETS (Category-wise budget allocation if exists)
    let categoryBudgets = [];
    try {
      categoryBudgets = await prisma.categoryBudget.findMany({
        where: { userId: user.id }
      });
    } catch (err) {
      // CategoryBudget table might not exist yet
      categoryBudgets = [];
    }

    // 💰 CALCULATIONS

    // Total income from all sources
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

    // Income source breakdown
    const incomeBySource = {};
    incomes.forEach(inc => {
      const source = inc.source || 'Other';
      if (!incomeBySource[source]) {
        incomeBySource[source] = 0;
      }
      incomeBySource[source] += inc.amount;
    });

    // Total expenses
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Category-wise expense breakdown
    const expensesByCategory = {};
    const categoryDetails = {};

    expenses.forEach(exp => {
      const catName = exp.category?.name || 'Uncategorized';
      const catId = exp.category?.id;

      if (!expensesByCategory[catName]) {
        expensesByCategory[catName] = 0;
        categoryDetails[catName] = { id: catId, expenses: [] };
      }
      expensesByCategory[catName] += exp.amount;
      categoryDetails[catName].expenses.push({
        id: exp.id,
        amount: exp.amount,
        description: exp.description,
        date: exp.date
      });
    });

    // Budget tracking with allocations
    const budgetTracking = {};
    const categoryBudgetMap = {};

    categoryBudgets.forEach(cb => {
      categoryBudgetMap[cb.categoryId] = cb.monthlyBudget;
    });

    Object.entries(expensesByCategory).forEach(([catName, spent]) => {
      const catId = categoryDetails[catName]?.id;
      const allocated = categoryBudgetMap[catId] || 0;
      const remaining = allocated - spent;
      const percentUsed = allocated > 0 ? (spent / allocated) * 100 : 0;

      budgetTracking[catName] = {
        categoryId: catId,
        allocated,
        spent,
        remaining,
        percentUsed: Math.round(percentUsed)
      };
    });

    // Overall budget status
    const monthlyLimit = budgetLimit?.monthlyLimit || 0;
    const remainingBudget = monthlyLimit - totalExpenses;
    const percentBudgetUsed = monthlyLimit > 0 ? (totalExpenses / monthlyLimit) * 100 : 0;

    // Calculate savings
    const totalSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

    return NextResponse.json({
      period: { month, year },
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
        percentUsed: Math.round(percentBudgetUsed),
        categoryBudgets: budgetTracking
      },
      savings: {
        total: totalSavings,
        rate: Math.round(savingsRate * 100) / 100
      },
      status: {
        isBudgetExceeded: totalExpenses > monthlyLimit && monthlyLimit > 0,
        warning: totalExpenses > monthlyLimit * 0.8 ? 'Approaching budget limit' : null
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
