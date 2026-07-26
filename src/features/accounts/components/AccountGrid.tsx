'use client';

import React, { useState } from 'react';
import { Landmark, Loader2, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';
import { AccountCard, AccountData } from './AccountCard';
import { PlaidLinkButton } from '@/features/plaid/components/PlaidLinkButton';
import { refreshBankBalancesAction } from '@/features/plaid/actions/plaidActions';
import { disconnectBankAction } from '../actions/accountActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface BankWithAccounts {
  id: string;
  userId: string;
  itemId: string;
  institutionId: string;
  institutionName: string;
  status: string;
  accounts: AccountData[];
  createdAt: Date;
  updatedAt: Date;
}

interface AccountGridProps {
  banks: BankWithAccounts[];
  userId: string;
}

export function AccountGrid({ banks, userId }: AccountGridProps) {
  const [refreshingBankId, setRefreshingBankId] = useState<string | null>(null);
  const [disconnectingBank, setDisconnectingBank] = useState<BankWithAccounts | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Trigger balance refresh
  const handleRefresh = async (bankId: string) => {
    setRefreshingBankId(bankId);
    setActionError(null);
    const response = await refreshBankBalancesAction(bankId);
    setRefreshingBankId(null);
    
    if (!response.success) {
      setActionError(response.error || 'Failed to refresh bank balances.');
    }
  };

  // Trigger bank disconnect
  const handleDisconnect = async () => {
    if (!disconnectingBank) return;
    setIsDeleting(true);
    setActionError(null);

    const response = await disconnectBankAction(disconnectingBank.id);
    setIsDeleting(false);

    if (response.success) {
      setDisconnectingBank(null);
    } else {
      setActionError(response.error || 'Failed to unlink bank.');
    }
  };

  // Empty State Layout
  if (banks.length === 0) {
    return (
      <Card className="border-dashed border-2 border-border/80 bg-card/10 py-16 px-6 text-center max-w-xl mx-auto rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500 shadow-inner">
            <Landmark className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight">No Connected Bank Accounts</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Link your financial institutions securely via Plaid to view balances, analyze transactions, and initiate transfers.
            </p>
          </div>
          <PlaidLinkButton userId={userId} size="lg" className="shadow-lg shadow-primary/10" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {actionError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {banks.map((bank) => {
        const isRefreshing = refreshingBankId === bank.id;
        const needsReauth = bank.status === 'REAUTH_REQUIRED';

        return (
          <div key={bank.id} className="space-y-4 border border-border/30 rounded-2xl p-6 bg-card/10">
            {/* Institution Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/40 text-muted-foreground border border-border/40">
                  <Landmark className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">{bank.institutionName}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${needsReauth ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                      {needsReauth ? 'Re-auth Required' : 'Connected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {needsReauth ? (
                  <PlaidLinkButton
                    userId={userId}
                    variant="outline"
                    size="sm"
                    className="border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-500"
                  />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRefresh(bank.id)}
                    disabled={isRefreshing}
                    className="bg-card/40"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDisconnectingBank(bank)}
                  className="bg-card/40 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  <span>Unlink</span>
                </Button>
              </div>
            </div>

            {/* Accounts Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {bank.accounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={!!disconnectingBank} onOpenChange={(open) => !open && setDisconnectingBank(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-md border-border/60 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5.5 w-5.5" />
              <span>Unlink Institution</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to unlink {disconnectingBank?.institutionName}? This will permanently remove all associated checking, savings, and credit cards from AstraBank.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setDisconnectingBank(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Unlinking...
                </>
              ) : (
                'Confirm Unlink'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
