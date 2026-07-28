'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

const data = [
  { name: 'Rent & Housing', value: 800 },
  { name: 'Salary & Infrastructure', value: 500 },
  { name: 'Food & Dining', value: 350 },
  { name: 'Software & SaaS', value: 250 },
  { name: 'Entertainment', value: 200 },
  { name: 'Utilities & Others', value: 300 },
];

const COLORS = [
  'hsl(217, 91%, 60%)', // Blue
  'hsl(188, 86%, 53%)', // Cyan
  'hsl(239, 84%, 67%)', // Indigo
  'hsl(263, 70%, 50%)', // Violet
  'hsl(292, 84%, 61%)', // Fuchsia
  'hsl(262, 83%, 74%)', // Light Purple
];

export function CategoryPieChart() {
  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">Category Spending</CardTitle>
        <CardDescription>Expenditure breakdowns by category this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (value: any) => [formatCurrency(Number(value)), 'Spent']
                }
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
                wrapperStyle={{ fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
