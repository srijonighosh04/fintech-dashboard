'use client';

import React, { useState, useRef } from 'react';
import { ArrowUpRight, ArrowDownLeft, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { TransactionWithAccountDetails } from '../actions/transactionActions';
import { TransactionDetailModal } from './TransactionDetailModal';
import { formatCurrency, formatDate } from '@/utils/format';
import { Button } from '@/components/ui/button';

interface TransactionTableProps {
  transactions: TransactionWithAccountDetails[];
  page: number;
  totalPages: number;
  sortBy: 'date' | 'amount' | 'name';
  sortOrder: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onSortChange: (field: 'date' | 'amount' | 'name') => void;
}

export function TransactionTable({
  transactions,
  page,
  totalPages,
  sortBy,
  sortOrder,
  onPageChange,
  onSortChange,
}: TransactionTableProps) {
  const [selectedTx, setSelectedTx] = useState<TransactionWithAccountDetails | null>(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  // Keyboard navigation handlers
  const handleKeyDown = (e: React.KeyboardEvent, index: number, tx: TransactionWithAccountDetails) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(index + 1, transactions.length - 1);
      setFocusedRowIndex(nextIndex);
      rowRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(index - 1, 0);
      setFocusedRowIndex(prevIndex);
      rowRefs.current[prevIndex]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedTx(tx);
    }
  };

  const renderSortIndicator = (field: 'date' | 'amount' | 'name') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1 shrink-0" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1 shrink-0" />
    );
  };

  const getStatusBadge = (status: string) => {
    let color = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (status === 'pending') {
      color = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    } else if (status === 'failed') {
      color = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    } else if (status === 'refunded') {
      color = 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }

    return (
      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold border capitalize ${color}`}>
        {status}
      </span>
    );
  };

  return (
    <>
      <div className="rounded-2xl border border-border/30 overflow-hidden bg-card/40 backdrop-blur-sm shadow-md animate-in fade-in duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/40 text-muted-foreground font-semibold text-xs uppercase tracking-wider bg-card/20 select-none">
                <th
                  onClick={() => onSortChange('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center">
                    <span>Merchant / Ledger</span>
                    {renderSortIndicator('name')}
                  </div>
                </th>
                <th className="py-3.5 px-4">Account Link</th>
                <th
                  onClick={() => onSortChange('date')}
                  className="py-3.5 px-4 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center">
                    <span>Date</span>
                    {renderSortIndicator('date')}
                  </div>
                </th>
                <th className="py-3.5 px-4">Status</th>
                <th
                  onClick={() => onSortChange('amount')}
                  className="py-3.5 px-4 cursor-pointer hover:text-foreground transition-colors text-right"
                >
                  <div className="flex items-center justify-end">
                    <span>Amount</span>
                    {renderSortIndicator('amount')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-medium">
                    No transactions match the active filters.
                  </td>
                </tr>
              ) : (
                transactions.map((tx, index) => {
                  const isIncome = tx.amount < 0;
                  const absAmount = Math.abs(tx.amount);
                  const isFocused = focusedRowIndex === index;

                  return (
                    <tr
                      key={tx.id}
                      ref={(el) => { rowRefs.current[index] = el; }}
                      tabIndex={0}
                      onFocus={() => setFocusedRowIndex(index)}
                      onKeyDown={(e) => handleKeyDown(e, index, tx)}
                      onClick={() => setSelectedTx(tx)}
                      className={`hover:bg-muted/15 transition-colors cursor-pointer outline-none ${isFocused ? 'bg-muted/10 ring-1 ring-primary/40' : ''}`}
                      aria-label={`Transaction from ${tx.merchantName || tx.name} for ${formatCurrency(absAmount)}`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-foreground flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isIncome ? 'bg-cyan-500/10 text-cyan-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {isIncome ? <ArrowDownLeft className="h-4.5 w-4.5" /> : <ArrowUpRight className="h-4.5 w-4.5" />}
                        </div>
                        <span className="truncate max-w-[200px] block">
                          {tx.merchantName || tx.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-medium">
                        {tx.account.bank.institutionName} • {tx.account.name}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {formatDate(tx.date.toISOString().split('T')[0])}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(tx.status)}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-extrabold ${isIncome ? 'text-cyan-500' : 'text-foreground'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(absAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTx(tx);
                          }}
                          className="hover:bg-accent/40 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="sr-only">Details</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/20 pt-4 px-2">
          <span className="text-xs text-muted-foreground font-medium">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="bg-card/40"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="bg-card/40"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Transaction details popup modal */}
      <TransactionDetailModal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
      />
    </>
  );
}
