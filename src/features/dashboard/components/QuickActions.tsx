'use client';

import React, { useState } from 'react';
import { Send, FileText, Settings, CreditCard, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/components/ui/dialog';

interface QuickActionsProps {
  userId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function QuickActions({ userId }: QuickActionsProps) {
  const [activeDialog, setActiveDialog] = useState<'send' | 'bill' | 'statement' | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle mock send action
  const handleSendMoney = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Transfer initiated successfully!');
      setTimeout(() => {
        setSuccessMsg(null);
        setActiveDialog(null);
      }, 2000);
    }, 1500);
  };

  // Handle mock bill action
  const handlePayBill = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Bill paid successfully!');
      setTimeout(() => {
        setSuccessMsg(null);
        setActiveDialog(null);
      }, 2000);
    }, 1500);
  };

  // Handle statement request
  const handleRequestStatement = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setActiveDialog(null);
      // Mock file download
      alert('Your statement has been prepared and downloaded.');
    }, 1200);
  };

  const actionItems = [
    {
      title: 'Send Money',
      description: 'Transfer funds instantly to any account',
      icon: Send,
      onClick: () => setActiveDialog('send'),
      color: 'text-cyan-500 bg-cyan-500/10',
    },
    {
      title: 'Pay Bills',
      description: 'Settle utilities, subscriptions or credit cards',
      icon: CreditCard,
      onClick: () => setActiveDialog('bill'),
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      title: 'Get Statement',
      description: 'Download PDF ledger statements',
      icon: FileText,
      onClick: () => setActiveDialog('statement'),
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'Linked Cards',
      description: 'Manage details and connection options',
      icon: Settings,
      onClick: () => {
        // Scroll to connected accounts grid
        const grid = document.getElementById('connected-accounts-section');
        if (grid) grid.scrollIntoView({ behavior: 'smooth' });
      },
      color: 'text-muted-foreground bg-muted/40',
    },
  ];

  return (
    <>
      <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-md h-full">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight">Quick Actions</CardTitle>
          <CardDescription>Instant triggers to manage funds and files.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {actionItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  onClick={item.onClick}
                  className="flex items-start text-left p-4 rounded-xl border border-border/40 bg-card/20 hover:bg-muted/15 hover:border-border/100 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.color} group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Send Money Dialog */}
      <Dialog open={activeDialog === 'send'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-md border-border/60 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Money</DialogTitle>
            <DialogDescription>
              Enter details below to transfer funds instantly.
            </DialogDescription>
          </DialogHeader>
          {successMsg ? (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-center text-sm text-emerald-500 font-semibold animate-in zoom-in duration-300">
              {successMsg}
            </div>
          ) : (
            <form onSubmit={handleSendMoney} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Email or Username</Label>
                <Input id="recipient" placeholder="jane.doe@example.com" required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input id="amount" type="number" placeholder="0.00" min="1" step="0.01" required disabled={loading} />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setActiveDialog(null)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                  Confirm Send
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Pay Bills Dialog */}
      <Dialog open={activeDialog === 'bill'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-md border-border/60 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pay Bill</DialogTitle>
            <DialogDescription>
              Choose a payee below to settle your invoice.
            </DialogDescription>
          </DialogHeader>
          {successMsg ? (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-center text-sm text-emerald-500 font-semibold animate-in zoom-in duration-300">
              {successMsg}
            </div>
          ) : (
            <form onSubmit={handlePayBill} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payee">Payee</Label>
                <select id="payee" className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none" required disabled={loading}>
                  <option value="electric">AstraPower Utilities</option>
                  <option value="net">HyperLink Fiber Net</option>
                  <option value="card">AstraBank Platinum Credit Card</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billAmount">Amount ($)</Label>
                <Input id="billAmount" type="number" placeholder="0.00" min="1" step="0.01" required disabled={loading} />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setActiveDialog(null)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                  Confirm Payment
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Statement Download Dialog */}
      <Dialog open={activeDialog === 'statement'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-md border-border/60 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Download Ledger Statements</DialogTitle>
            <DialogDescription>
              Choose a monthly statement to prepare.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex justify-between items-center border-b border-border/20 pb-3">
              <span className="text-sm font-semibold">July 2026 Ledger (Current)</span>
              <Button size="sm" onClick={handleRequestStatement} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Download'}
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">June 2026 Ledger (Past)</span>
              <Button size="sm" onClick={handleRequestStatement} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Download'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
