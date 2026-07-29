'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Plus, Check, Loader2, Trash2, Clock, CheckCircle } from 'lucide-react';
import { createBillAction, payBillAction, deleteBillAction } from '../actions/automationActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/utils/format';

export interface BillRecord {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: Date;
  status: string; // UNPAID | PAID
}

interface BillRemindersProps {
  userId: string;
  bills: BillRecord[];
}

const BillFormSchema = z.object({
  name: z.string().min(2, 'Merchant name is required'),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be positive'),
  dueDate: z.string().min(1, 'Select a due date'),
});

type BillFormInput = z.infer<typeof BillFormSchema>;

export function BillReminders({ userId, bills }: BillRemindersProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPayingId, setIsPayingId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BillFormInput>({
    resolver: zodResolver(BillFormSchema),
  });

  const onSubmit = async (data: BillFormInput) => {
    setIsSubmitting(true);
    setError(null);
    const response = await createBillAction(
      userId,
      data.name,
      parseFloat(data.amount),
      data.dueDate,
    );
    setIsSubmitting(false);

    if (response.success) {
      setIsAdding(false);
      reset();
    } else {
      setError(response.error || 'Failed to save bill reminder.');
    }
  };

  const handlePayBill = async (id: string) => {
    setIsPayingId(id);
    await payBillAction(id);
    setIsPayingId(null);
  };

  const handleDeleteBill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bill reminder?')) return;
    setIsDeletingId(id);
    await deleteBillAction(id);
    setIsDeletingId(null);
  };

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Upcoming Bills</CardTitle>
          <CardDescription>Configure reminders and check off settled bills.</CardDescription>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="shadow-md"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>{isAdding ? 'Cancel' : 'Add Bill'}</span>
        </Button>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Add Bill Form */}
        {isAdding && (
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 rounded-xl bg-muted/20 border border-border/20 space-y-4 animate-in slide-in-from-top duration-300">
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-cyan-500" />
              <span>Create Bill Reminder</span>
            </h4>
            
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bill-name">Billed Merchant</Label>
                <Input id="bill-name" placeholder="e.g. Electric Grid Inc" disabled={isSubmitting} {...register('name')} />
                {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bill-amount">Amount Due ($)</Label>
                <Input id="bill-amount" type="number" step="0.01" placeholder="0.00" disabled={isSubmitting} {...register('amount')} />
                {errors.amount && <p className="text-xs text-destructive font-medium">{errors.amount.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="bill-dueDate">Due Date</Label>
                <Input id="bill-dueDate" type="date" disabled={isSubmitting} {...register('dueDate')} />
                {errors.dueDate && <p className="text-xs text-destructive font-medium">{errors.dueDate.message}</p>}
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="submit" size="sm" className="w-full sm:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Reminder'
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Bills list grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {bills.length === 0 ? (
            <div className="col-span-1 sm:col-span-2 text-center py-12 text-sm text-muted-foreground font-medium border border-dashed border-border/40 rounded-xl bg-card/10">
              No bills scheduled. Add your first reminder to get started.
            </div>
          ) : (
            bills.map((bill) => {
              const isPaid = bill.status === 'PAID';
              const isPaying = isPayingId === bill.id;
              const isDeleting = isDeletingId === bill.id;

              return (
                <div
                  key={bill.id}
                  className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between h-36 ${
                    isPaid
                      ? 'border-emerald-500/20 bg-emerald-500/5 opacity-70'
                      : 'border-border/30 bg-card/25'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-foreground truncate max-w-[120px]">{bill.name}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                        {isPaid ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        <span>{isPaid ? 'Settled' : 'Pending'}</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon-xs"
                      disabled={isDeleting}
                      onClick={() => handleDeleteBill(bill.id)}
                      className="hover:bg-accent/40 text-muted-foreground hover:text-rose-500"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wide text-muted-foreground">Due Date</span>
                      <p className="text-xs font-semibold text-foreground">
                        {formatDate(bill.dueDate instanceof Date ? bill.dueDate.toISOString().split('T')[0] : String(bill.dueDate).split('T')[0])}
                      </p>
                    </div>

                    <div className="flex items-end gap-3">
                      <p className="text-sm font-extrabold text-foreground leading-none mb-1.5">{formatCurrency(bill.amount)}</p>
                      
                      {!isPaid && (
                        <Button
                          size="icon-sm"
                          disabled={isPaying}
                          onClick={() => handlePayBill(bill.id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shrink-0"
                        >
                          {isPaying ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
