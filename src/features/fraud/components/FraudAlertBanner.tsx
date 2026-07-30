'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FraudAlertBannerProps {
  flaggedCount: number;
}

export function FraudAlertBanner({ flaggedCount }: FraudAlertBannerProps) {
  if (flaggedCount === 0) return null;

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_15px_rgba(244,63,94,0.05)] animate-in slide-in-from-top duration-500">
      <div className="flex items-center gap-3 text-center sm:text-left">
        <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 animate-pulse">
          <ShieldAlert className="h-5 w-5" />
        </div>

        <div className="space-y-0.5">
          <p className="text-sm font-bold text-foreground">
            Suspicious Account Activity Detected
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            There are {flaggedCount} transaction{flaggedCount > 1 ? 's' : ''} flagged for review. Cards might be locked soon.
          </p>
        </div>
      </div>

      <Button
        render={
          <Link
            href="/dashboard/fraud"
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl h-9 px-4 gap-1.5 shrink-0 flex items-center justify-center"
          />
        }
      >
        <span>Go to Fraud Center</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
