'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FraudChartsProps {
  trendData: { date: string; flagged: number; riskAvg: number }[];
  distributionData: { name: string; value: number }[];
}

const RISK_COLORS = ['#06b6d4', '#f59e0b', '#f43f5e']; // Cyan, Amber, Rose

export function FraudCharts({ trendData, distributionData }: FraudChartsProps) {
  // Safe validation check if all values are 0 in distribution
  const hasDistributionData = distributionData.some((d) => d.value > 0);

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
      {/* Timeline Trend Area Chart */}
      <Card className="lg:col-span-8 border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold tracking-tight">Security Incident Trends</CardTitle>
          <CardDescription>Daily frequency of flagged transactions and mean risk scores.</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="fraudColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="riskColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.2)" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Area
                name="Flagged Events"
                type="monotone"
                dataKey="flagged"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#fraudColor)"
              />
              <Area
                name="Average Risk Score"
                type="monotone"
                dataKey="riskAvg"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#riskColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Risk Distribution Chart */}
      <Card className="lg:col-span-4 border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-base font-bold tracking-tight">Risk Distribution</CardTitle>
          <CardDescription>Breakdown of suspicious charges by severity zones.</CardDescription>
        </CardHeader>
        <CardContent className="h-56 flex flex-col justify-center items-center pb-6">
          {!hasDistributionData ? (
            <p className="text-xs text-muted-foreground font-medium text-center py-10">
              No transactions currently flagged in history.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => <span className="text-[10px] font-bold text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
