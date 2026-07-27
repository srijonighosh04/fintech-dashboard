'use client';

import React from 'react';
import { FileDown, Download } from 'lucide-react';
import { TransactionWithAccountDetails } from '../actions/transactionActions';
import { exportToCSV, exportToPDF } from '@/utils/export';
import { Button } from '@/components/ui/button';

interface TransactionHeaderProps {
  transactions: TransactionWithAccountDetails[];
}

export function TransactionHeader({ transactions }: TransactionHeaderProps) {
  const handleCSVExport = () => {
    if (transactions.length === 0) return;
    exportToCSV(transactions);
  };

  const handlePDFExport = () => {
    if (transactions.length === 0) return;
    exportToPDF(transactions);
  };

  const isDisabled = transactions.length === 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground text-sm">
          Search, sort, filter, and export detailed logs of your account ledger actions.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isDisabled}
          onClick={handleCSVExport}
          className="bg-card/40 border-border hover:bg-muted/10"
        >
          <Download className="h-4 w-4 mr-1.5" />
          <span>Export CSV</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isDisabled}
          onClick={handlePDFExport}
          className="bg-card/40 border-border hover:bg-muted/10"
        >
          <FileDown className="h-4 w-4 mr-1.5" />
          <span>Export PDF</span>
        </Button>
      </div>
    </div>
  );
}
