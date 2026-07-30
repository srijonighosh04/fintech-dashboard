'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

export function InterestCalculator() {
  const [principal, setPrincipal] = useState<number>(5000);
  const [monthly, setMonthly] = useState<number>(200);
  const [rate, setRate] = useState<number>(7);
  const [years, setYears] = useState<number>(10);

  const stats = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    let total = principal;
    let totalInvested = principal;

    for (let i = 0; i < months; i++) {
      total = (total + monthly) * (1 + monthlyRate);
      totalInvested += monthly;
    }

    const interestEarned = Math.max(0, total - totalInvested);

    return {
      total: Math.round(total),
      invested: Math.round(totalInvested),
      interest: Math.round(interestEarned),
    };
  }, [principal, monthly, rate, years]);

  return (
    <Card className="border border-border/60 bg-card/40 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden max-w-xl mx-auto">
      <CardHeader className="border-b border-border/20 bg-muted/10 pb-5">
        <CardTitle className="text-lg font-extrabold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cyan-500" />
          <span>Growth Simulator</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Visualize compound growth of your investments over time.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          {/* Principal */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-muted-foreground">Initial Deposit</span>
              <span className="text-foreground">{formatCurrency(principal)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="500"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none"
            />
          </div>

          {/* Monthly contribution */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-muted-foreground">Monthly Contribution</span>
              <span className="text-foreground">{formatCurrency(monthly)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none"
            />
          </div>

          {/* Interest Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-muted-foreground">Annual Interest Rate</span>
              <span className="text-foreground">{rate}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none"
            />
          </div>

          {/* Time Period */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-muted-foreground">Time Horizon</span>
              <span className="text-foreground">{years} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Results summary indicators */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-muted/10 border border-border/20 rounded-2xl text-center">
          <div>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Invested</span>
            <p className="text-xs font-extrabold text-foreground">{formatCurrency(stats.invested)}</p>
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Interest</span>
            <p className="text-xs font-extrabold text-cyan-500">+{formatCurrency(stats.interest)}</p>
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Total Value</span>
            <p className="text-xs font-extrabold text-foreground">{formatCurrency(stats.total)}</p>
          </div>
        </div>

        <div className="flex justify-between gap-3 pt-2">
          <Button
            size="sm"
            onClick={() => {
              setPrincipal(5000);
              setMonthly(200);
              setRate(7);
              setYears(10);
            }}
            variant="ghost"
            className="text-xs font-bold gap-1 rounded-xl text-muted-foreground hover:text-foreground h-8"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <span className="text-[10px] text-muted-foreground font-medium self-center italic">
            *Simulations do not guarantee future returns.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
