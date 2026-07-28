import React from 'react';
import { getCurrentUser } from '@/features/auth/actions/authActions';
import { getConnectedAccountsAction } from '@/features/accounts/actions/accountActions';
import { getRecipientsAction, getTransferHistoryAction } from '@/features/transfers/actions/transferActions';
import { TransferForm } from '@/features/transfers/components/TransferForm';
import { TransferHistory, TransferRecord } from '@/features/transfers/components/TransferHistory';
import { Card, CardContent } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { PlaidLinkButton } from '@/features/plaid/components/PlaidLinkButton';

export default async function TransfersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Retrieve user banks and flatten accounts
  const banks = await getConnectedAccountsAction(user.$id);
  const accounts = banks.flatMap((bank) => bank.accounts);

  // Retrieve recipients list
  const recipients = await getRecipientsAction(user.$id);

  // Retrieve transfers history logs
  const transfers = await getTransferHistoryAction(user.$id);

  const hasNoAccounts = accounts.length === 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Money Transfer</h1>
        <p className="text-muted-foreground text-sm">
          Execute safe internal transactions and ACH bank-to-bank wire transfers.
        </p>
      </div>

      {hasNoAccounts ? (
        /* Prompt linking if no bank is unlinked */
        <Card className="border-dashed border-2 border-border/80 bg-card/10 py-16 px-6 text-center max-w-xl mx-auto rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500 shadow-inner">
              <Landmark className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">No Accounts Connected</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                You must securely connect at least one financial institution using Plaid to send, receive, or schedule money transfers.
              </p>
            </div>
            <PlaidLinkButton userId={user.$id} size="lg" className="shadow-lg shadow-primary/10" />
          </CardContent>
        </Card>
      ) : (
        /* Render form and transactions ledger */
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <TransferForm
              userId={user.$id}
              accounts={accounts}
              recipients={recipients}
            />
          </div>
          <div className="lg:col-span-5">
            <TransferHistory
              transfers={transfers as unknown as TransferRecord[]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
