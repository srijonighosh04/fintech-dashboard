import React from 'react';
import { getCurrentUser } from '@/features/auth/actions/authActions';
import { getSubscriptionsAction, getBillsAction, getAutomationRulesAction } from '@/features/automation/actions/automationActions';
import { ReceiptScanner } from '@/features/automation/components/ReceiptScanner';
import { SubscriptionList, SubscriptionRecord } from '@/features/automation/components/SubscriptionList';
import { BillReminders, BillRecord } from '@/features/automation/components/BillReminders';
import { AutomationSettings, AutomationRuleRecord } from '@/features/automation/components/AutomationSettings';

export default async function AutomationPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Retrieve current subscriptions, bills, and custom rules data
  const subscriptions = await getSubscriptionsAction(user.$id);
  const bills = await getBillsAction(user.$id);
  const rules = await getAutomationRulesAction(user.$id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section details */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Intelligent Automation</h1>
        <p className="text-muted-foreground text-sm">
          Run OCR scanners to log purchases, schedule calendar bills, and configure custom notification rules.
        </p>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 items-start">
        {/* Left column: Receipt scanner & Billing schedules */}
        <div className="lg:col-span-7 space-y-8">
          <ReceiptScanner userId={user.$id} />
          
          <BillReminders
            userId={user.$id}
            bills={bills as BillRecord[]}
          />
        </div>

        {/* Right column: Detected recurring items & rules triggers settings */}
        <div className="lg:col-span-5 space-y-8">
          <SubscriptionList
            userId={user.$id}
            subscriptions={subscriptions as SubscriptionRecord[]}
          />

          <AutomationSettings
            userId={user.$id}
            rules={rules as AutomationRuleRecord[]}
          />
        </div>
      </div>
    </div>
  );
}
