'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Loader2, Plus, Edit2, AlertTriangle, CheckCircle, Flame } from 'lucide-react';
import { upsertBudgetAction } from '../actions/financeActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

export interface BudgetRecord {
  id: string;
  userId: string;
  category: string;
  limit: number;
  month: number;
  year: number;
}

interface BudgetPlannerProps {
  userId: string;
  budgets: BudgetRecord[];
  spending: Record<string, number>;
  month: number;
  year: number;
}

const CATEGORIES = [
  'Rent & Housing',
  'Food & Dining',
  'Software & SaaS',
  'Entertainment',
  'Utilities & Others',
  'Infrastructure',
  'Travel',
];

const BudgetLimitSchema = z.object({
  category: z.string().min(1, 'Select a category'),
  limit: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Limit must be positive'),
});

type BudgetLimitInput = z.infer<typeof BudgetLimitSchema>;

export function BudgetPlanner({
  userId,
  budgets,
  spending,
  month,
  year,
}: BudgetPlannerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BudgetLimitInput>({
    resolver: zodResolver(BudgetLimitSchema),
    defaultValues: {
      category: '',
      limit: '',
    },
  });

  const onSubmit = async (data: BudgetLimitInput) => {
    setIsSubmitting(true);
    setError(null);
    const response = await upsertBudgetAction(
      userId,
      data.category,
      parseFloat(data.limit),
      month,
      year,
    );
    setIsSubmitting(false);

    if (response.success) {
      setEditingCategory(null);
      reset();
    } else {
      setError(response.error || 'Failed to save budget limit.');
    }
  };

  const handleEdit = (category: string, currentLimit?: number) => {
    setEditingCategory(category);
    setValue('category', category);
    setValue('limit', currentLimit ? String(currentLimit) : '');
  };

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">Category Budgets</CardTitle>
        <CardDescription>Configure limits and track actual spending per category.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upsert Budget Form */}
        {editingCategory ? (
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 rounded-xl bg-muted/20 border border-border/20 space-y-4 animate-in slide-in-from-top duration-300">
            <h4 className="text-sm font-bold flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-cyan-500" />
              <span>Set Limit for {editingCategory}</span>
            </h4>
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive font-medium">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="limit">Monthly Limit ($)</Label>
                <Input
                  id="limit"
                  type="number"
                  step="0.01"
                  disabled={isSubmitting}
                  placeholder="0.00"
                  {...register('limit')}
                />
                {errors.limit && <p className="text-xs text-destructive font-medium">{errors.limit.message}</p>}
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCategory(null);
                    reset();
                    setError(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Limit'
                  )}
                </Button>
              </div>
            </div>
          </form>
        ) : null}

        {/* Categories Progress list */}
        <div className="space-y-5">
          {CATEGORIES.map((cat) => {
            const budget = budgets.find((b) => b.category === cat);
            const limit = budget ? budget.limit : 0;
            const spent = spending[cat] || 0;
            const remaining = limit - spent;
            const percent = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
            
            // Warnings flags
            const isOverBudget = spent > limit && limit > 0;
            const isNearLimit = spent >= limit * 0.85 && spent <= limit && limit > 0;

            let barColor = 'bg-cyan-500';
            if (isOverBudget) barColor = 'bg-rose-500';
            else if (isNearLimit) barColor = 'bg-amber-500';

            return (
              <div key={cat} className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-foreground">{cat}</span>
                    <div className="flex items-center gap-1.5">
                      {limit > 0 ? (
                        <span className="text-xs text-muted-foreground font-medium">
                          {formatCurrency(spent)} of {formatCurrency(limit)} limit
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">
                          No limit set
                        </span>
                      )}
                      
                      {/* Alerts Indicators */}
                      {isOverBudget && (
                        <span className="inline-flex items-center rounded-md px-1.5 py-0.2 text-[10px] font-bold border bg-rose-500/10 text-rose-500 border-rose-500/20 uppercase tracking-wide gap-0.5">
                          <Flame className="h-3 w-3 fill-rose-500" />
                          <span>Over</span>
                        </span>
                      )}
                      {isNearLimit && (
                        <span className="inline-flex items-center rounded-md px-1.5 py-0.2 text-[10px] font-bold border bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase tracking-wide gap-0.5">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Warning</span>
                        </span>
                      )}
                      {limit > 0 && !isOverBudget && !isNearLimit && (
                        <span className="inline-flex items-center rounded-md px-1.5 py-0.2 text-[10px] font-bold border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-wide gap-0.5">
                          <CheckCircle className="h-3 w-3" />
                          <span>Good</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {limit > 0 && (
                      <span className={`text-xs font-mono font-bold ${remaining < 0 ? 'text-rose-500' : 'text-muted-foreground'}`}>
                        {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleEdit(cat, limit)}
                      className="hover:bg-accent/40 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {limit > 0 ? (
                  <div className="relative h-2 w-full bg-muted/40 rounded-full overflow-hidden border border-border/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                ) : (
                  <div className="h-2 w-full bg-muted/15 rounded-full border border-dashed border-border/40 flex items-center justify-center">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      Set budget limit
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
