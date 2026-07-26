'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Edit2 } from 'lucide-react';
import { updateAccountNicknameAction } from '../actions/accountActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const NicknameSchema = z.object({
  nickname: z.string().max(30, 'Nickname must be under 30 characters'),
});

type NicknameInput = z.infer<typeof NicknameSchema>;

interface EditNicknameDialogProps {
  accountId: string;
  currentName: string;
  currentNickname: string | null;
}

export function EditNicknameDialog({
  accountId,
  currentName,
  currentNickname,
}: EditNicknameDialogProps) {
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NicknameInput>({
    resolver: zodResolver(NicknameSchema),
    defaultValues: {
      nickname: currentNickname || '',
    },
  });

  const onSubmit = async (data: NicknameInput) => {
    setIsUpdating(true);
    setError(null);
    
    const response = await updateAccountNicknameAction(accountId, data.nickname);
    
    setIsUpdating(false);

    if (response.success) {
      setOpen(false);
    } else {
      setError(response.error || 'Failed to update nickname.');
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      reset({ nickname: currentNickname || '' });
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground" />
        }
      >
        <Edit2 className="h-3.5 w-3.5" />
        <span className="sr-only">Edit Nickname</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-md border-border/60">
        <DialogHeader>
          <DialogTitle>Edit Nickname</DialogTitle>
          <DialogDescription>
            Give a custom name to your {currentName} account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive text-center font-medium">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="nickname">Account Nickname</Label>
            <Input
              id="nickname"
              placeholder="e.g. My Primary Spending"
              disabled={isUpdating}
              {...register('nickname')}
            />
            {errors.nickname && (
              <p className="text-xs text-destructive font-medium">{errors.nickname.message}</p>
            )}
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
