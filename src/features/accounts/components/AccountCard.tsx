'use client';

import React from 'react';
import { Wallet, Percent, CreditCard, DollarSign } from 'lucide-react';
import { EditNicknameDialog } from './EditNicknameDialog';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, maskAccountNumber } from '@/utils/format';

export interface AccountData {
  id: string;
  bankId: string;
  name: string;
  nickname: string | null;
  mask: string;
  officialName: string | null;
  type: string;
  subtype: string | null;
  balanceCurrent: number;
  balanceAvailable: number | null;
  balanceLimit: number | null;
}

interface AccountCardProps {
  account: AccountData;
}

export function AccountCard({ account }: AccountCardProps) {
  const isSavings = account.type === 'savings';
  const isCredit = account.type === 'credit';
  const isInvestment = account.type === 'investment';

  // Choose styling details based on account type
  let typeColor = 'bg-blue-600 text-blue-600';
  let typeLabel = 'Checking';
  let Icon = Wallet;

  if (isSavings) {
    typeColor = 'bg-cyan-500 text-cyan-500';
    typeLabel = 'Savings';
    Icon = Percent;
  } else if (isCredit) {
    typeColor = 'bg-rose-500 text-rose-500';
    typeLabel = 'Credit Card';
    Icon = CreditCard;
  } else if (isInvestment) {
    typeColor = 'bg-purple-500 text-purple-500';
    typeLabel = 'Investment';
    Icon = DollarSign;
  }

  return (
    <Card className="relative overflow-hidden border-border/60 bg-card/40 backdrop-blur-sm hover:border-border/100 hover:shadow-lg transition-all duration-300 group">
      {/* Accent Color Band */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${typeColor.split(' ')[0]}`} />
      
      <CardContent className="p-5 space-y-4">
        {/* Header (Names and Edit Nickname) */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground truncate">
                {account.nickname || account.name}
              </span>
              <EditNicknameDialog
                accountId={account.id}
                currentName={account.name}
                currentNickname={account.nickname}
              />
            </div>
            {account.nickname && (
              <span className="text-xs text-muted-foreground truncate">
                {account.name}
              </span>
            )}
          </div>
          
          <div className={`flex h-7 w-7 items-center justify-center rounded-md bg-accent/30 ${typeColor.split(' ')[1]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        {/* Balance details */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
            Current Balance
          </span>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(account.balanceCurrent)}
          </div>
          {account.balanceAvailable !== null && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Available:</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(account.balanceAvailable)}
              </span>
            </div>
          )}
        </div>

        {/* Footer (Mask & Type label) */}
        <div className="flex items-center justify-between border-t border-border/20 pt-3 text-[11px] font-medium text-muted-foreground">
          <span className="font-mono tracking-wider">
            {maskAccountNumber(account.mask, 4)}
          </span>
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
            {typeLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
