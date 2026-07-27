'use client';

import React from 'react';
import { Calendar, Tag, ShieldAlert, Landmark, Layers } from 'lucide-react';
import { TransactionWithAccountDetails } from '../actions/transactionActions';
import { formatCurrency, formatDate } from '@/utils/format';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionWithAccountDetails | null;
}

export function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const isIncome = transaction.amount < 0;
  const absAmount = Math.abs(transaction.amount);

  // Status Badge configurations
  let statusColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  if (transaction.status === 'pending') {
    statusColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  } else if (transaction.status === 'failed') {
    statusColor = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  } else if (transaction.status === 'refunded') {
    statusColor = 'bg-purple-500/10 text-purple-500 border-purple-500/20';
  }

  const categoryPills = transaction.category.split(',').map((cat) => cat.trim());

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card/95 backdrop-blur-md border-border/60 sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            Detailed view of this specific ledger transaction record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Hero */}
          <div className="text-center py-4 bg-muted/20 border border-border/20 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Amount
            </span>
            <div className={`text-3xl font-black tracking-tight ${isIncome ? 'text-cyan-500' : 'text-foreground'}`}>
              {isIncome ? '+' : '-'}{formatCurrency(absAmount)}
            </div>
            <div className="pt-1.5 flex justify-center">
              <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold border uppercase tracking-wider ${statusColor}`}>
                {transaction.status}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-4 text-sm">
            {/* Description */}
            <div className="flex justify-between items-start border-b border-border/10 pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers className="h-4 w-4" />
                <span>Description</span>
              </div>
              <span className="font-semibold text-right max-w-[240px] truncate">
                {transaction.merchantName || transaction.name}
              </span>
            </div>

            {/* Institution Source */}
            <div className="flex justify-between items-center border-b border-border/10 pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Landmark className="h-4 w-4" />
                <span>Link Source</span>
              </div>
              <span className="font-semibold text-right">
                {transaction.account.bank.institutionName} • {transaction.account.name}
              </span>
            </div>

            {/* Date */}
            <div className="flex justify-between items-center border-b border-border/10 pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Posted Date</span>
              </div>
              <span className="font-semibold">{formatDate(transaction.date.toISOString().split('T')[0])}</span>
            </div>

            {/* Categories */}
            <div className="flex flex-col gap-2 border-b border-border/10 pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>Categories</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categoryPills.map((pill, i) => (
                  <span key={i} className="text-xs bg-accent/40 text-foreground px-2 py-0.5 rounded border border-border/30">
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            {/* Ledger reference identifier */}
            <div className="flex flex-col gap-1 pt-1">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Plaid Ledger ID</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground break-all bg-muted/40 p-2 rounded border border-border/10">
                {transaction.id}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
