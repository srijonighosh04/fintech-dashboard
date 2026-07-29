'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/features/plaid/actions/plaidActions';
import { z } from 'zod';

const BillSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().min(1, 'Select due date'),
});

const RuleSchema = z.object({
  triggerType: z.enum(['BALANCE_BELOW', 'SPENDING_EXCEEDS']),
  triggerValue: z.number().positive('Trigger threshold must be positive'),
  actionType: z.enum(['ALERT_INBOX', 'AUTO_TRANSFER']),
  actionDetails: z.string().min(1, 'Details are required'),
});

/**
 * Scans historical user transactions and detects recurring subscriptions.
 */
export async function detectRecurringPaymentsAction(userId: string): Promise<ActionResponse> {
  try {
    if (!userId) return { success: false, error: 'Unauthorized context.' };

    const banks = await prisma.bank.findMany({
      where: { userId },
      include: { accounts: true },
    });

    const accountIds = banks.flatMap((b) => b.accounts.map((a) => a.id));
    if (accountIds.length === 0) {
      return { success: true, data: [] };
    }

    // Fetch positive transactions (expenses)
    const transactions = await prisma.transaction.findMany({
      where: {
        accountId: { in: accountIds },
        amount: { gt: 0 },
      },
      orderBy: { date: 'asc' },
    });

    // Group transactions by simplified merchant name
    const groups: Record<string, typeof transactions> = {};
    transactions.forEach((tx) => {
      // Simplify name: lowercase and strip dates/numbers
      const cleanName = tx.name
        .toLowerCase()
        .replace(/\d+/g, '')
        .replace(/(com|net|org|store|ltd|inc|llc|bill|payment|auto|debit)/gi, '')
        .trim();
      
      if (cleanName.length < 2) return;

      if (!groups[cleanName]) {
        groups[cleanName] = [];
      }
      groups[cleanName].push(tx);
    });

    const detectedSubscriptions: {
      name: string;
      amount: number;
      frequency: string;
      category: string;
      nextPaymentDate: Date;
    }[] = [];

    // Analyze each merchant group for recurring intervals
    for (const [merchant, txs] of Object.entries(groups)) {
      if (txs.length < 2) continue;

      // Calculate intervals in days between consecutive dates
      const intervals: number[] = [];
      for (let i = 1; i < txs.length; i++) {
        const diffTime = txs[i].date.getTime() - txs[i - 1].date.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        intervals.push(diffDays);
      }

      // Check if intervals average roughly 25-35 days (Monthly)
      const avgInterval = intervals.reduce((sum, d) => sum + d, 0) / intervals.length;
      const amountVariance = txs.every((t) => Math.abs(t.amount - txs[0].amount) < txs[0].amount * 0.08); // 8% amount tolerance

      if (avgInterval >= 25 && avgInterval <= 35 && amountVariance) {
        // Monthly detected
        const lastTx = txs[txs.length - 1];
        const nextPaymentDate = new Date(lastTx.date);
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

        detectedSubscriptions.push({
          name: merchant.toUpperCase(),
          amount: lastTx.amount,
          frequency: 'MONTHLY',
          category: lastTx.category.split(',')[0] || 'Utilities & Others',
          nextPaymentDate,
        });
      }
    }

    // Save detected subscriptions to database
    for (const sub of detectedSubscriptions) {
      // Prevent duplicates
      const existing = await prisma.subscription.findFirst({
        where: {
          userId,
          name: sub.name,
        },
      });

      if (!existing) {
        await prisma.subscription.create({
          data: {
            userId,
            name: sub.name,
            amount: sub.amount,
            frequency: sub.frequency,
            category: sub.category,
            nextPaymentDate: sub.nextPaymentDate,
          },
        });
      }
    }

    revalidatePath('/automation');
    return { success: true, data: detectedSubscriptions };
  } catch (error) {
    console.error('detectRecurringPaymentsAction error:', error);
    return { success: false, error: 'Failed to scan recurring payments.' };
  }
}

/**
 * Retrieves the user's active subscriptions list.
 */
export async function getSubscriptionsAction(userId: string) {
  try {
    if (!userId) return [];
    return await prisma.subscription.findMany({
      where: { userId },
      orderBy: { nextPaymentDate: 'asc' },
    });
  } catch (error) {
    console.error('getSubscriptionsAction error:', error);
    return [];
  }
}

/**
 * Upgrades subscription status.
 */
export async function toggleSubscriptionAction(subId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<ActionResponse> {
  try {
    await prisma.subscription.update({
      where: { id: subId },
      data: { status, updatedAt: new Date() },
    });
    revalidatePath('/automation');
    return { success: true };
  } catch (error) {
    console.error('toggleSubscriptionAction error:', error);
    return { success: false, error: 'Failed to update subscription.' };
  }
}

/**
 * Retrieves user upcoming bills.
 */
export async function getBillsAction(userId: string) {
  try {
    if (!userId) return [];
    return await prisma.bill.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' },
    });
  } catch (error) {
    console.error('getBillsAction error:', error);
    return [];
  }
}

/**
 * Creates an upcoming bill entry.
 */
export async function createBillAction(
  userId: string,
  name: string,
  amount: number,
  dueDate: string,
): Promise<ActionResponse> {
  try {
    if (!userId) return { success: false, error: 'Unauthorized.' };
    const validation = BillSchema.safeParse({ name, amount, dueDate });
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const bill = await prisma.bill.create({
      data: {
        userId,
        name,
        amount,
        dueDate: new Date(dueDate),
        status: 'UNPAID',
      },
    });

    // Automatically trigger notification for upcoming bill
    await prisma.notification.create({
      data: {
        userId,
        type: 'UPCOMING_BILL',
        title: 'Upcoming Bill Scheduled',
        message: `Your bill for ${name} ($${amount.toFixed(2)}) is due on ${dueDate}.`,
      },
    });

    revalidatePath('/automation');
    return { success: true, data: bill };
  } catch (error) {
    console.error('createBillAction error:', error);
    return { success: false, error: 'Failed to create bill reminder.' };
  }
}

/**
 * Toggles a bill to PAID status.
 */
export async function payBillAction(billId: string): Promise<ActionResponse> {
  try {
    const bill = await prisma.bill.update({
      where: { id: billId },
      data: { status: 'PAID', updatedAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        userId: bill.userId,
        type: 'UPCOMING_BILL',
        title: 'Bill Paid',
        message: `Your payment of $${bill.amount.toFixed(2)} to ${bill.name} has been processed successfully.`,
      },
    });

    revalidatePath('/automation');
    return { success: true };
  } catch (error) {
    console.error('payBillAction error:', error);
    return { success: false, error: 'Failed to record bill payment.' };
  }
}

/**
 * Deletes a bill reminder entry.
 */
export async function deleteBillAction(billId: string): Promise<ActionResponse> {
  try {
    await prisma.bill.delete({
      where: { id: billId },
    });
    revalidatePath('/automation');
    return { success: true };
  } catch (error) {
    console.error('deleteBillAction error:', error);
    return { success: false, error: 'Failed to delete bill.' };
  }
}

/**
 * Retrieves current notifications list for a user.
 */
export async function getNotificationsAction(userId: string) {
  try {
    if (!userId) return [];
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  } catch (error) {
    console.error('getNotificationsAction error:', error);
    return [];
  }
}

/**
 * Sets a specific notification status as read.
 */
export async function markNotificationReadAction(notificationId: string): Promise<ActionResponse> {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    revalidatePath('/automation');
    return { success: true };
  } catch (error) {
    console.error('markNotificationReadAction error:', error);
    return { success: false, error: 'Failed to update alert.' };
  }
}

/**
 * Marks all notification alerts as read.
 */
export async function markAllNotificationsReadAction(userId: string): Promise<ActionResponse> {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    revalidatePath('/automation');
    return { success: true };
  } catch (error) {
    console.error('markAllNotificationsReadAction error:', error);
    return { success: false, error: 'Failed to clear notifications.' };
  }
}

/**
 * Retrieves the active automation rules list.
 */
export async function getAutomationRulesAction(userId: string) {
  try {
    if (!userId) return [];
    return await prisma.automationRule.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('getAutomationRulesAction error:', error);
    return [];
  }
}

/**
 * Creates an automation trigger rule.
 */
export async function createAutomationRuleAction(
  userId: string,
  triggerType: 'BALANCE_BELOW' | 'SPENDING_EXCEEDS',
  triggerValue: number,
  actionType: 'ALERT_INBOX' | 'AUTO_TRANSFER',
  actionDetails: string,
): Promise<ActionResponse> {
  try {
    if (!userId) return { success: false, error: 'Unauthorized.' };
    const validation = RuleSchema.safeParse({ triggerType, triggerValue, actionType, actionDetails });
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const rule = await prisma.automationRule.create({
      data: {
        userId,
        triggerType,
        triggerValue,
        actionType,
        actionDetails,
        isActive: true,
      },
    });

    revalidatePath('/automation');
    return { success: true, data: rule };
  } catch (error) {
    console.error('createAutomationRuleAction error:', error);
    return { success: false, error: 'Failed to create automation rule.' };
  }
}

/**
 * Deletes an automation rule.
 */
export async function deleteAutomationRuleAction(ruleId: string): Promise<ActionResponse> {
  try {
    await prisma.automationRule.delete({
      where: { id: ruleId },
    });
    revalidatePath('/automation');
    return { success: true };
  } catch (error) {
    console.error('deleteAutomationRuleAction error:', error);
    return { success: false, error: 'Failed to remove rule.' };
  }
}

/**
 * Checks rules triggers for withdrawal limits, salary received, or low balance thresholds.
 */
export async function processAutomationTriggers(
  userId: string,
  amount: number,
  category: string,
  merchant: string,
) {
  try {
    // 1. Check Large Withdrawal trigger (over $500)
    if (amount >= 500) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'LARGE_WITHDRAWAL',
          title: 'Large Withdrawal Alert',
          message: `An outgoing charge of $${amount.toFixed(2)} was registered at ${merchant}.`,
        },
      });
    }

    // 2. Check Salary Received trigger (incoming amount < 0 in Plaid terms)
    if (amount <= -1000) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'SALARY_RECEIVED',
          title: 'Direct Deposit Received',
          message: `A deposit of $${Math.abs(amount).toFixed(2)} was credited to your account from ${merchant}.`,
        },
      });
    }

    // 3. Check Budget limits check
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const budget = await prisma.budget.findFirst({
      where: {
        userId,
        category,
        month: currentMonth,
        year: currentYear,
      },
    });

    if (budget) {
      // Gather actual spent in this category
      const banks = await prisma.bank.findMany({ where: { userId }, include: { accounts: true } });
      const accountIds = banks.flatMap((b) => b.accounts.map((a) => a.id));
      const transactions = await prisma.transaction.findMany({
        where: {
          accountId: { in: accountIds },
          date: {
            gte: new Date(currentYear, currentMonth - 1, 1),
            lte: new Date(currentYear, currentMonth, 0, 23, 59, 59, 999),
          },
          amount: { gt: 0 },
        },
      });

      let spentSum = 0;
      transactions.forEach((tx) => {
        if (tx.category.toLowerCase().includes(category.split(' ')[0].toLowerCase())) {
          spentSum += tx.amount;
        }
      });

      if (spentSum > budget.limit) {
        await prisma.notification.create({
          data: {
            userId,
            type: 'BUDGET_EXCEEDED',
            title: 'Budget Threshold Breached',
            message: `Spending in ${category} ($${spentSum.toFixed(2)}) has exceeded your monthly budget of $${budget.limit.toFixed(2)}.`,
          },
        });
      }
    }
  } catch (err) {
    console.error('processAutomationTriggers failure:', err);
  }
}
