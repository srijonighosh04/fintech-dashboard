'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

const data = [
  { month: 'Feb', netWorth: 68250 },
  { month: 'Mar', netWorth: 71400 },
  { month: 'Apr', netWorth: 70900 },
  { month: 'May', netWorth: 73600 },
  { month: 'Jun', netWorth: 78900 },
  { month: 'Jul', netWorth: 83650 },
];

export function NetWorthTrendChart() {
  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">Net Worth Trend</CardTitle>
        <CardDescription>Visualizing your net worth growth over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                dataKey="month"
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                formatter={
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (value: any) => [formatCurrency(Number(value)), 'Net Worth']
                }
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="url(#colorNetWorth)"
                strokeWidth={3}
                dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: 'hsl(var(--background))' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#06b6d4' }}
              />
              <defs>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
