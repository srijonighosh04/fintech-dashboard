'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HeartPulse, Info } from 'lucide-react';


interface FinancialHealthWidgetProps {
  score: number;
  explanation: string;
}

export function FinancialHealthWidget({ score, explanation }: FinancialHealthWidgetProps) {
  // Determine color theme based on score value
  let scoreColor = 'text-cyan-500';
  let scoreBg = 'stroke-cyan-500';
  let statusText = 'Excellent';
  let statusColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';

  if (score < 50) {
    scoreColor = 'text-rose-500';
    scoreBg = 'stroke-rose-500';
    statusText = 'Needs Attention';
    statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  } else if (score < 80) {
    scoreColor = 'text-amber-500';
    scoreBg = 'stroke-amber-500';
    statusText = 'Healthy';
    statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  }

  // Calculate SVG circle dashoffset properties
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Render markdown explanation bullet points cleanly
  const renderExplanationMarkdown = (text: string) => {
    // Basic regex split to identify headers and lists
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm font-extrabold text-foreground mt-4 mb-2 tracking-tight">
            {trimmed.substring(4)}
          </h3>
        );
      }
      if (trimmed.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-xs font-bold text-foreground mt-3 mb-1.5 uppercase tracking-wider text-muted-foreground">
            {trimmed.substring(5)}
          </h4>
        );
      }
      if (trimmed.startsWith('- ')) {
        // Highlight driver points
        const isDeduction = trimmed.includes('pts)') && trimmed.includes('-');
        const isAddition = trimmed.includes('pts)') && trimmed.includes('+');

        let itemStyle = 'text-muted-foreground';
        if (isDeduction) itemStyle = 'text-rose-500/90 font-medium';
        else if (isAddition) itemStyle = 'text-emerald-500/90 font-medium';

        return (
          <li key={idx} className={`text-xs pl-4 relative before:content-["•"] before:absolute before:left-1 before:text-muted-foreground/60 leading-relaxed ${itemStyle} mb-1`}>
            {trimmed.substring(2)}
          </li>
        );
      }
      if (trimmed.length > 0) {
        return (
          <p key={idx} className="text-xs text-muted-foreground leading-relaxed mb-2">
            {trimmed}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-1.5">
            <HeartPulse className="h-5 w-5 text-cyan-500" />
            <span>Financial Health Score</span>
          </CardTitle>
          <CardDescription>Real-time algorithm metric checking accounts, budgets, and savings.</CardDescription>
        </div>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusColor}`}>
          {statusText}
        </span>
      </CardHeader>
      
      <CardContent className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Gauge circular meter */}
        <div className="md:col-span-4 flex flex-col items-center justify-center py-4">
          <div className="relative h-32 w-32">
            {/* SVG Ring Dial */}
            <svg className="h-full w-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-muted/20"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                className={`transition-all duration-1000 ease-out ${scoreBg}`}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-extrabold ${scoreColor}`}>{score}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Scale / 100</span>
            </div>
          </div>
        </div>

        {/* Explain details */}
        <div className="md:col-span-8 space-y-3 border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-6">
          <div className="rounded-xl bg-muted/25 border border-border/20 p-4 max-h-[220px] overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              {renderExplanationMarkdown(explanation)}
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-[10px] text-muted-foreground font-medium bg-cyan-500/5 border border-cyan-500/10 rounded-lg p-2.5">
            <Info className="h-3.5 w-3.5 text-cyan-500 shrink-0 mt-0.5" />
            <span>
              Your health score updates automatically whenever Plaid imports new ledger entries, Dwolla completes transfers, or budgets limits are modified.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
