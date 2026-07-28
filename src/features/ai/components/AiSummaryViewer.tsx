'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles, TrendingUp, Wallet, ArrowDownCircle, Target, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AiSummaryRecord {
  id: string;
  userId: string;
  month: number;
  year: number;
  spendingSummary: string;
  incomeSummary: string;
  expenseBreakdown: string;
  savingsRecommendations: string;
  budgetSuggestions: string;
}

interface AiSummaryViewerProps {
  summary: AiSummaryRecord | null;
}

export function AiSummaryViewer({ summary }: AiSummaryViewerProps) {
  const [activeTab, setActiveTab] = useState<'spending' | 'income' | 'expenses' | 'savings' | 'budgets'>('spending');

  if (!summary) {
    return (
      <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-md rounded-2xl p-6 text-center text-sm text-muted-foreground font-medium">
        Generating your financial insights report... Please wait.
      </Card>
    );
  }

  // Parse custom bold and bullet items in reports markdown
  const renderTextMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      // Match headers
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-foreground mt-4 mb-2">
            {trimmed.substring(4)}
          </h4>
        );
      }

      // Match bullet items
      if (trimmed.startsWith('- ')) {
        trimmed = trimmed.substring(2);
        return (
          <li key={idx} className="text-xs pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-cyan-500 leading-relaxed text-muted-foreground mb-1">
            {renderBoldPhrases(trimmed)}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs leading-relaxed text-muted-foreground mb-2">
          {renderBoldPhrases(trimmed)}
        </p>
      );
    });
  };

  const renderBoldPhrases = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-extrabold text-foreground">{part}</strong>;
      }
      return part;
    });
  };

  const tabsConfig = [
    { id: 'spending' as const, label: 'Spending Trends', icon: TrendingUp, content: summary.spendingSummary },
    { id: 'income' as const, label: 'Cash Inflows', icon: ArrowDownCircle, content: summary.incomeSummary },
    { id: 'expenses' as const, label: 'Expense Breakdown', icon: Wallet, content: summary.expenseBreakdown },
    { id: 'savings' as const, label: 'Savings Advice', icon: Target, content: summary.savingsRecommendations },
    { id: 'budgets' as const, label: 'Budget Tweaks', icon: Settings2, content: summary.budgetSuggestions },
  ];

  const currentTab = tabsConfig.find((t) => t.id === activeTab) || tabsConfig[0];
  const IconComponent = currentTab.icon;

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden flex flex-col lg:flex-row">
      {/* Tabs navigation panel */}
      <div className="lg:w-60 border-b lg:border-b-0 lg:border-r border-border/40 bg-muted/10 p-4 space-y-1">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 mb-3 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
          <span>Monthly Insights</span>
        </h3>
        
        <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 pb-2 lg:pb-0 scrollbar-none">
          {tabsConfig.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`justify-start gap-2.5 font-bold text-xs rounded-xl px-3 py-2 shrink-0 lg:shrink w-auto lg:w-full transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10 hover:bg-primary'
                    : 'text-muted-foreground hover:bg-accent/40'
                }`}
              >
                <TabIcon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* active tab content panel */}
      <div className="flex-1 p-6 space-y-4 min-h-[300px]">
        <div className="flex items-center gap-2 border-b border-border/20 pb-3">
          <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <IconComponent className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground leading-none">{currentTab.label}</h4>
            <span className="text-[10px] text-muted-foreground font-medium">Monthly AI summaries & recommendations</span>
          </div>
        </div>

        <div className="space-y-2 animate-in fade-in duration-300">
          {renderTextMarkdown(currentTab.content)}
        </div>
      </div>
    </Card>
  );
}
