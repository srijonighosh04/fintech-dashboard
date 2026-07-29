'use client';

import React, { useState } from 'react';
import { Calendar, RefreshCw, ShieldCheck, ShieldAlert } from 'lucide-react';
import { detectRecurringPaymentsAction, toggleSubscriptionAction } from '../actions/automationActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/utils/format';

export interface SubscriptionRecord {
  id: string;
  userId: string;
  name: string;
  amount: number;
  frequency: string;
  category: string;
  nextPaymentDate: Date;
  status: string; // ACTIVE | INACTIVE
}

interface SubscriptionListProps {
  userId: string;
  subscriptions: SubscriptionRecord[];
}

export function SubscriptionList({ userId, subscriptions }: SubscriptionListProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    setActionError(null);
    const response = await detectRecurringPaymentsAction(userId);
    setIsScanning(false);
    
    if (!response.success) {
      setActionError(response.error || 'Recurring payments scan failed.');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await toggleSubscriptionAction(id, nextStatus);
  };

  const isDueSoon = (date: Date) => {
    const target = new Date(date);
    // eslint-disable-next-line react-hooks/purity
    const diff = target.getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 7;
  };

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Recurring Payments</CardTitle>
          <CardDescription>Automatically scanned subscriptions and recurring expenditures.</CardDescription>
        </div>

        <Button
          size="sm"
          variant="outline"
          disabled={isScanning}
          onClick={handleScan}
          className="shadow-sm gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Scan History'}</span>
        </Button>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {actionError && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 font-semibold">
            {actionError}
          </div>
        )}

        {subscriptions.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground font-medium border border-dashed border-border/40 rounded-xl bg-card/10">
            No recurring payments detected yet. Click &quot;Scan History&quot; to inspect your ledger.
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => {
              const dueSoon = isDueSoon(sub.nextPaymentDate);
              const isActive = sub.status === 'ACTIVE';

              return (
                <div
                  key={sub.id}
                  className={`p-4 rounded-xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                    dueSoon && isActive
                      ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60'
                      : 'border-border/30 bg-card/20 hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-cyan-500/10 text-cyan-500' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Calendar className="h-5 w-5" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{sub.name}</span>
                        {dueSoon && isActive && (
                          <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-500 uppercase tracking-wider">
                            Due Soon
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <span className="inline-flex rounded bg-muted/40 border border-border/20 px-1.5 py-0.2 font-semibold">
                          {sub.category}
                        </span>
                        <span>•</span>
                        <span>Next: {formatDate(sub.nextPaymentDate instanceof Date ? sub.nextPaymentDate.toISOString().split('T')[0] : String(sub.nextPaymentDate).split('T')[0])}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-foreground">{formatCurrency(sub.amount)}</p>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        {sub.frequency}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleStatus(sub.id, sub.status)}
                      className={`rounded-xl h-8 text-xs font-bold gap-1 px-3 ${
                        isActive
                          ? 'text-cyan-500 hover:text-cyan-600 hover:bg-cyan-500/5'
                          : 'text-muted-foreground hover:bg-muted/40'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-4 w-4" />
                          <span>Paused</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
