'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const LazyNetWorthTrend = dynamic(
  () => import('./NetWorthTrendChart').then((m) => m.NetWorthTrendChart),
  { ssr: false }
);

const LazyCategoryPie = dynamic(
  () => import('./CategoryPieChart').then((m) => m.CategoryPieChart),
  { ssr: false }
);

const LazyCashFlow = dynamic(
  () => import('./CashFlowChart').then((m) => m.CashFlowChart),
  { ssr: false }
);

const LazyMonthlySpending = dynamic(
  () => import('./MonthlySpendingChart').then((m) => m.MonthlySpendingChart),
  { ssr: false }
);

export function DashboardAnalytics() {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
      {/* Area 1: Historical Net Worth Growth */}
      <div className="lg:col-span-2">
        <LazyNetWorthTrend />
      </div>

      {/* Area 2: Current Spending Categories Share */}
      <div className="lg:col-span-2">
        <LazyCategoryPie />
      </div>

      {/* Area 3: Deposits vs Withdrawals */}
      <div className="lg:col-span-2">
        <LazyCashFlow />
      </div>

      {/* Area 4: Weekly Budget Spends */}
      <div className="lg:col-span-2">
        <LazyMonthlySpending />
      </div>
    </div>
  );
}
