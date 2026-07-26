'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Lazy load the Recharts component with ssr disabled inside a client component context
const LazyChart = dynamic(
  () => import('./AnalyticsChart').then((m) => m.AnalyticsChart),
  {
    ssr: false,
    loading: () => (
      <Card className="col-span-4 border border-border/60 bg-card/60 backdrop-blur-md shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight">Analytics Overview</CardTitle>
          <CardDescription>Visualizing deposits and withdrawals trend this year.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    ),
  }
);

export function AnalyticsChartWrapper() {
  return <LazyChart />;
}
