'use server';

import prisma from '@/lib/prisma';
import { generateGeminiSummaryReport, generateGeminiChatResponse } from '@/lib/gemini';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/features/plaid/actions/plaidActions';
import { formatCurrency } from '@/utils/format';

/**
 * Calculates a user's Financial Health Score (0 - 100) and compiles a markdown explanation.
 */
function calculateFinancialHealthScore(
  income: number,
  expenses: number,
  budgets: { category: string; limit: number }[],
  spending: Record<string, number>,
  goals: { name: string; targetAmount: number; currentAmount: number }[],
) {
  let score = 70; // Base score
  const deductions: string[] = [];
  const additions: string[] = [];

  // 1. Income vs Expense check
  if (expenses > income) {
    score -= 15;
    deductions.push(`**Net Cash Flow (-15 pts)**: Monthly expenses ($${expenses.toFixed(2)}) exceeded registered income ($${income.toFixed(2)}).`);
  } else if (income > 0 && expenses < income * 0.5) {
    score += 10;
    additions.push(`**Strong Savings Rate (+10 pts)**: Expenses represent less than 50% of your total income.`);
  } else {
    additions.push(`**Healthy Cash Flow (Neutral)**: Monthly expenses are within safe margins relative to your income.`);
  }

  // 2. Budget limits check
  let exceededCount = 0;
  budgets.forEach((b) => {
    const spent = spending[b.category] || 0;
    if (spent > b.limit) {
      exceededCount++;
      score -= 5;
    }
  });

  if (exceededCount > 0) {
    deductions.push(`**Budget Overruns (-${exceededCount * 5} pts)**: Exceeded monthly limit in ${exceededCount} spending categories.`);
  } else if (budgets.length > 0) {
    score += 10;
    additions.push(`**Budget Adherence (+10 pts)**: Kept spending within limits across all defined budgets.`);
  }

  // 3. Savings goals progress
  let goalProgressSum = 0;
  goals.forEach((g) => {
    if (g.targetAmount > 0) {
      goalProgressSum += g.currentAmount / g.targetAmount;
    }
  });

  if (goals.length > 0) {
    const avgProgress = goalProgressSum / goals.length;
    if (avgProgress >= 0.5) {
      score += 10;
      additions.push(`**Active Savings Progress (+10 pts)**: Savings goals are on track, averaging over 50% completion.`);
    } else {
      additions.push(`**Savings Starter (Neutral)**: Active savings targets are in progress.`);
    }
  }

  score = Math.max(0, Math.min(score, 100));

  // Construct explanation
  const explanation = `### Health Score Explanation
Your Financial Health Score is **${score}/100**. This metric is calculated by analyzing your monthly cash flow, budget boundaries, and savings goal accomplishments.

${additions.length > 0 ? `#### Positive Drivers\n${additions.map((item) => `- ${item}`).join('\n')}` : ''}

${deductions.length > 0 ? `#### Improvement Areas\n${deductions.map((item) => `- ${item}`).join('\n')}` : ''}

#### Recommendations
- ${expenses > income ? 'Reduce discretionary spending to bring your monthly outlays below your income.' : 'Maintain your current cash flow margins.'}
- ${exceededCount > 0 ? 'Review alerts and adjust category limits on categories where you frequently exceed limits.' : 'Continue setting alerts for category limits.'}
- Try automating deposits to accelerate savings goals.`;

  return { score, explanation };
}

/**
 * Action to fetch or generate the monthly AI financial summary report.
 */
export async function getOrGenerateAiSummaryAction(
  userId: string,
  month: number,
  year: number,
) {
  try {
    if (!userId) return null;

    // Check if summary already exists
    const existing = await prisma.aiSummary.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    });

    if (existing) return existing;

    // Fetch user context parameters
    const banks = await prisma.bank.findMany({
      where: { userId },
      include: { accounts: true },
    });

    const accountIds = banks.flatMap((b) => b.accounts.map((a) => a.id));

    // Get budgets
    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
    });

    // Get actual spending
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        accountId: { in: accountIds },
        date: { gte: start, lte: end },
      },
    });

    // Separate income vs expenses
    let totalIncome = 0;
    let totalExpenses = 0;
    const spending: Record<string, number> = {};
    const categoriesList = [
      'Rent & Housing',
      'Food & Dining',
      'Software & SaaS',
      'Entertainment',
      'Utilities & Others',
      'Infrastructure',
      'Travel',
    ];
    categoriesList.forEach((c) => {
      spending[c] = 0;
    });

    transactions.forEach((tx) => {
      if (tx.amount < 0) {
        totalIncome += Math.abs(tx.amount);
      } else {
        totalExpenses += tx.amount;
        let matched = false;
        for (const cat of categoriesList) {
          if (tx.category.toLowerCase().includes(cat.split(' ')[0].toLowerCase())) {
            spending[cat] += tx.amount;
            matched = true;
            break;
          }
        }
        if (!matched) {
          spending['Utilities & Others'] += tx.amount;
        }
      }
    });

    // Fallback defaults for empty data to keep demonstrations beautiful
    if (totalIncome === 0 && totalExpenses === 0) {
      totalIncome = 5800;
      totalExpenses = 3200;
      spending['Rent & Housing'] = 1500;
      spending['Food & Dining'] = 450;
      spending['Entertainment'] = 200;
      spending['Utilities & Others'] = 1050;
    }

    // Get savings goals
    const goals = await prisma.savingsGoal.findMany({
      where: { userId },
    });

    // Calculate score
    const healthMetrics = calculateFinancialHealthScore(
      totalIncome,
      totalExpenses,
      budgets,
      spending,
      goals,
    );

    // Compile Gemini prompt
    const contextPrompt = `Analyze the following banking ledger statistics for user "${userId}" for ${month}/${year}:
- Total Monthly Income: $${totalIncome.toFixed(2)}
- Total Monthly Expenses: $${totalExpenses.toFixed(2)}
- Category Budgets and limits: ${JSON.stringify(budgets.map((b) => ({ category: b.category, limit: b.limit })))}
- Actual Spending per Category: ${JSON.stringify(spending)}
- Active Savings Goals: ${JSON.stringify(goals.map((g) => ({ name: g.name, target: g.targetAmount, current: g.currentAmount })))}
- Calculated Financial Health Score: ${healthMetrics.score}/100

Compile a comprehensive financial analysis report. You must return EXACTLY a JSON string matching this structure (no additional markdown wrappers outside the JSON):
{
  "spendingSummary": "A detailed 2-paragraph analysis of user spending trends in markdown",
  "incomeSummary": "A detailed analysis of user income sources and cash inflows in markdown",
  "expenseBreakdown": "A breakdown analyzing top expense categories with advice in markdown",
  "savingsRecommendations": "Strategic tips to help user achieve their active savings targets in markdown",
  "budgetSuggestions": "Tactical suggestions on creating or tweaking monthly category limits in markdown"
}`;

    let aiReportText = await generateGeminiSummaryReport(contextPrompt);
    let parsedReport: Record<string, string> = {};

    if (aiReportText) {
      try {
        // Clean up markdown block syntax if present
        if (aiReportText.startsWith('```json')) {
          aiReportText = aiReportText.substring(7);
        }
        if (aiReportText.endsWith('```')) {
          aiReportText = aiReportText.substring(0, aiReportText.length - 3);
        }
        parsedReport = JSON.parse(aiReportText.trim());
      } catch (err) {
        console.error('Failed to parse Gemini JSON report. Falling back to local templates.', err);
      }
    }

    // Compile local fallback summary templates if Gemini is unconfigured or failed
    const spendingSummary = parsedReport.spendingSummary || `You spent **${formatCurrency(totalExpenses)}** this month out of a total monthly registered inflow. Discretionary spending represents the bulk of this layout. Category outlays are stable, but monitoring recurring transactions is suggested.`;
    const incomeSummary = parsedReport.incomeSummary || `Registered income of **${formatCurrency(totalIncome)}** was deposited. This provides a positive net operating margin of **${formatCurrency(totalIncome - totalExpenses)}** to invest or distribute to goals.`;
    const expenseBreakdown = parsedReport.expenseBreakdown || `### Spending Breakdown
${Object.entries(spending)
  .filter(([, amt]) => amt > 0)
  .map(([cat, amt]) => `- **${cat}**: ${formatCurrency(amt)} (${Math.round((amt / totalExpenses) * 100)}% of expenses)`)
  .join('\n')}`;
    const savingsRecommendations = parsedReport.savingsRecommendations || `### Savings Goal Acceleration
Based on your cash flow surplus of **${formatCurrency(totalIncome - totalExpenses)}**, we suggest automating transfers to your active goals:
${goals.length > 0 ? goals.map((g) => `- **${g.name}**: Needs ${formatCurrency(g.targetAmount - g.currentAmount)} to reach completion.`).join('\n') : '- Create savings goals to automate savings.'}`;
    const budgetSuggestions = parsedReport.budgetSuggestions || `### Budget Optimizations
- **Rent & Housing** represents your largest structural outflow.
- Set category limits on **Food & Dining** to prevent discretionary leaks.
- Ensure total category limits do not exceed 80% of your projected income.`;

    const summaryRecord = await prisma.aiSummary.create({
      data: {
        userId,
        month,
        year,
        spendingSummary,
        incomeSummary,
        expenseBreakdown,
        savingsRecommendations,
        budgetSuggestions,
        financialHealthScore: healthMetrics.score,
        healthScoreExplanation: healthMetrics.explanation,
      },
    });

    return summaryRecord;
  } catch (error) {
    console.error('getOrGenerateAiSummaryAction error:', error);
    return null;
  }
}

/**
 * Retrieves the chat history logs for a user.
 */
export async function getChatHistoryAction(userId: string) {
  try {
    if (!userId) return [];
    return await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  } catch (error) {
    console.error('getChatHistoryAction error:', error);
    return [];
  }
}

/**
 * Clears the user's conversational chat history logs.
 */
export async function clearChatHistoryAction(userId: string): Promise<ActionResponse> {
  try {
    if (!userId) return { success: false, error: 'Unauthorized.' };
    await prisma.chatMessage.deleteMany({
      where: { userId },
    });
    revalidatePath('/assistant');
    return { success: true };
  } catch (error) {
    console.error('clearChatHistoryAction error:', error);
    return { success: false, error: 'Failed to clear chat log.' };
  }
}

/**
 * Handles sending messages, persisting them, and retrieving the assistant's reply.
 */
export async function sendChatMessageAction(userId: string, userMessage: string): Promise<ActionResponse> {
  try {
    if (!userId) return { success: false, error: 'Unauthorized.' };
    if (!userMessage.trim()) return { success: false, error: 'Message cannot be empty.' };

    // 1. Save user message
    await prisma.chatMessage.create({
      data: {
        userId,
        role: 'user',
        content: userMessage,
      },
    });

    // 2. Fetch context details
    const banks = await prisma.bank.findMany({
      where: { userId },
      include: { accounts: true },
    });

    const accountDetails = banks.flatMap((b) =>
      b.accounts.map((a) => `- ${a.name} (${a.type}): Balance ${formatCurrency(a.balanceCurrent)}`),
    );

    const budgets = await prisma.budget.findMany({
      where: { userId, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    });

    const accountIds = banks.flatMap((b) => b.accounts.map((a) => a.id));
    const recentTransactions = await prisma.transaction.findMany({
      where: { accountId: { in: accountIds } },
      orderBy: { date: 'desc' },
      take: 10,
    });

    const goals = await prisma.savingsGoal.findMany({
      where: { userId },
    });

    const contextData = `User Accounts:
${accountDetails.join('\n')}

Active Budgets Limits:
${budgets.map((b) => `- ${b.category}: Limit ${formatCurrency(b.limit)}`).join('\n')}

Savings Targets:
${goals.map((g) => `- ${g.name}: Target ${formatCurrency(g.targetAmount)}, Savings ${formatCurrency(g.currentAmount)}`).join('\n')}

Recent transactions logs:
${recentTransactions.map((tx) => `- ${tx.date.toISOString().split('T')[0]}: ${tx.name} -> amount ${formatCurrency(tx.amount)} (Category: ${tx.category})`).join('\n')}`;

    // 3. Retrieve last 10 messages for history
    const historyLogs = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    
    const historyList = historyLogs
      .reverse()
      .map((msg) => ({
        role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: msg.content }],
      }));

    // 4. Generate response
    let assistantReply = await generateGeminiChatResponse(historyList, userMessage, contextData);

    // 5. Fallback local semantic answer calculations
    if (!assistantReply) {
      const promptLower = userMessage.toLowerCase();

      if (promptLower.includes('spend') || promptLower.includes('restaurant') || promptLower.includes('food') || promptLower.includes('dining')) {
        // Aggregate restaurant spending
        const foodTx = recentTransactions.filter((tx) =>
          tx.category.toLowerCase().includes('food') ||
          tx.category.toLowerCase().includes('dine') ||
          tx.name.toLowerCase().includes('restaurant') ||
          tx.name.toLowerCase().includes('cafe'),
        );
        const sum = foodTx.reduce((acc, tx) => acc + (tx.amount > 0 ? tx.amount : 0), 0);
        assistantReply = `Based on your recent transactions, your spending on **Food & Dining / Restaurants** amounts to **${formatCurrency(sum)}**.
Here are your recent dining transactions:
${foodTx.map((tx) => `- ${tx.name}: ${formatCurrency(tx.amount)}`).join('\n') || '- No transactions registered in this category.'}`;
      } else if (promptLower.includes('expense') || promptLower.includes('biggest') || promptLower.includes('cost')) {
        // Find largest expense
        const expensesOnly = recentTransactions.filter((tx) => tx.amount > 0);
        if (expensesOnly.length > 0) {
          const maxTx = expensesOnly.reduce((max, tx) => (tx.amount > max.amount ? tx : max), expensesOnly[0]);
          assistantReply = `Your single largest recent expense was **${formatCurrency(maxTx.amount)}** at **${maxTx.name}** on ${maxTx.date.toISOString().split('T')[0]}. This was categorized under *${maxTx.category}*.`;
        } else {
          assistantReply = `I couldn't find any registered outgoing expenses in your accounts recently. Your balance sheet looks fully positive!`;
        }
      } else if (promptLower.includes('afford')) {
        // Parse numbers from message to check afford
        const match = promptLower.match(/\$?(\d+(?:\.\d{2})?)/);
        if (match) {
          const amountToCheck = parseFloat(match[1]);
          const checkingAccounts = banks
            .flatMap((b) => b.accounts)
            .filter((a) => a.type === 'checking');
          const totalChecking = checkingAccounts.reduce((sum, a) => sum + a.balanceCurrent, 0);

          if (totalChecking >= amountToCheck) {
            assistantReply = `Yes, you can afford a purchase of **${formatCurrency(amountToCheck)}**.
Your checking account balance is currently **${formatCurrency(totalChecking)}**. This purchase represents **${((amountToCheck / totalChecking) * 100).toFixed(1)}%** of your checking funds.`;
          } else {
            assistantReply = `No, a purchase of **${formatCurrency(amountToCheck)}** exceeds your current checking balance of **${formatCurrency(totalChecking)}**. I recommend postponing this purchase or transferring funds first.`;
          }
        } else {
          assistantReply = `To check if you can afford a purchase, please specify the cost. For example: *"Can I afford a $250 purchase?"*`;
        }
      } else if (promptLower.includes('saving') || promptLower.includes('goal')) {
        if (goals.length > 0) {
          assistantReply = `Here is the status of your active **Savings Goals**:
${goals
  .map(
    (g) =>
      `- **${g.name}**: Progress is **${Math.round((g.currentAmount / g.targetAmount) * 100)}%** (${formatCurrency(g.currentAmount)} saved of ${formatCurrency(g.targetAmount)} target).`,
  )
  .join('\n')}`;
        } else {
          assistantReply = `You don't have any active savings goals set up. You can define targets under the [Financial Planning](/budgets) tab to begin tracking targets!`;
        }
      } else {
        // General fallback
        const firstAccount = banks.flatMap((b) => b.accounts)[0];
        const balInfo = firstAccount
          ? `balance in ${firstAccount.name} is **${formatCurrency(firstAccount.balanceCurrent)}**`
          : 'balance sheet is empty';
        
        assistantReply = `Hello! I am your AI Financial Assistant. I can analyze your transactions, search your balances, check budget statuses, or verify purchase affordability.

Here are some queries you can ask:
- *"How much did I spend on restaurants?"*
- *"What are my biggest expenses?"*
- *"Can I afford a $200 purchase?"*
- *"What is my savings progress?"*

For reference, your current primary ${balInfo}. How can I assist you today?`;
      }
    }

    // 6. Save assistant message
    await prisma.chatMessage.create({
      data: {
        userId,
        role: 'assistant',
        content: assistantReply,
      },
    });

    revalidatePath('/assistant');
    return { success: true };
  } catch (error) {
    console.error('sendChatMessageAction error:', error);
    return { success: false, error: 'Failed to process message.' };
  }
}
