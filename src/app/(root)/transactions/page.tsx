import React from 'react';
import { getCurrentUser } from '@/features/auth/actions/authActions';
import { getTransactionsAction } from '@/features/transactions/actions/transactionActions';
import { TransactionHeader } from '@/features/transactions/components/TransactionHeader';
import { TransactionListContainer } from '@/features/transactions/components/TransactionListContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { PlaidLinkButton } from '@/features/plaid/components/PlaidLinkButton';

interface TransactionsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    status?: string;
    minAmount?: string;
    maxAmount?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
    accountId?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  // Await the searchParams promise in Next.js 15
  const resolvedParams = await searchParams;

  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const search = resolvedParams.search || undefined;
  const category = resolvedParams.category || undefined;
  const status = resolvedParams.status || undefined;
  const minAmount = resolvedParams.minAmount ? parseFloat(resolvedParams.minAmount) : undefined;
  const maxAmount = resolvedParams.maxAmount ? parseFloat(resolvedParams.maxAmount) : undefined;
  const startDate = resolvedParams.startDate || undefined;
  const endDate = resolvedParams.endDate || undefined;
  const sortBy = (resolvedParams.sortBy as 'date' | 'amount' | 'name') || 'date';
  const sortOrder = (resolvedParams.sortOrder as 'asc' | 'desc') || 'desc';
  const accountId = resolvedParams.accountId || undefined;

  // Retrieve paginated and filtered transactions from PostgreSQL
  const { transactions, totalPages } = await getTransactionsAction({
    userId: user.$id,
    page,
    limit: 10,
    sortBy,
    sortOrder,
    search,
    category,
    status,
    minAmount,
    maxAmount,
    startDate,
    endDate,
    accountId,
  });

  const hasNoAccounts = transactions.length === 0 && !search && !category && !status && !minAmount && !maxAmount && !startDate && !endDate && !accountId;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Exporters and Header */}
      <TransactionHeader transactions={transactions} />

      {hasNoAccounts ? (
        /* Render a beautiful connection state if there are no links seeded yet */
        <Card className="border-dashed border-2 border-border/80 bg-card/10 py-16 px-6 text-center max-w-xl mx-auto rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500 shadow-inner">
              <Landmark className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">No Transactions Recorded</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Connect your banking accounts securely via Plaid. Once linked, we will sync and index your past transaction ledgers here.
              </p>
            </div>
            <PlaidLinkButton userId={user.$id} size="lg" className="shadow-lg shadow-primary/10" />
          </CardContent>
        </Card>
      ) : (
        /* Render the filter list and interactive data table */
        <TransactionListContainer
          transactions={transactions}
          page={page}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}
