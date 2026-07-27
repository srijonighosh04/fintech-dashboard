'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

const data = [
  { name: 'Week 1', amount: 650 },
  { name: 'Week 2', amount: 420 },
  { name: 'Week 3', amount: 890 },
  { name: 'Week 4', amount: 550 },
];

const COLORS = [
  'rgba(59, 130, 246, 0.85)',  // Blue
  'rgba(6, 182, 212, 0.85)',  // Cyan
  'rgba(99, 102, 241, 0.85)',  // Indigo
  'rgba(139, 92, 246, 0.85)',  // Violet
];

export function MonthlySpendingChart() {
  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">Weekly Spending</CardTitle>
        <CardDescription>Visualizing your transaction expenditures week-by-week.</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 15,
                left: -15,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
              <XAxis
                dataKey="name"
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), 'Weekly Spend']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
