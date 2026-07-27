import React from 'react';
import { Wallet, Landmark, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

interface FinancialMetricsProps {
  netWorth: number;
  totalBalance: number;
  income?: number;
  expenses?: number;
}

export function FinancialMetrics({
  netWorth,
  totalBalance,
  income = 7200,
  expenses = 4100,
}: FinancialMetricsProps) {
  const metrics = [
    {
      title: 'Net Worth',
      value: netWorth,
      icon: Landmark,
      color: 'bg-emerald-500 text-emerald-500',
      description: 'Connected cash minus credit card debt',
      change: '+6.4% this month',
      changeType: 'up',
    },
    {
      title: 'Total Assets Balance',
      value: totalBalance,
      icon: Wallet,
      color: 'bg-blue-500 text-blue-500',
      description: 'Checking, savings, and investments',
      change: '+4.2% this month',
      changeType: 'up',
    },
    {
      title: 'Monthly Income',
      value: income,
      icon: TrendingUp,
      color: 'bg-cyan-500 text-cyan-500',
      description: 'Total deposits across connected links',
      change: '+14.5% vs last month',
      changeType: 'up',
    },
    {
      title: 'Monthly Expenses',
      value: expenses,
      icon: TrendingDown,
      color: 'bg-rose-500 text-rose-500',
      description: 'Withdrawals and ledger debits',
      change: '-2.1% vs last month',
      changeType: 'down',
    },
  ];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, i) => {
        const Icon = metric.icon;
        const colorParts = metric.color.split(' ');
        const isUp = metric.changeType === 'up';

        return (
          <Card
            key={i}
            className="relative overflow-hidden border border-border/60 bg-card/60 backdrop-blur-md shadow-md hover:shadow-lg hover:border-border/95 transition-all duration-300 group"
          >
            {/* Soft decorative background glow */}
            <div className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full opacity-[0.03] transition-all duration-500 group-hover:scale-110 ${colorParts[0]}`} />
            
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  {metric.title}
                </span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-accent/40 ${colorParts[1]}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-extrabold tracking-tight text-foreground">
                  {formatCurrency(metric.value)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={isUp ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>
                    {metric.change}
                  </span>
                  <span>•</span>
                  <span>{metric.description}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
