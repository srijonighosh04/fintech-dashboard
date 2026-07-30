'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/features/plaid/actions/plaidActions';
import { logAuditEventAction } from '@/features/security/actions/securityActions';

export interface FraudCaseRecord {
  id: string;
  userId: string;
  transactionId: string;
  riskScore: number;
  confidenceScore: number;
  reasons: string; // JSON list
  explanation: string;
  status: string; // UNDER_REVIEW | APPROVED | CONFIRMED_FRAUD
  createdAt: Date;
  updatedAt: Date;
  transaction?: {
    id: string;
    amount: number;
    name: string;
    category: string;
    date: Date;
  } | null;
}

/**
 * Retrieves flagged fraud cases for a user, merging transaction descriptors.
 */
export async function getFraudCasesAction(userId: string): Promise<FraudCaseRecord[]> {
  try {
    if (!userId) return [];

    const cases = await prisma.fraudCase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const txIds = cases.map((c) => c.transactionId);
    const txs = await prisma.transaction.findMany({
      where: { id: { in: txIds } },
    });

    return cases.map((c) => ({
      ...c,
      transaction: txs.find((t) => t.id === c.transactionId) || null,
    }));
  } catch (error) {
    console.error('getFraudCasesAction error:', error);
    return [];
  }
}

/**
 * Resolves a flagged fraud case status (e.g. APPROVED by user or CONFIRMED_FRAUD).
 */
export async function updateFraudCaseStatusAction(
  userId: string,
  caseId: string,
  status: 'APPROVED' | 'CONFIRMED_FRAUD'
): Promise<ActionResponse> {
  try {
    if (!userId) return { success: false, error: 'Unauthorized.' };

    const originalCase = await prisma.fraudCase.findUnique({
      where: { id: caseId },
    });

    if (!originalCase) {
      return { success: false, error: 'Case not found.' };
    }

    const updated = await prisma.fraudCase.update({
      where: { id: caseId },
      data: { status, updatedAt: new Date() },
    });

    // If confirmed fraud, update transaction status to 'failed'
    if (status === 'CONFIRMED_FRAUD') {
      await prisma.transaction.update({
        where: { id: originalCase.transactionId },
        data: { status: 'failed' },
      });
    }

    // Log the security audit log from Phase 9
    await logAuditEventAction(userId, `FRAUD_CASE_RESOLVED_${status}`, {
      caseId,
      transactionId: originalCase.transactionId,
    });

    revalidatePath('/dashboard/fraud');
    revalidatePath('/dashboard');
    revalidatePath('/transactions');

    return { success: true, data: updated };
  } catch (error) {
    console.error('updateFraudCaseStatusAction error:', error);
    return { success: false, error: 'Failed to update fraud case.' };
  }
}

/**
 * Aggregates analytical datasets for fraud center chart widgets.
 */
export async function getFraudAnalyticsAction(userId: string) {
  try {
    if (!userId) {
      return { trendData: [], distributionData: [], stats: { total: 0, flagged: 0, resolved: 0 } };
    }

    const cases = await prisma.fraudCase.findMany({
      where: { userId },
    });

    const totalCount = await prisma.transaction.count({
      where: { account: { bank: { userId } } },
    });

    const flaggedCount = cases.filter((c) => c.status === 'UNDER_REVIEW').length;
    const resolvedCount = cases.filter((c) => c.status !== 'UNDER_REVIEW').length;

    // 1. Calculate risk score distribution
    const distribution = [
      { name: 'Low Risk (<50%)', value: 0 },
      { name: 'Medium Risk (50-75%)', value: 0 },
      { name: 'High Risk (>75%)', value: 0 },
    ];

    cases.forEach((c) => {
      if (c.riskScore < 50) {
        distribution[0].value += 1;
      } else if (c.riskScore <= 75) {
        distribution[1].value += 1;
      } else {
        distribution[2].value += 1;
      }
    });

    // 2. Calculate daily trends (last 7 days)
    const trendData: { date: string; flagged: number; riskAvg: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayCases = cases.filter(
        (c) => c.createdAt.toISOString().split('T')[0] === dateStr
      );

      const riskAvg =
        dayCases.length > 0
          ? Math.round(dayCases.reduce((sum, c) => sum + c.riskScore, 0) / dayCases.length)
          : 0;

      trendData.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        flagged: dayCases.length,
        riskAvg,
      });
    }

    return {
      trendData,
      distributionData: distribution,
      stats: {
        total: totalCount,
        flagged: flaggedCount,
        resolved: resolvedCount,
      },
    };
  } catch (error) {
    console.error('getFraudAnalyticsAction error:', error);
    return {
      trendData: [],
      distributionData: [],
      stats: { total: 0, flagged: 0, resolved: 0 },
    };
  }
}
