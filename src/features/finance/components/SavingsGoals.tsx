'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Target, Loader2, Plus, Edit, Trash2, Calendar, Sparkles } from 'lucide-react';
import { createSavingsGoalAction, updateSavingsGoalAction, deleteSavingsGoalAction } from '../actions/financeActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/utils/format';

export interface SavingsGoalRecord {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface SavingsGoalsProps {
  userId: string;
  goals: SavingsGoalRecord[];
}

const GoalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  targetAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be positive'),
  currentAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 'Amount must be positive or zero'),
  targetDate: z.string().min(1, 'Select target date'),
});

type GoalFormInput = z.infer<typeof GoalSchema>;

export function SavingsGoals({ userId, goals }: SavingsGoalsProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoalRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GoalFormInput>({
    resolver: zodResolver(GoalSchema),
  });

  const handleOpenCreate = () => {
    setIsCreateOpen(true);
    reset({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      targetDate: '',
    });
  };

  const handleOpenEdit = (goal: SavingsGoalRecord) => {
    setEditingGoal(goal);
    reset({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      targetDate: goal.targetDate instanceof Date 
        ? goal.targetDate.toISOString().split('T')[0] 
        : String(goal.targetDate).split('T')[0],
    });
  };

  const onSubmitCreate = async (data: GoalFormInput) => {
    setIsSubmitting(true);
    setError(null);
    const response = await createSavingsGoalAction(
      userId,
      data.name,
      parseFloat(data.targetAmount),
      data.targetDate,
    );
    setIsSubmitting(false);

    if (response.success) {
      setIsCreateOpen(false);
      reset();
    } else {
      setError(response.error || 'Failed to create goal.');
    }
  };

  const onSubmitEdit = async (data: GoalFormInput) => {
    if (!editingGoal) return;
    setIsSubmitting(true);
    setError(null);
    const response = await updateSavingsGoalAction(
      editingGoal.id,
      data.name,
      parseFloat(data.targetAmount),
      parseFloat(data.currentAmount),
      data.targetDate,
    );
    setIsSubmitting(false);

    if (response.success) {
      setEditingGoal(null);
      reset();
    } else {
      setError(response.error || 'Failed to update goal.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;
    setIsDeletingId(id);
    await deleteSavingsGoalAction(id);
    setIsDeletingId(null);
  };

  const calculateDaysRemaining = (date: Date) => {
    const target = new Date(date);
    // eslint-disable-next-line react-hooks/purity
    const diff = target.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Savings Goals</CardTitle>
          <CardDescription>Plan and monitor progress towards your targets.</CardDescription>
        </div>

        {/* Create Goal Dialog Trigger */}
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setError(null);
        }}>
          <DialogTrigger
            render={
              <Button size="sm" onClick={handleOpenCreate} className="shadow-md">
                <Plus className="h-4 w-4 mr-1.5" />
                <span>New Goal</span>
              </Button>
            }
          />
          <DialogContent className="bg-card/95 backdrop-blur-md border-border/60 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
              <DialogDescription>
                Define your savings target parameters.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive font-medium text-center">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input id="name" placeholder="e.g. Tesla Model Y" disabled={isSubmitting} {...register('name')} />
                {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount ($)</Label>
                  <Input id="targetAmount" type="number" step="1" placeholder="5000" disabled={isSubmitting} {...register('targetAmount')} />
                  {errors.targetAmount && <p className="text-xs text-destructive font-medium">{errors.targetAmount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input id="targetDate" type="date" min={new Date().toISOString().split('T')[0]} disabled={isSubmitting} {...register('targetDate')} />
                  {errors.targetDate && <p className="text-xs text-destructive font-medium">{errors.targetDate.message}</p>}
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Create Goal'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {/* Goals List */}
        <div className="space-y-6">
          {goals.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground font-medium border border-dashed border-border/40 rounded-xl bg-card/10">
              No savings goals configured. Let&apos;s create your first goal!
            </div>
          ) : (
            goals.map((goal) => {
              const percent = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
              const daysLeft = calculateDaysRemaining(goal.targetDate);
              const isDeleting = isDeletingId === goal.id;

              return (
                <div key={goal.id} className="p-4 rounded-xl border border-border/30 bg-card/20 hover:border-border/80 transition-all duration-300 space-y-3.5 group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{goal.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Target: {formatDate(goal.targetDate instanceof Date ? goal.targetDate.toISOString().split('T')[0] : String(goal.targetDate).split('T')[0])}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleOpenEdit(goal)}
                        className="hover:bg-accent/40 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        disabled={isDeleting}
                        onClick={() => handleDelete(goal.id)}
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

                  {/* Progress Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">
                        {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                      </span>
                      <span className="text-foreground">{percent}%</span>
                    </div>

                    <div className="relative h-2 w-full bg-muted/40 rounded-full overflow-hidden border border-border/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground pt-1 border-t border-border/10">
                      <span>{daysLeft} days remaining</span>
                      {percent >= 100 && (
                        <span className="text-cyan-500 flex items-center gap-0.5">
                          <Sparkles className="h-3 w-3 animate-pulse" /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      {/* Edit Goal Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => {
        if (!open) {
          setEditingGoal(null);
          setError(null);
        }
      }}>
        <DialogContent className="bg-card/95 backdrop-blur-md border-border/60 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Savings Goal</DialogTitle>
            <DialogDescription>
              Modify savings goal parameters or deposit/top up savings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive font-medium text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Goal Name</Label>
              <Input id="edit-name" disabled={isSubmitting} {...register('name')} />
              {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-currentAmount">Current Savings ($)</Label>
                <Input id="edit-currentAmount" type="number" step="0.01" disabled={isSubmitting} {...register('currentAmount')} />
                {errors.currentAmount && <p className="text-xs text-destructive font-medium">{errors.currentAmount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-targetAmount">Target Amount ($)</Label>
                <Input id="edit-targetAmount" type="number" step="1" disabled={isSubmitting} {...register('targetAmount')} />
                {errors.targetAmount && <p className="text-xs text-destructive font-medium">{errors.targetAmount.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-targetDate">Target Date</Label>
              <Input id="edit-targetDate" type="date" min={new Date().toISOString().split('T')[0]} disabled={isSubmitting} {...register('targetDate')} />
              {errors.targetDate && <p className="text-xs text-destructive font-medium">{errors.targetDate.message}</p>}
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingGoal(null)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Goal'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
