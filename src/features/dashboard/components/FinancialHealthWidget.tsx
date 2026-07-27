'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FinancialHealthWidgetProps {
  score?: number;
}

export function FinancialHealthWidget({ score = 78 }: FinancialHealthWidgetProps) {
  // Radial calculations
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'stroke-emerald-500';
  let label = 'Excellent';
  let textClass = 'text-emerald-500';

  if (score < 50) {
    colorClass = 'stroke-rose-500';
    label = 'Needs Work';
    textClass = 'text-rose-500';
  } else if (score < 80) {
    colorClass = 'stroke-cyan-500';
    label = 'Good';
    textClass = 'text-cyan-500';
  }

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-md flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight">Financial Health</CardTitle>
        <CardDescription>A live score based on savings & expenditures.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
        {/* Radial Progress SVG */}
        <div className="relative h-28 w-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="stroke-muted/30"
              fill="transparent"
              strokeWidth="8"
              r={radius}
              cx="50"
              cy="50"
            />
            <circle
              className={`${colorClass} transition-all duration-1000 ease-out`}
              fill="transparent"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              r={radius}
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold tracking-tight">{score}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Score
            </span>
          </div>
        </div>

        {/* Text descriptions */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
            <ShieldCheck className={`h-4.5 w-4.5 ${textClass}`} />
            <span className={textClass}>{label} Status</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            Your deposits exceed withdrawals by 42% over the last 30 days. Keep it up!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
