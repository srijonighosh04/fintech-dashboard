import React from 'react';
import { getCurrentUser } from '@/features/auth/actions/authActions';
import { getOrGenerateAiSummaryAction, getChatHistoryAction } from '@/features/ai/actions/aiActions';
import { FinancialHealthWidget } from '@/features/ai/components/FinancialHealthWidget';
import { AiSummaryViewer, AiSummaryRecord } from '@/features/ai/components/AiSummaryViewer';
import { AiChatPanel, ChatMessageRecord } from '@/features/ai/components/AiChatPanel';
import { MonthSelector } from '@/features/finance/components/MonthSelector';

interface AssistantPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function AssistantPage({ searchParams }: AssistantPageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  // Await searchParams in Next.js 15
  const resolvedParams = await searchParams;

  const now = new Date();
  const month = resolvedParams.month ? parseInt(resolvedParams.month, 10) : now.getMonth() + 1;
  const year = resolvedParams.year ? parseInt(resolvedParams.year, 10) : now.getFullYear();

  // Load or trigger generation of monthly AI report
  const summary = await getOrGenerateAiSummaryAction(user.$id, month, year);

  // Load historical chat records
  const chatHistory = await getChatHistoryAction(user.$id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section with month pagination toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Financial Assistant</h1>
          <p className="text-muted-foreground text-sm">
            Engage in chat audits and access monthly AI budget reports.
          </p>
        </div>

        <MonthSelector month={month} year={year} />
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 items-start">
        {/* Left column: Health stats & Report summaries */}
        <div className="lg:col-span-7 space-y-8">
          {summary && (
            <FinancialHealthWidget
              score={summary.financialHealthScore}
              explanation={summary.healthScoreExplanation}
            />
          )}

          <AiSummaryViewer summary={summary as AiSummaryRecord | null} />
        </div>

        {/* Right column: Conversational Assistant chatbot */}
        <div className="lg:col-span-5">
          <AiChatPanel
            userId={user.$id}
            initialMessages={chatHistory as ChatMessageRecord[]}
          />
        </div>
      </div>
    </div>
  );
}
