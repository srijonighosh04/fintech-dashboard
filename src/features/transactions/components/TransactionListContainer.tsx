'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { TransactionTable } from './TransactionTable';
import { TransactionFilters } from './TransactionFilters';
import { TransactionWithAccountDetails } from '../actions/transactionActions';

interface TransactionListContainerProps {
  transactions: TransactionWithAccountDetails[];
  page: number;
  totalPages: number;
}

export function TransactionListContainer({
  transactions,
  page,
  totalPages,
}: TransactionListContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortBy = (searchParams.get('sortBy') as 'date' | 'amount' | 'name') || 'date';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (field: 'date' | 'amount' | 'name') => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSortBy = params.get('sortBy') || 'date';
    const currentSortOrder = params.get('sortOrder') || 'desc';

    if (currentSortBy === field) {
      params.set('sortOrder', currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      params.set('sortBy', field);
      params.set('sortOrder', 'desc');
    }
    params.set('page', '1'); // Reset to page 1 on sorting criteria change
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <TransactionFilters />
      <TransactionTable
        transactions={transactions}
        page={page}
        totalPages={totalPages}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />
    </div>
  );
}
