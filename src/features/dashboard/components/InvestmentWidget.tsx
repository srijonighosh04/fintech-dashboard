'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Award, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatCurrency } from '@/utils/format';

type CurrencyType = 'USD' | 'EUR' | 'GBP';

const TICKERS = [
  { name: 'Apple Inc.', symbol: 'AAPL', amount: 15420.0, change: 14.8, shares: 80, allocation: 62 },
  { name: 'Bitcoin Network', symbol: 'BTC', amount: 6200.0, change: 32.4, shares: 0.12, allocation: 25 },
  { name: 'Tesla Inc.', symbol: 'TSLA', amount: 3230.0, change: -4.5, shares: 15, allocation: 13 },
];

const HISTORICAL_DATA = [
  { month: 'Jan', value: 18200 },
  { month: 'Feb', value: 19500 },
  { month: 'Mar', value: 18800 },
  { month: 'Apr', value: 21200 },
  { month: 'May', value: 22800 },
  { month: 'Jun', value: 24850 },
];

const ALLOCATION_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6'];

export function InvestmentWidget() {
  const [currency, setCurrency] = useState<CurrencyType>('USD');

  const totalValue = TICKERS.reduce((sum, item) => sum + item.amount, 0);

  const allocationData = TICKERS.map((t) => ({
    name: t.symbol,
    value: t.allocation,
  }));

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold tracking-tight flex items-center gap-1.5">
            <Award className="h-5 w-5 text-cyan-500" />
            <span>Investment Portfolio</span>
          </CardTitle>
          <CardDescription>Track stocks, digital assets, and compound earnings.</CardDescription>
        </div>

        {/* Currency Switcher */}
        <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border/10">
          {(['USD', 'EUR', 'GBP'] as CurrencyType[]).map((cur) => (
            <button
              key={cur}
              onClick={() => setCurrency(cur)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                currency === cur
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cur}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Portfolio Performance Graph */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground">
                {formatCurrency(totalValue, currency)}
              </span>
              <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
                <TrendingUp className="h-3.5 w-3.5" />
                +18.4% this year
              </span>
            </div>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HISTORICAL_DATA.map(h => ({ ...h, value: h.value * (currency === 'USD' ? 1.0 : currency === 'EUR' ? 0.915 : 0.785) }))} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="investmentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.2)" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#investmentGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Allocation breakdown */}
          <div className="md:col-span-4 flex flex-col justify-center items-center h-48 border-l border-border/10 pl-0 md:pl-6">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2 self-start flex items-center gap-1">
              <BarChart2 className="h-3.5 w-3.5" />
              Allocation
            </span>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="45%"
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" formatter={(value) => <span className="text-[9px] text-foreground font-bold">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tickers Allocation Table List */}
        <div className="border-t border-border/15 pt-4 space-y-3">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Top Assets Holdings</span>
          <div className="space-y-2">
            {TICKERS.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 border border-border/20 rounded-xl bg-card/15 hover:border-border/60 transition-all">
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-foreground">
                    {t.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{t.name}</p>
                    <p className="text-[9px] text-muted-foreground font-semibold">{t.shares} shares • {t.symbol}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">{formatCurrency(t.amount, currency)}</p>
                  <span className={`text-[9px] font-bold ${t.change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.change > 0 ? '+' : ''}{t.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
