import React from 'react';
import { getCurrentUser } from '@/features/auth/actions/authActions';
import { getFraudCasesAction, getFraudAnalyticsAction } from '@/features/fraud/actions/fraudActions';
import { FraudCharts } from '@/features/fraud/components/FraudCharts';
import { FlaggedTransactionsList } from '@/features/fraud/components/FlaggedTransactionsList';
import { ShieldAlert, ShieldCheck, ClipboardList } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default async function FraudCenterPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Retrieve fraud cases queue list and analytics charts data
  const cases = await getFraudCasesAction(user.$id);
  const { trendData, distributionData, stats } = await getFraudAnalyticsAction(user.$id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section details */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Fraud Center</h1>
        <p className="text-muted-foreground text-sm">
          Monitor transactional security risk indexes, investigate flagged indicators, and approve account activities.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Scanned</span>
            <p className="text-2xl font-extrabold text-foreground">{stats.total}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <ClipboardList className="h-5 w-5" />
          </div>
        </Card>

        <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Under Investigation</span>
            <p className="text-2xl font-extrabold text-rose-500">{stats.flagged}</p>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
            stats.flagged > 0 ? 'bg-rose-500/10 text-rose-500 animate-pulse' : 'bg-muted text-muted-foreground'
          }`}>
            <ShieldAlert className="h-5 w-5" />
          </div>
        </Card>

        <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Resolved Issues</span>
            <p className="text-2xl font-extrabold text-emerald-500">{stats.resolved}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Analytics Recharts visualizations */}
      <FraudCharts
        trendData={trendData}
        distributionData={distributionData}
      />

      {/* Flagged cases queue list */}
      <FlaggedTransactionsList
        userId={user.$id}
        initialCases={cases}
      />
    </div>
  );
}
