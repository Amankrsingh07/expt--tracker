import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

/**
 * POST /api/category-budget
 * Create or update category-wise budget allocation
 */
export async function POST(req) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { categoryId, monthlyBudget } = await req.json();

    if (!categoryId || monthlyBudget == null) {
      return NextResponse.json(
        { error: 'Missing categoryId or monthlyBudget' },
        { status: 400 }
      );
    }

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id: parseInt(categoryId), userId: user.id }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Create or update category budget
    // First, check if it exists
    const existing = await prisma.categoryBudget.findFirst({
      where: { 
        categoryId: parseInt(categoryId), 
        userId: user.id 
      }
    });

    const budget = existing 
      ? await prisma.categoryBudget.update({
          where: { id: existing.id },
          data: { monthlyBudget: Number(monthlyBudget) }
        })
      : await prisma.categoryBudget.create({
          data: {
            categoryId: parseInt(categoryId),
            userId: user.id,
            monthlyBudget: Number(monthlyBudget)
          }
        });

    return NextResponse.json({ budget });
  } catch (error) {
    console.error('Category Budget Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update category budget' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/category-budget
 * Get all category budgets for user
 */
export async function GET(req) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const budgets = await prisma.categoryBudget.findMany({
      where: { userId: user.id },
      include: { category: true }
    }).catch(() => []);

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error('Category Budget Fetch Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch category budgets' },
      { status: 500 }
    );
  }
}
