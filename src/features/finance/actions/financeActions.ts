'use server';

import prisma from '@/lib/prisma';
import { ActionResponse } from '@/features/plaid/actions/plaidActions';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const BudgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  limit: z.number().positive('Budget limit must be positive'),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
});

const SavingsGoalSchema = z.object({
  name: z.string().min(2, 'Goal name must be at least 2 characters').max(50),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().nonnegative('Current savings must be positive or zero'),
  targetDate: z.string().min(1, 'Target date is required'),
});

// Category list mapping
const CATEGORIES = [
  'Rent & Housing',
  'Food & Dining',
  'Software & SaaS',
  'Entertainment',
  'Utilities & Others',
  'Infrastructure',
  'Travel',
];

/**
 * Server Action to upsert (create or update) a category budget.
 */
export async function upsertBudgetAction(
  userId: string,
  category: string,
  limit: number,
  month: number,
  year: number,
): Promise<ActionResponse> {
  try {
    if (!userId) return { success: false, error: 'Unauthorized context.' };

    const validation = BudgetSchema.safeParse({ category, limit, month, year });
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month_year: {
          userId,
          category,
          month,
          year,
        },
      },
      update: {
        limit,
        updatedAt: new Date(),
      },
      create: {
        userId,
        category,
        limit,
        month,
        year,
      },
    });

    revalidatePath('/budgets');
    return { success: true, data: budget };
  } catch (error) {
    console.error('Upsert budget error:', error);
    return { success: false, error: 'Failed to save budget.' };
  }
}

/**
 * Server Action to fetch budgets for a user for a specific month and year.
 */
export async function getBudgetsAction(userId: string, month: number, year: number) {
  try {
    if (!userId) return [];
    return await prisma.budget.findMany({
      where: {
        userId,
        month,
        year,
      },
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    return [];
  }
}

/**
 * Server Action to aggregate spending per category from actual transaction rows.
 */
export async function getCategorySpendingAction(
  userId: string,
  month: number,
  year: number,
): Promise<Record<string, number>> {
  try {
    if (!userId) return {};

    // Get user's account IDs
    const accounts = await prisma.account.findMany({
      where: {
        bank: {
          userId,
        },
      },
      select: {
        id: true,
      },
    });

    const accountIds = accounts.map((a) => a.id);
    if (accountIds.length === 0) {
      // Return empty categories mapping
      const emptySpending: Record<string, number> = {};
      CATEGORIES.forEach((cat) => {
        emptySpending[cat] = 0;
      });
      return emptySpending;
    }

    // Set date boundaries
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    // Retrieve positive transaction ledger items (spending only)
    const transactions = await prisma.transaction.findMany({
      where: {
        accountId: { in: accountIds },
        date: { gte: start, lte: end },
        amount: { gt: 0 }, // Plaid positive = expense
      },
      select: {
        amount: true,
        category: true,
      },
    });

    // Classify and aggregate transactions in memory
    const spending: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      spending[cat] = 0;
    });

    transactions.forEach((tx) => {
      let matched = false;
      
      // Match keywords in category string
      for (const cat of CATEGORIES) {
        const keyword = cat.split(' ')[0].toLowerCase();
        if (tx.category.toLowerCase().includes(keyword)) {
          spending[cat] += tx.amount;
          matched = true;
          break;
        }
      }

      if (!matched) {
        spending['Utilities & Others'] += tx.amount;
      }
    });

    return spending;
  } catch (error) {
    console.error('Aggregate spending error:', error);
    const empty: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      empty[cat] = 0;
    });
    return empty;
  }
}

/**
 * Server Action to create a new Savings Goal.
 */
export async function createSavingsGoalAction(
  userId: string,
  name: string,
  targetAmount: number,
  targetDate: string,
): Promise<ActionResponse> {
  try {
    if (!userId) return { success: false, error: 'Unauthorized context.' };

    const validation = SavingsGoalSchema.safeParse({
      name,
      targetAmount,
      currentAmount: 0,
      targetDate,
    });

    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        userId,
        name,
        targetAmount,
        currentAmount: 0,
        targetDate: new Date(targetDate),
      },
    });

    revalidatePath('/budgets');
    return { success: true, data: goal };
  } catch (error) {
    console.error('Create savings goal error:', error);
    return { success: false, error: 'Failed to create savings goal.' };
  }
}

/**
 * Server Action to edit a Savings Goal.
 */
export async function updateSavingsGoalAction(
  id: string,
  name: string,
  targetAmount: number,
  currentAmount: number,
  targetDate: string,
): Promise<ActionResponse> {
  try {
    if (!id) return { success: false, error: 'Goal ID is required.' };

    const validation = SavingsGoalSchema.safeParse({
      name,
      targetAmount,
      currentAmount,
      targetDate,
    });

    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const goal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        name,
        targetAmount,
        currentAmount,
        targetDate: new Date(targetDate),
        updatedAt: new Date(),
      },
    });

    revalidatePath('/budgets');
    return { success: true, data: goal };
  } catch (error) {
    console.error('Update savings goal error:', error);
    return { success: false, error: 'Failed to update savings goal.' };
  }
}

/**
 * Server Action to delete a Savings Goal.
 */
export async function deleteSavingsGoalAction(id: string): Promise<ActionResponse> {
  try {
    if (!id) return { success: false, error: 'Goal ID is required.' };

    await prisma.savingsGoal.delete({
      where: { id },
    });

    revalidatePath('/budgets');
    return { success: true };
  } catch (error) {
    console.error('Delete savings goal error:', error);
    return { success: false, error: 'Failed to delete savings goal.' };
  }
}

/**
 * Server Action to fetch all Savings Goals for a user.
 */
export async function getSavingsGoalsAction(userId: string) {
  try {
    if (!userId) return [];
    return await prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { targetDate: 'asc' },
    });
  } catch (error) {
    console.error('Get savings goals error:', error);
    return [];
  }
}
