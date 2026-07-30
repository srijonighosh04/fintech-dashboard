import prisma from '@/lib/prisma';
import {
  analyzeLargePurchase,
  analyzeUnusualTime,
  analyzeNewMerchant,
  analyzeImpossibleTravel,
  analyzeRapidConsecutive,
  FraudFeature,
} from './analyzers';

/**
 * Runs a transaction through the security evaluation pipeline.
 * Flags fraud cases, creates inboxes notification alerts, and compiles
 * human-readable explanations of risk indicators.
 */
export async function evaluateTransactionFraud(transactionId: string): Promise<void> {
  try {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        account: {
          include: {
            bank: true,
          },
        },
      },
    });

    if (!tx || !tx.account?.bank) return;

    const userId = tx.account.bank.userId;

    // 1. Gather historical baseline statistics
    const count = await prisma.transaction.count({
      where: { account: { bank: { userId } } },
    });

    const sumResult = await prisma.transaction.aggregate({
      where: { account: { bank: { userId } } },
      _sum: { amount: true },
    });

    const avgAmount = count > 0 ? (sumResult._sum.amount || 0) / count : 100;

    // Check if the merchant name has occurred historically
    const merchantMatchCount = await prisma.transaction.count({
      where: {
        account: { bank: { userId } },
        name: tx.name,
        id: { not: tx.id },
      },
    });
    const isNewMerchant = merchantMatchCount === 0;

    // Gather last transaction (for velocity/impossible travel checks)
    const lastTx = await prisma.transaction.findFirst({
      where: {
        account: { bank: { userId } },
        id: { not: tx.id },
      },
      orderBy: { date: 'desc' },
    });

    // Gather recent transactions (past 10 items)
    const recentTxs = await prisma.transaction.findMany({
      where: {
        account: { bank: { userId } },
        id: { not: tx.id },
      },
      orderBy: { date: 'desc' },
      take: 10,
    });

    // 2. Execute modular rule extractors (features vector)
    const features: FraudFeature[] = [
      analyzeLargePurchase(tx, avgAmount),
      analyzeUnusualTime(tx),
      analyzeNewMerchant(tx, isNewMerchant),
      analyzeImpossibleTravel(tx, lastTx),
      analyzeRapidConsecutive(tx, recentTxs),
    ];

    // 3. Compute Risk Score & Confidence Index
    let totalWeight = 0;
    let triggeredWeight = 0;

    features.forEach((feat) => {
      totalWeight += feat.weight;
      if (feat.triggered) {
        triggeredWeight += feat.weight;
      }
    });

    // Normalize risk score to 0-100 range
    let riskScore = totalWeight > 0 ? Math.round((triggeredWeight / totalWeight) * 100) : 0;
    
    // Safety override: Extremely large single transactions (e.g. > $3000) default to high-risk
    if (tx.amount >= 3000) {
      riskScore = Math.max(80, riskScore);
    }

    // Confidence index (lower if first transaction, higher with more records)
    const confidenceScore = count >= 5 ? 90 : 60;

    // 4. If high risk, write Fraud Case and trigger notifications
    if (riskScore >= 50) {
      // Create markdown explanation details
      const triggeredFeatures = features.filter((f) => f.triggered);
      const explanation = `### Fraud Risk Report\nThis transaction was flagged because it triggered several security indicators:\n\n` +
        triggeredFeatures.map((f) => `- **${f.name}**: ${f.description}`).join('\n') +
        `\n\n**Recommendation**: Review details immediately and approve or decline account card access.`;

      // Prevent duplicate cases
      const existing = await prisma.fraudCase.findUnique({
        where: { transactionId: tx.id },
      });

      if (!existing) {
        await prisma.fraudCase.create({
          data: {
            userId,
            transactionId: tx.id,
            riskScore,
            confidenceScore,
            reasons: JSON.stringify(triggeredFeatures.map((f) => f.name)),
            explanation,
            status: 'UNDER_REVIEW',
          },
        });

        // Trigger global Notification center alert from Phase 8
        await prisma.notification.create({
          data: {
            userId,
            type: 'LARGE_WITHDRAWAL',
            title: 'Suspicious Activity Flagged',
            message: `A charge of $${tx.amount.toFixed(2)} at ${tx.name} has been flagged for investigation (Risk Index: ${riskScore}%).`,
          },
        });
      }
    }
  } catch (err) {
    console.error('evaluateTransactionFraud engine error:', err);
  }
}
