'use client';

import React, { useState, useTransition, useOptimistic } from 'react';
import { ShieldAlert, CheckCircle, AlertOctagon, Info, Loader2, ArrowRight } from 'lucide-react';
import { updateFraudCaseStatusAction, FraudCaseRecord } from '../actions/fraudActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/utils/format';

interface FlaggedTransactionsListProps {
  userId: string;
  initialCases: FraudCaseRecord[];
}

export function FlaggedTransactionsList({ userId, initialCases }: FlaggedTransactionsListProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedCase, setSelectedCase] = useState<FraudCaseRecord | null>(null);

  // React 19 Optimistic state hook
  const [optimisticCases, updateOptimisticCases] = useOptimistic(
    initialCases,
    (state, action: { id: string; status: string }) =>
      state.map((c) => (c.id === action.id ? { ...c, status: action.status } : c))
  );

  const handleResolve = (caseId: string, status: 'APPROVED' | 'CONFIRMED_FRAUD') => {
    startTransition(async () => {
      updateOptimisticCases({ id: caseId, status });
      const response = await updateFraudCaseStatusAction(userId, caseId, status);
      if (!response.success) {
        alert(response.error || 'Failed to update fraud case.');
      }
    });
  };

  const getRiskBadgeStyle = (score: number) => {
    if (score < 50) return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
    if (score <= 75) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'CONFIRMED_FRAUD':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'UNDER_REVIEW':
      default:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">Investigation Queue</CardTitle>
        <CardDescription>Review and resolve transactions flagged by the security engine.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {optimisticCases.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground font-medium border border-dashed border-border/40 rounded-xl bg-card/10">
            No transaction cases registered. System is secured.
          </div>
        ) : (
          <div className="space-y-4">
            {optimisticCases.map((item) => {
              const tx = item.transaction;
              const isUnderReview = item.status === 'UNDER_REVIEW';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-border/30 bg-card/25 hover:border-border/80 transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      item.riskScore >= 70 ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {item.riskScore >= 70 ? <AlertOctagon className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-foreground truncate max-w-[150px]">
                          {tx?.name || 'MANUAL PURCHASE'}
                        </span>
                        
                        <span className={`rounded-md border px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${getRiskBadgeStyle(item.riskScore)}`}>
                          Risk Index: {item.riskScore}%
                        </span>

                        <span className={`rounded-md border px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeStyle(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                        <span>{tx ? formatCurrency(tx.amount) : '$0.00'}</span>
                        <span>•</span>
                        <span>{tx ? formatDate(tx.date instanceof Date ? tx.date.toISOString().split('T')[0] : String(tx.date).split('T')[0]) : 'unknown'}</span>
                        <span>•</span>
                        <span>Confidence: {item.confidenceScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-border/10 pt-3 md:pt-0">
                    {/* View Details Dialog Trigger */}
                    <Dialog>
                      <DialogTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCase(item)}
                            className="text-cyan-500 hover:text-cyan-600 hover:bg-cyan-500/5 text-xs font-bold gap-1 rounded-xl h-8 flex items-center justify-center"
                          >
                            <Info className="h-4 w-4" />
                            <span>Details</span>
                          </Button>
                        }
                      />
                      <DialogContent className="bg-card/95 backdrop-blur-md border-border/60 rounded-2xl max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-rose-500" />
                            <span>Fraud Risk Report</span>
                          </DialogTitle>
                          <DialogDescription>
                            Risk parameters assessed by modular indicators checks.
                          </DialogDescription>
                        </DialogHeader>

                        {selectedCase && (
                          <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4 text-xs p-3 bg-muted/20 border border-border/20 rounded-xl">
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">Risk index</span>
                                <p className="text-sm font-extrabold text-foreground">{selectedCase.riskScore}%</p>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">Confidence Score</span>
                                <p className="text-sm font-extrabold text-foreground">{selectedCase.confidenceScore}%</p>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">Transaction Amount</span>
                                <p className="text-sm font-extrabold text-foreground">
                                  {selectedCase.transaction ? formatCurrency(selectedCase.transaction.amount) : '$0.00'}
                                </p>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">Status</span>
                                <span className={`inline-flex rounded border px-1.5 py-0.2 font-bold uppercase text-[9px] mt-0.5 ${getStatusBadgeStyle(selectedCase.status)}`}>
                                  {selectedCase.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>

                            <div className="text-xs space-y-2 border-t border-border/10 pt-3 text-muted-foreground">
                              <h4 className="font-bold text-foreground">Detailed Indicators:</h4>
                              <div className="prose prose-sm text-foreground prose-invert max-h-44 overflow-y-auto leading-relaxed">
                                {selectedCase.explanation.split('\n').map((line, idx) => {
                                  if (line.startsWith('- ')) {
                                    return (
                                      <p key={idx} className="flex gap-1.5 text-xs text-muted-foreground my-1.5">
                                        <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-cyan-500 shrink-0" />
                                        <span>{line.substring(2)}</span>
                                      </p>
                                    );
                                  }
                                  if (line.startsWith('### ')) {
                                    return <h5 key={idx} className="font-bold text-sm text-foreground mt-3 mb-1.5">{line.substring(4)}</h5>;
                                  }
                                  return <p key={idx} className="my-1.5 text-xs">{line}</p>;
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Action buttons */}
                    {isUnderReview && (
                      <div className="flex gap-2">
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => handleResolve(item.id, 'APPROVED')}
                          className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/5 text-xs font-bold rounded-xl h-8 px-3 gap-1 flex items-center justify-center"
                        >
                          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                          <span>Approve</span>
                        </Button>
                        <Button
                          size="xs"
                          variant="destructive"
                          disabled={isPending}
                          onClick={() => handleResolve(item.id, 'CONFIRMED_FRAUD')}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl h-8 px-3 gap-1 flex items-center justify-center"
                        >
                          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AlertOctagon className="h-3.5 w-3.5" />}
                          <span>Decline</span>
                        </Button>
                      </div>
                    )}
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
