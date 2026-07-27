import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title Header Shimmer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-muted/60" />
          <div className="h-4 w-72 rounded bg-muted/40" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 rounded bg-muted/40 hidden sm:block" />
          <div className="h-9 w-32 rounded bg-muted/60" />
        </div>
      </div>

      {/* Metrics Row Shimmer */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-border/40 bg-card/25 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 rounded bg-muted/40" />
              <div className="h-6 w-6 rounded bg-muted/40" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-32 rounded bg-muted/60" />
              <div className="h-3.5 w-16 rounded bg-muted/30" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Health Score Shimmer */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        {/* Quick Actions */}
        <div className="lg:col-span-3 rounded-2xl border border-border/30 p-6 bg-card/10 space-y-4">
          <div className="h-5 w-32 rounded bg-muted/55" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted/20" />
            ))}
          </div>
        </div>
        {/* Financial Health */}
        <div className="rounded-2xl border border-border/30 p-6 bg-card/10 flex flex-col items-center justify-center space-y-4">
          <div className="h-5 w-36 rounded bg-muted/55" />
          <div className="h-24 w-24 rounded-full border-4 border-muted/30 flex items-center justify-center">
            <div className="h-6 w-12 rounded bg-muted/40" />
          </div>
          <div className="h-4 w-28 rounded bg-muted/30" />
        </div>
      </div>

      {/* Charts Grid Shimmer */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        {/* Chart 1: Net Worth Trend */}
        <div className="lg:col-span-2 h-[350px] rounded-2xl border border-border/30 p-6 bg-card/10 space-y-4">
          <div className="space-y-2">
            <div className="h-5 w-36 rounded bg-muted/55" />
            <div className="h-4 w-52 rounded bg-muted/35" />
          </div>
          <div className="h-56 w-full rounded bg-muted/15" />
        </div>
        {/* Chart 2: Category Spending */}
        <div className="lg:col-span-2 h-[350px] rounded-2xl border border-border/30 p-6 bg-card/10 space-y-4">
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-muted/55" />
            <div className="h-4 w-48 rounded bg-muted/35" />
          </div>
          <div className="h-56 w-full rounded bg-muted/15" />
        </div>
        {/* Chart 3: Cash Flow */}
        <div className="lg:col-span-2 h-[350px] rounded-2xl border border-border/30 p-6 bg-card/10 space-y-4">
          <div className="space-y-2">
            <div className="h-5 w-28 rounded bg-muted/55" />
            <div className="h-4 w-44 rounded bg-muted/35" />
          </div>
          <div className="h-56 w-full rounded bg-muted/15" />
        </div>
        {/* Chart 4: Monthly Category Share */}
        <div className="lg:col-span-2 h-[350px] rounded-2xl border border-border/30 p-6 bg-card/10 space-y-4">
          <div className="space-y-2">
            <div className="h-5 w-32 rounded bg-muted/55" />
            <div className="h-4 w-36 rounded bg-muted/35" />
          </div>
          <div className="h-56 w-full rounded bg-muted/15" />
        </div>
      </div>

      {/* Ledger Table Shimmer */}
      <div className="rounded-2xl border border-border/30 p-6 bg-card/10 space-y-6">
        <div className="space-y-2">
          <div className="h-5 w-44 rounded bg-muted/55" />
          <div className="h-4 w-64 rounded bg-muted/35" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center border-b border-border/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-muted/40" />
                <div className="space-y-1">
                  <div className="h-4 w-32 rounded bg-muted/55" />
                  <div className="h-3 w-20 rounded bg-muted/35" />
                </div>
              </div>
              <div className="h-4 w-16 rounded bg-muted/55" />
              <div className="h-4.5 w-14 rounded bg-muted/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
