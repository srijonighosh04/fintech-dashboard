'use client';

import React from 'react';
import { Landmark, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/utils/format';

export interface TransferRecord {
  id: string;
  userId: string;
  amount: number;
  type: string;
  senderAccountId: string;
  recipientAccountId: string | null;
  recipientId: string | null;
  status: string;
  scheduledDate: Date | null;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
  recipient?: {
    name: string;
    accountNumber: string;
  } | null;
}

interface TransferHistoryProps {
  transfers: TransferRecord[];
}

export function TransferHistory({ transfers }: TransferHistoryProps) {
  // Separate settled transfers from scheduled future transactions
  const scheduled = transfers.filter((t) => t.status === 'PENDING' && t.scheduledDate !== null);
  const settled = transfers.filter((t) => t.status !== 'PENDING' || t.scheduledDate === null);

  const getStatusIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />;
    if (status === 'FAILED') return <AlertCircle className="h-4.5 w-4.5 text-rose-500" />;
    return <Clock className="h-4.5 w-4.5 text-amber-500" />;
  };

  const getStatusBadge = (status: string) => {
    let color = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (status === 'PENDING') {
      color = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    } else if (status === 'FAILED') {
      color = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    }
    return (
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${color}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Scheduled Transfers */}
      {scheduled.length > 0 && (
        <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight">Scheduled Transfers</CardTitle>
            <CardDescription>Future transactions waiting to clear ACH networks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-semibold text-xs uppercase tracking-wider bg-card/10 select-none">
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Release Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {scheduled.map((tx) => {
                    const isInternal = tx.type === 'INTERNAL';
                    const targetLabel = isInternal
                      ? `Internal Transfer (*${tx.recipientAccountId?.slice(-4) || 'Account'})`
                      : tx.recipient?.name || 'External Recipient';

                    return (
                      <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-foreground flex items-center gap-2">
                          <Landmark className="h-4 w-4 text-muted-foreground" />
                          <span>{targetLabel}</span>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {tx.scheduledDate ? formatDate(tx.scheduledDate.toISOString().split('T')[0]) : ''}
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(tx.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-foreground">
                          {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Settled Transfers */}
      <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight">Transfer Log</CardTitle>
          <CardDescription>History of completed and processed transfer instructions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground font-semibold text-xs uppercase tracking-wider bg-card/10 select-none">
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Date Initiated</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {settled.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground font-medium">
                      No transfer history found.
                    </td>
                  </tr>
                ) : (
                  settled.map((tx) => {
                    const isInternal = tx.type === 'INTERNAL';
                    const targetLabel = isInternal
                      ? `To Internal *${tx.recipientAccountId?.slice(-4) || 'Account'}`
                      : `To ${tx.recipient?.name || 'External Link'}`;

                    return (
                      <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-foreground flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/40 text-muted-foreground">
                            {getStatusIcon(tx.status)}
                          </div>
                          <span>{targetLabel}</span>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {formatDate(tx.createdAt.toISOString().split('T')[0])}
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(tx.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-foreground">
                          {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
