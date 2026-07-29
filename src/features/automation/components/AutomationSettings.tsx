'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Cpu, Plus, Trash2, Loader2, Play, Settings } from 'lucide-react';
import { createAutomationRuleAction, deleteAutomationRuleAction } from '../actions/automationActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

export interface AutomationRuleRecord {
  id: string;
  userId: string;
  triggerType: string; // BALANCE_BELOW | SPENDING_EXCEEDS
  triggerValue: number;
  actionType: string; // ALERT_INBOX | AUTO_TRANSFER
  actionDetails: string;
  isActive: boolean;
}

interface AutomationSettingsProps {
  userId: string;
  rules: AutomationRuleRecord[];
}

const RuleFormSchema = z.object({
  triggerType: z.enum(['BALANCE_BELOW', 'SPENDING_EXCEEDS']),
  triggerValue: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Value must be positive'),
  actionType: z.enum(['ALERT_INBOX', 'AUTO_TRANSFER']),
  actionDetails: z.string().min(1, 'Notification message or account ID is required'),
});

type RuleFormInput = z.infer<typeof RuleFormSchema>;

export function AutomationSettings({ userId, rules }: AutomationSettingsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RuleFormInput>({
    resolver: zodResolver(RuleFormSchema),
    defaultValues: {
      triggerType: 'BALANCE_BELOW',
      actionType: 'ALERT_INBOX',
    },
  });

  const onSubmit = async (data: RuleFormInput) => {
    setIsSubmitting(true);
    setError(null);
    const response = await createAutomationRuleAction(
      userId,
      data.triggerType,
      parseFloat(data.triggerValue),
      data.actionType,
      data.actionDetails,
    );
    setIsSubmitting(false);

    if (response.success) {
      setIsAdding(false);
      reset();
    } else {
      setError(response.error || 'Failed to save automation rule.');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return;
    setIsDeletingId(id);
    await deleteAutomationRuleAction(id);
    setIsDeletingId(null);
  };

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Automation Rules</CardTitle>
          <CardDescription>Configure smart triggers to monitor and automate bank parameters.</CardDescription>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="shadow-md animate-in"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>{isAdding ? 'Cancel' : 'New Rule'}</span>
        </Button>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Add Rule Form */}
        {isAdding && (
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 rounded-xl bg-muted/20 border border-border/20 space-y-4 animate-in slide-in-from-top duration-300">
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-cyan-500 animate-spin" />
              <span>Create Custom Rule Trigger</span>
            </h4>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trigger-type">When... (Trigger condition)</Label>
                <select
                  id="trigger-type"
                  className="flex h-9 w-full rounded-xl border border-input bg-background/50 px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                  {...register('triggerType')}
                >
                  <option value="BALANCE_BELOW" className="bg-card text-foreground">Account Balance Drops Below</option>
                  <option value="SPENDING_EXCEEDS" className="bg-card text-foreground">Single Charge Exceeds</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger-value">Threshold Value ($)</Label>
                <Input id="trigger-value" type="number" placeholder="500" disabled={isSubmitting} {...register('triggerValue')} />
                {errors.triggerValue && <p className="text-xs text-destructive font-medium">{errors.triggerValue.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="action-type">Then execute... (Action type)</Label>
                <select
                  id="action-type"
                  className="flex h-9 w-full rounded-xl border border-input bg-background/50 px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                  {...register('actionType')}
                >
                  <option value="ALERT_INBOX" className="bg-card text-foreground">Send Alert Notification</option>
                  <option value="AUTO_TRANSFER" className="bg-card text-foreground">Automated Dwolla Transfer</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action-details">Action Parameters / Alert message</Label>
                <Input id="action-details" placeholder="e.g. Warning: funds are running low" disabled={isSubmitting} {...register('actionDetails')} />
                {errors.actionDetails && <p className="text-xs text-destructive font-medium">{errors.actionDetails.message}</p>}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Enable Rule'
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Rules logs */}
        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground font-medium border border-dashed border-border/40 rounded-xl bg-card/10">
              No automation rules active. Configure your first rule to lock automated checkups.
            </div>
          ) : (
            rules.map((rule) => {
              const isDeleting = isDeletingId === rule.id;

              return (
                <div
                  key={rule.id}
                  className="p-4 rounded-xl border border-border/30 bg-card/20 hover:border-border/80 transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                      <Cpu className="h-5 w-5" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {rule.triggerType === 'BALANCE_BELOW' ? 'Balance Alerts' : 'Exceed Charges Warning'}
                        </span>
                        <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-0.5">
                          <Play className="h-2 w-2 fill-emerald-500" /> Active
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        If {rule.triggerType === 'BALANCE_BELOW' ? 'total balance drops below' : 'any charge exceeds'}{' '}
                        <strong>{formatCurrency(rule.triggerValue)}</strong>, execute{' '}
                        <strong>{rule.actionType === 'ALERT_INBOX' ? 'Alert Inbox' : 'Auto Transfer'}</strong>.
                      </p>
                      <p className="text-[10px] italic text-muted-foreground">
                        Params: {rule.actionDetails}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end items-center">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      disabled={isDeleting}
                      onClick={() => handleDeleteRule(rule.id)}
                      className="hover:bg-accent/40 text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
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
