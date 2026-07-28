'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Loader2, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';
import { RecipientCarousel, RecipientData } from './RecipientCarousel';
import { initiateTransferAction } from '../actions/transferActions';
import { AccountData } from '@/features/accounts/components/AccountCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

interface TransferFormProps {
  userId: string;
  accounts: AccountData[];
  recipients: RecipientData[];
  onTransferSuccess?: () => void;
}

// Zod schema for money transfers
const TransferSchema = z.object({
  type: z.enum(['INTERNAL', 'EXTERNAL']),
  senderAccountId: z.string().min(1, 'Source account is required'),
  recipientAccountId: z.string().optional(),
  recipientId: z.string().optional(),
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be positive')
    .refine((val) => parseFloat(val) <= 5000, 'Daily single transfer limit is $5,000'),
  scheduledDate: z.string().optional(),
}).refine((data) => {
  if (data.type === 'INTERNAL') {
    return !!data.recipientAccountId && data.recipientAccountId !== data.senderAccountId;
  }
  return !!data.recipientId;
}, {
  message: 'Invalid transfer target coordinates',
  path: ['recipientAccountId'],
});

type TransferInput = z.infer<typeof TransferSchema>;

export function TransferForm({
  userId,
  accounts,
  recipients,
  onTransferSuccess,
}: TransferFormProps) {
  const [activeTab, setActiveTab] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  interface SuccessDetails {
    amount: number;
    type: 'INTERNAL' | 'EXTERNAL';
    scheduled: boolean;
    date: string;
  }
  const [successDetails, setSuccessDetails] = useState<SuccessDetails | null>(null);

  // Generate an idempotency key on mount and after successful transfers
  const generateIdempotencyKey = () => {
    setIdempotencyKey(`idem_${Date.now()}_${Math.random().toString(36).substring(5)}`);
  };

  useEffect(() => {
    generateIdempotencyKey();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<TransferInput>({
    resolver: zodResolver(TransferSchema),
    defaultValues: {
      type: 'INTERNAL',
      senderAccountId: '',
      recipientAccountId: '',
      recipientId: '',
      amount: '',
      scheduledDate: '',
    },
  });

  const selectedSenderId = watch('senderAccountId');
  const enteredAmount = watch('amount');

  // Find selected sender account to check balance
  const selectedSenderAccount = accounts.find((acc) => acc.id === selectedSenderId);
  const isInsufficientFunds = selectedSenderAccount && enteredAmount
    ? parseFloat(enteredAmount) > selectedSenderAccount.balanceCurrent
    : false;

  const handleTabChange = (tab: 'INTERNAL' | 'EXTERNAL') => {
    setActiveTab(tab);
    setValue('type', tab);
    setValue('recipientAccountId', '');
    setValue('recipientId', '');
    setApiError(null);
  };

  const handleSelectRecipient = (recipient: RecipientData) => {
    handleTabChange('EXTERNAL');
    setValue('recipientId', recipient.id);
  };

  const onSubmit = async (data: TransferInput) => {
    if (isInsufficientFunds) {
      setApiError('Transfer blocked: Insufficient funds in the source account.');
      return;
    }

    setIsSending(true);
    setApiError(null);

    const response = await initiateTransferAction({
      userId,
      amount: parseFloat(data.amount),
      type: data.type,
      senderAccountId: data.senderAccountId,
      recipientAccountId: data.recipientAccountId,
      recipientId: data.recipientId,
      scheduledDate: data.scheduledDate || undefined,
      idempotencyKey,
    });

    setIsSending(false);

    if (response.success) {
      setIsSuccess(true);
      setSuccessDetails({
        amount: parseFloat(data.amount),
        type: data.type,
        scheduled: !!data.scheduledDate,
        date: data.scheduledDate || new Date().toLocaleDateString(),
      });
      
      // Regenerate idempotency key to prevent double submits if they do another transaction
      generateIdempotencyKey();

      setTimeout(() => {
        setIsSuccess(false);
        setSuccessDetails(null);
        reset();
        if (onTransferSuccess) onTransferSuccess();
      }, 3500);
    } else {
      setApiError(response.error || 'Transfer failed.');
    }
  };

  // Renders premium success animation card overlay
  if (isSuccess && successDetails) {
    return (
      <Card className="border border-emerald-500/30 bg-card/60 backdrop-blur-md p-10 text-center max-w-xl mx-auto rounded-2xl flex flex-col items-center justify-center space-y-6 shadow-xl shadow-emerald-500/5 animate-in zoom-in duration-300">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black tracking-tight text-foreground">
            {successDetails.scheduled ? 'Transfer Scheduled' : 'Transfer Complete'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Your transfer of <span className="font-extrabold text-foreground">{formatCurrency(successDetails.amount)}</span> has been securely processed.
          </p>
        </div>
        <div className="text-xs bg-muted/40 p-2.5 rounded-lg border border-border/20 text-muted-foreground w-full font-medium space-y-1">
          <div>Transaction Type: {successDetails.type === 'INTERNAL' ? 'Internal Link' : 'External ACH'}</div>
          <div>Date: {successDetails.date}</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-lg max-w-2xl mx-auto rounded-2xl">
      <CardContent className="p-6 space-y-6">
        {/* Carousel overlay */}
        {recipients.length > 0 && (
          <RecipientCarousel
            userId={userId}
            recipients={recipients}
            onSelectRecipient={handleSelectRecipient}
          />
        )}

        {/* Form controls */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {apiError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium flex items-center gap-2 animate-in slide-in-from-top duration-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Form Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 rounded-lg border border-border/20 select-none">
            <button
              type="button"
              onClick={() => handleTabChange('INTERNAL')}
              className={`py-2 text-sm font-semibold rounded-md transition-all duration-300 cursor-pointer ${activeTab === 'INTERNAL' ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Between Accounts
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('EXTERNAL')}
              className={`py-2 text-sm font-semibold rounded-md transition-all duration-300 cursor-pointer ${activeTab === 'EXTERNAL' ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              To Someone Else
            </button>
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            {/* Source Account selection */}
            <div className="space-y-2">
              <Label htmlFor="senderAccountId">From Account</Label>
              <select
                id="senderAccountId"
                disabled={isSending}
                {...register('senderAccountId')}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
              >
                <option value="">Select Account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.nickname || acc.name} ({formatCurrency(acc.balanceCurrent)})
                  </option>
                ))}
              </select>
              {errors.senderAccountId && (
                <p className="text-xs text-destructive font-medium">{errors.senderAccountId.message}</p>
              )}
            </div>

            {/* Target selection based on Active Tab */}
            {activeTab === 'INTERNAL' ? (
              <div className="space-y-2">
                <Label htmlFor="recipientAccountId">To Account</Label>
                <select
                  id="recipientAccountId"
                  disabled={isSending}
                  {...register('recipientAccountId')}
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                  <option value="">Select Destination</option>
                  {accounts
                    .filter((acc) => acc.id !== selectedSenderId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.nickname || acc.name} ({formatCurrency(acc.balanceCurrent)})
                      </option>
                    ))}
                </select>
                {errors.recipientAccountId && (
                  <p className="text-xs text-destructive font-medium">{errors.recipientAccountId.message}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="recipientId">To Recipient</Label>
                <select
                  id="recipientId"
                  disabled={isSending}
                  {...register('recipientId')}
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                  <option value="">Select Recipient</option>
                  {recipients.map((rec) => (
                    <option key={rec.id} value={rec.id}>
                      {rec.name} (*{rec.accountNumber.slice(-4)})
                    </option>
                  ))}
                </select>
                {errors.recipientId && (
                  <p className="text-xs text-destructive font-medium">{errors.recipientId.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            {/* Amount input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  disabled={isSending}
                  className="pl-9 bg-card/40"
                  {...register('amount')}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-destructive font-medium">{errors.amount.message}</p>
              )}
              {isInsufficientFunds && (
                <p className="text-xs text-destructive font-medium">Insufficient funds in selected account.</p>
              )}
              {selectedSenderAccount && !isInsufficientFunds && enteredAmount && (
                <p className="text-xs text-muted-foreground font-medium">
                  Remaining Balance: {formatCurrency(selectedSenderAccount.balanceCurrent - parseFloat(enteredAmount))}
                </p>
              )}
            </div>

            {/* Scheduled Date input */}
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Schedule Transfer (Optional)</Label>
              <Input
                id="scheduledDate"
                type="date"
                disabled={isSending}
                min={new Date().toISOString().split('T')[0]}
                className="bg-card/40 text-sm"
                {...register('scheduledDate')}
              />
              <p className="text-[10px] text-muted-foreground leading-tight">
                Leave blank for instant processing. Future schedules will clear on release dates.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSending || isInsufficientFunds || !selectedSenderId}
            className="w-full shadow-lg shadow-primary/10"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Processing ACH...
              </>
            ) : (
              <>
                Confirm Transfer
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
