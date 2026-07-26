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
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { month: 'Jan', deposits: 4000, withdrawals: 2400 },
  { month: 'Feb', deposits: 3200, withdrawals: 1800 },
  { month: 'Mar', deposits: 5000, withdrawals: 2900 },
  { month: 'Apr', deposits: 4600, withdrawals: 3100 },
  { month: 'May', deposits: 6100, withdrawals: 2400 },
  { month: 'Jun', deposits: 5800, withdrawals: 3800 },
  { month: 'Jul', deposits: 7200, withdrawals: 4100 },
];

export function AnalyticsChart() {

  return (
    <Card className="col-span-4 border-border/60 bg-card/60 backdrop-blur-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">Analytics Overview</CardTitle>
        <CardDescription>Visualizing deposits and withdrawals trend this year.</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Area
                type="monotone"
                dataKey="deposits"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDeposits)"
                name="Deposits"
              />
              <Area
                type="monotone"
                dataKey="withdrawals"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorWithdrawals)"
                name="Withdrawals"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
