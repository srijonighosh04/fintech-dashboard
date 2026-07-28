'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BudgetRecord } from './BudgetPlanner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

interface FinanceChartsProps {
  budgets: BudgetRecord[];
  spending: Record<string, number>;
}

const COLORS = [
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
  '#ef4444', // red-500
];

export function FinanceCharts({ budgets, spending }: FinanceChartsProps) {
  // 1. Prepare Category Spending vs Budget Data
  const budgetComparisonData = Object.keys(spending).map((cat) => {
    const budget = budgets.find((b) => b.category === cat);
    return {
      name: cat.split(' ')[0], // short name for x-axis
      fullName: cat,
      Limit: budget ? budget.limit : 0,
      Spent: Math.round(spending[cat] || 0),
    };
  });

  const hasBudgets = budgets.some((b) => b.limit > 0);

  // 2. Prepare Remaining Budget Data (Donut Chart)
  const donutData = budgets
    .map((b) => {
      const spent = spending[b.category] || 0;
      const remaining = Math.max(0, b.limit - spent);
      return {
        name: b.category,
        value: Math.round(remaining),
      };
    })
    .filter((item) => item.value > 0);

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-12">
      {/* 1. Bar Chart: Limit vs Spent */}
      <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-md lg:col-span-8 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold tracking-tight">Spending vs Budget Limit</CardTitle>
          <CardDescription>Visual category comparison of monthly limits against actual ledger logs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={budgetComparisonData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                <XAxis dataKey="name" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (value: any) => [formatCurrency(Number(value))]
                  }
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Limit" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={25} name="Budget Limit" />
                <Bar dataKey="Spent" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={25} name="Actual Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Donut Chart: Remaining Allowances */}
      <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-md lg:col-span-4 rounded-2xl flex flex-col justify-between">
        <div>
          <CardHeader>
            <CardTitle className="text-base font-bold tracking-tight">Remaining Allowance</CardTitle>
            <CardDescription>Breakdown of remaining budget pools.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {!hasBudgets || donutData.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground font-medium">
                No active budget surpluses to list. Set budget limits in the planner.
              </div>
            ) : (
              <div className="h-[180px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (value: any) => [formatCurrency(Number(value))]
                      }
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </div>
        
        {/* Remaining list info */}
        {hasBudgets && donutData.length > 0 && (
          <div className="px-6 pb-6 space-y-1.5 text-xs">
            {donutData.slice(0, 3).map((item, idx) => (
              <div key={item.name} className="flex justify-between items-center font-medium">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="font-bold text-foreground">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
