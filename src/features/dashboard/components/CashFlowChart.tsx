'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

const data = [
  { month: 'Feb', deposits: 4200, withdrawals: 2400 },
  { month: 'Mar', deposits: 5100, withdrawals: 2900 },
  { month: 'Apr', deposits: 4600, withdrawals: 3800 },
  { month: 'May', deposits: 6200, withdrawals: 2400 },
  { month: 'Jun', deposits: 5800, withdrawals: 3100 },
  { month: 'Jul', deposits: 7200, withdrawals: 4100 },
];

export function CashFlowChart() {
  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">Cash Flow</CardTitle>
        <CardDescription>Income (Deposits) vs Expenses (Withdrawals) cash flow.</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 15,
                left: -15,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorDepositsFlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorWithdrawalsFlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
              <XAxis
                dataKey="month"
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
                formatter={(value: number) => [formatCurrency(value)]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                className="text-xs"
              />
              <Area
                type="monotone"
                dataKey="deposits"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDepositsFlow)"
                name="Income (Deposits)"
              />
              <Area
                type="monotone"
                dataKey="withdrawals"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorWithdrawalsFlow)"
                name="Expenses (Withdrawals)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
