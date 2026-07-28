import React from 'react';
import { getCurrentUser } from '@/features/auth/actions/authActions';
import { getBudgetsAction, getCategorySpendingAction, getSavingsGoalsAction } from '@/features/finance/actions/financeActions';
import { BudgetPlanner, BudgetRecord } from '@/features/finance/components/BudgetPlanner';
import { SavingsGoals, SavingsGoalRecord } from '@/features/finance/components/SavingsGoals';
import { FinanceCharts } from '@/features/finance/components/FinanceCharts';
import { MonthSelector } from '@/features/finance/components/MonthSelector';

interface BudgetsPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function BudgetsPage({ searchParams }: BudgetsPageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  // Await the searchParams promise in Next.js 15
  const resolvedParams = await searchParams;

  const now = new Date();
  const month = resolvedParams.month ? parseInt(resolvedParams.month, 10) : now.getMonth() + 1;
  const year = resolvedParams.year ? parseInt(resolvedParams.year, 10) : now.getFullYear();

  // Retrieve category budgets
  const budgets = await getBudgetsAction(user.$id, month, year);

  // Retrieve aggregated actual transactions spending
  const spending = await getCategorySpendingAction(user.$id, month, year);

  // Retrieve active savings goals
  const goals = await getSavingsGoalsAction(user.$id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section with month pagination toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Financial Planning</h1>
          <p className="text-muted-foreground text-sm">
            Set and track monthly spending targets alongside long-term savings goals.
          </p>
        </div>

        <MonthSelector month={month} year={year} />
      </div>

      {/* Finance analytics graphs comparison overview */}
      <FinanceCharts
        budgets={budgets as BudgetRecord[]}
        spending={spending}
      />

      {/* Planner form and savings progress bars lists */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7">
          <BudgetPlanner
            userId={user.$id}
            budgets={budgets as BudgetRecord[]}
            spending={spending}
            month={month}
            year={year}
          />
        </div>
        <div className="lg:col-span-5">
          <SavingsGoals
            userId={user.$id}
            goals={goals as SavingsGoalRecord[]}
          />
        </div>
      </div>
    </div>
  );
}
