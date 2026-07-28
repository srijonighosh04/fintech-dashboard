'use client';

import React, { useState, useRef, useEffect, useOptimistic, useTransition } from 'react';
import { Send, Trash2, Bot, User, Loader2, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { sendChatMessageAction, clearChatHistoryAction } from '../actions/aiActions';

export interface ChatMessageRecord {
  id: string;
  userId: string;
  role: string; // 'user' | 'assistant'
  content: string;
  createdAt: Date;
}

interface AiChatPanelProps {
  userId: string;
  initialMessages: ChatMessageRecord[];
}

const QUICK_SUGGESTIONS = [
  'How much did I spend on restaurants?',
  'What are my biggest expenses?',
  'Can I afford a $350 purchase?',
  'What is my savings progress?',
];

let tempIdCounter = 0;

export function AiChatPanel({ userId, initialMessages }: AiChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isClearing, setIsClearing] = useState(false);

  // React 19 optimistic updates
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    initialMessages,
    (state, newMessage: ChatMessageRecord) => [...state, newMessage],
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [optimisticMessages, isPending]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || isPending) return;

    const tempUserMsg: ChatMessageRecord = {
      id: `temp-${tempIdCounter++}`,
      userId,
      role: 'user',
      content: text,
      createdAt: new Date(),
    };

    setInputValue('');

    startTransition(async () => {
      addOptimisticMessage(tempUserMsg);
      await sendChatMessageAction(userId, text);
    });
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your AI chat history?')) return;
    setIsClearing(true);
    await clearChatHistoryAction(userId);
    setIsClearing(false);
  };

  // Parses markdown syntax inside chat balloons
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-1.5" />;

      if (trimmed.startsWith('- ')) {
        trimmed = trimmed.substring(2);
        return (
          <li key={idx} className="text-[12px] pl-3 relative before:content-['•'] before:absolute before:left-0.5 before:text-cyan-500 leading-relaxed mb-0.5">
            {renderBoldText(trimmed)}
          </li>
        );
      }

      return (
        <p key={idx} className="text-[12px] leading-relaxed mb-1">
          {renderBoldText(trimmed)}
        </p>
      );
    });
  };

  const renderBoldText = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-extrabold">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl flex flex-col h-[520px] overflow-hidden">
      {/* Header with clear action */}
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500 shadow-sm animate-pulse">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-tight">AI Financial Assistant</CardTitle>
            <CardDescription className="text-[10px]">Contextual bank analysis and recommendations.</CardDescription>
          </div>
        </div>

        {optimisticMessages.length > 0 && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleClearHistory}
            disabled={isClearing}
            className="hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500"
          >
            {isClearing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        )}
      </CardHeader>

      {/* Chat messages feed */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-card/10">
        {optimisticMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3.5 p-6 animate-in fade-in duration-500">
            <Compass className="h-10 w-10 text-cyan-500/40" />
            <div>
              <p className="text-xs font-bold text-foreground">AstraBank AI Co-Pilot</p>
              <p className="text-[11px] text-muted-foreground max-w-[240px] leading-relaxed">
                Analyze your transactional ledger and check budgets or savings targets.
              </p>
            </div>
            
            {/* Suggestions list */}
            <div className="w-full max-w-sm space-y-2 pt-2">
              {QUICK_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  disabled={isPending}
                  onClick={() => handleSendMessage(tag)}
                  className="w-full text-left p-2.5 rounded-xl border border-border/30 bg-card/25 hover:border-cyan-500/40 hover:bg-cyan-500/5 text-[11px] font-semibold text-muted-foreground hover:text-cyan-500 transition-all duration-300 shadow-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {optimisticMessages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-lg border text-xs shadow-sm ${
                      isAssistant
                        ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/15'
                        : 'bg-primary text-primary-foreground border-primary/20'
                    }`}
                  >
                    {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  <div
                    className={`p-3 rounded-2xl shadow-sm border ${
                      isAssistant
                        ? 'bg-card/90 text-foreground border-border/40 rounded-tl-none'
                        : 'bg-primary text-primary-foreground border-primary/20 rounded-tr-none'
                    }`}
                  >
                    <div className="space-y-1.5">
                      {renderMessageContent(msg.content)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Skeletons loader */}
            {isPending && (
              <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/15">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-3 rounded-2xl bg-card/90 border border-border/40 rounded-tl-none space-y-1.5 min-w-[120px]">
                  <div className="h-2.5 w-16 bg-muted rounded-full" />
                  <div className="h-2 w-24 bg-muted rounded-full" />
                </div>
              </div>
            )}

            {/* Anchor scroll point */}
            <div ref={scrollRef} />
          </div>
        )}
      </CardContent>

      {/* Input container */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="p-3 border-t border-border/20 bg-muted/5 flex gap-2 shrink-0 items-center"
      >
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about spending, bills, or afford queries..."
          disabled={isPending || isClearing}
          className="flex-1 rounded-xl text-xs"
        />
        <Button
          type="submit"
          size="icon-sm"
          disabled={isPending || isClearing || !inputValue.trim()}
          className="shadow-md"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </Card>
  );
}
