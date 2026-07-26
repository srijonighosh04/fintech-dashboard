import React from 'react';
import dynamic from 'next/dynamic';
import { ArrowUpRight, ArrowDownLeft, Plus, DollarSign, Wallet, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency, formatDate, maskAccountNumber } from '@/utils/format';
import { Account, Transaction } from '@/types';

const AnalyticsChart = dynamic(
  () => import('@/features/dashboard/components/AnalyticsChart').then((m) => m.AnalyticsChart),
  {
    ssr: false,
    loading: () => (
      <Card className="col-span-4 border border-border/60 bg-card/60 backdrop-blur-md">
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

// Mock Banking Data
const mockAccounts: Account[] = [
  { id: '1', name: 'Premium Checking', balance: 14250.45, accountNumber: '123456789012', type: 'checking' },
  { id: '2', name: 'Elite Savings', balance: 52400.90, accountNumber: '987654321098', type: 'savings' },
  { id: '3', name: 'Investment Account', balance: 8530.20, accountNumber: '556677889900', type: 'credit' },
];

const mockTransactions: Transaction[] = [
  { id: 't1', amount: 120.50, type: 'expense', merchant: 'AWS Services', date: '2026-07-25', category: 'Infrastructure', status: 'completed' },
  { id: 't2', amount: 2500.00, type: 'income', merchant: 'Salary Paycheck', date: '2026-07-24', category: 'Income', status: 'completed' },
  { id: 't3', amount: 45.30, type: 'expense', merchant: 'Starbucks Coffee', date: '2026-07-24', category: 'Food & Dining', status: 'completed' },
  { id: 't4', amount: 800.00, type: 'expense', merchant: 'Landlord Rent', date: '2026-07-01', category: 'Rent', status: 'completed' },
  { id: 't5', amount: 15.00, type: 'expense', merchant: 'Github Copilot', date: '2026-07-20', category: 'Software', status: 'pending' },
];

export default async function DashboardPage() {

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm">
            Here is what is happening with your digital portfolios today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex bg-card/40 border-border">
            View Statements
          </Button>
          <Button size="sm" className="shadow-md shadow-primary/10">
            <Plus className="mr-1.5 h-4 w-4" /> Link Account
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {mockAccounts.map((account) => {
          const isSavings = account.type === 'savings';
          const isCredit = account.type === 'credit';
          
          return (
            <Card key={account.id} className="relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${isSavings ? 'bg-cyan-500' : isCredit ? 'bg-purple-500' : 'bg-blue-600'}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  {account.name}
                </CardTitle>
                {isSavings ? (
                  <Percent className="h-4.5 w-4.5 text-cyan-500" />
                ) : isCredit ? (
                  <DollarSign className="h-4.5 w-4.5 text-purple-500" />
                ) : (
                  <Wallet className="h-4.5 w-4.5 text-blue-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {formatCurrency(account.balance)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 tracking-wider font-mono">
                  {maskAccountNumber(account.accountNumber)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Chart */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-4">
          <AnalyticsChart />
        </div>
      </div>

      {/* Transactions Section */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold tracking-tight">Recent Transactions</CardTitle>
            <p className="text-xs text-muted-foreground">Detailed history of recent ledger actions.</p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs font-semibold hover:underline">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Merchant / Ledger</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {mockTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isPending = tx.status === 'pending';

                  return (
                    <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-foreground flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isIncome ? 'bg-cyan-500/10 text-cyan-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {isIncome ? <ArrowDownLeft className="h-4.5 w-4.5" /> : <ArrowUpRight className="h-4.5 w-4.5" />}
                        </div>
                        {tx.merchant}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">{tx.category}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{formatDate(tx.date)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold border ${isPending ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold ${isIncome ? 'text-cyan-500' : 'text-foreground'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
