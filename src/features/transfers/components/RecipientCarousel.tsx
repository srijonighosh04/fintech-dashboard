'use client';

import React, { useState } from 'react';
import { Star, Plus, User, Loader2, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createRecipientAction, toggleFavoriteRecipientAction } from '../actions/transferActions';
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

export interface RecipientData {
  id: string;
  userId: string;
  name: string;
  email: string;
  routingNumber: string;
  accountNumber: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RecipientCarouselProps {
  userId: string;
  recipients: RecipientData[];
  onSelectRecipient: (recipient: RecipientData) => void;
}

const NewRecipientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  routingNumber: z.string().length(9, 'Routing number must be exactly 9 digits').regex(/^\d+$/, 'Digits only'),
  accountNumber: z.string().min(4, 'Account number must be 4 to 17 digits').max(17).regex(/^\d+$/, 'Digits only'),
});

type NewRecipientInput = z.infer<typeof NewRecipientSchema>;

export function RecipientCarousel({
  userId,
  recipients,
  onSelectRecipient,
}: RecipientCarouselProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewRecipientInput>({
    resolver: zodResolver(NewRecipientSchema),
  });

  const onSubmit = async (data: NewRecipientInput) => {
    setIsSubmitting(true);
    setError(null);
    const response = await createRecipientAction(
      userId,
      data.name,
      data.email,
      data.routingNumber,
      data.accountNumber,
    );
    setIsSubmitting(false);

    if (response.success) {
      setIsDialogOpen(false);
      reset();
    } else {
      setError(response.error || 'Failed to add recipient.');
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent select action
    setIsTogglingId(id);
    await toggleFavoriteRecipientAction(id);
    setIsTogglingId(null);
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
          <span>Favorite Recipients</span>
        </h4>
        
        {/* Add Recipient Trigger */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            reset();
            setError(null);
          }
        }}>
          <DialogTrigger
            render={
              <Button variant="ghost" size="xs" className="h-7 text-xs font-semibold hover:bg-muted/30">
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Add Recipient</span>
              </Button>
            }
          />
          <DialogContent className="bg-card/95 backdrop-blur-md border-border/60 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Recipient</DialogTitle>
              <DialogDescription>
                Enter the recipient&apos;s name and ACH bank details to register them.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive text-center font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="e.g. Jane Doe" disabled={isSubmitting} {...register('name')} />
                {errors.name && <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="jane.doe@example.com" disabled={isSubmitting} {...register('email')} />
                {errors.email && <p className="text-[11px] text-destructive font-medium">{errors.email.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input id="routingNumber" placeholder="9 digits" maxLength={9} disabled={isSubmitting} {...register('routingNumber')} />
                  {errors.routingNumber && <p className="text-[11px] text-destructive font-medium">{errors.routingNumber.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input id="accountNumber" placeholder="4-17 digits" maxLength={17} disabled={isSubmitting} {...register('accountNumber')} />
                  {errors.accountNumber && <p className="text-[11px] text-destructive font-medium">{errors.accountNumber.message}</p>}
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Recipient'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Horizontal scrolling List */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border/20">
        {recipients.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground font-medium w-full border border-dashed border-border/60 rounded-xl bg-card/10">
            No recipients registered yet. Click &quot;Add Recipient&quot; to link one.
          </div>
        ) : (
          <>
            {recipients.map((rec) => {
              const isFavToggling = isTogglingId === rec.id;
              
              return (
                <button
                  key={rec.id}
                  onClick={() => onSelectRecipient(rec)}
                  className="flex flex-col items-center text-center p-3 rounded-xl border border-border/40 bg-card/25 hover:bg-muted/15 hover:border-border/95 transition-all duration-300 w-24 shrink-0 cursor-pointer group relative outline-none focus:ring-1 focus:ring-primary/40"
                >
                  {/* Star overlay */}
                  <button
                    onClick={(e) => handleToggleFavorite(e, rec.id)}
                    disabled={isFavToggling}
                    className="absolute top-1.5 right-1.5 p-0.5 text-muted-foreground hover:text-amber-500 rounded hover:bg-accent/40"
                  >
                    {isFavToggling ? (
                      <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                    ) : rec.isFavorite ? (
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    ) : (
                      <Star className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500 mb-2">
                    <User className="h-5 w-5" />
                  </div>
                  
                  <span className="text-xs font-bold text-foreground truncate w-full px-1">
                    {rec.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    *{rec.accountNumber.slice(-4)}
                  </span>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
