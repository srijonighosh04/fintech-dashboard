'use client';

import React, { useOptimistic, useTransition } from 'react';
import { Bell, Flame, Calendar, ArrowUpRight, ArrowDownLeft, CheckSquare, Loader2, MailOpen } from 'lucide-react';
import { markNotificationReadAction, markAllNotificationsReadAction } from '../actions/automationActions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface NotificationRecord {
  id: string;
  userId: string;
  type: string; // LARGE_WITHDRAWAL | SALARY_RECEIVED | BUDGET_EXCEEDED | UPCOMING_BILL
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationCenterProps {
  userId: string;
  initialNotifications: NotificationRecord[];
}

export function NotificationCenter({ userId, initialNotifications }: NotificationCenterProps) {
  const [isPending, startTransition] = useTransition();

  // React 19 Optimistic state hook
  const [optimisticNotifications, updateOptimisticNotifications] = useOptimistic(
    initialNotifications,
    (state, action: { type: 'READ'; id: string } | { type: 'READ_ALL' }) => {
      if (action.type === 'READ') {
        return state.map((n) => (n.id === action.id ? { ...n, isRead: true } : n));
      } else {
        return state.map((n) => ({ ...n, isRead: true }));
      }
    },
  );

  const unreadCount = optimisticNotifications.filter((n) => !n.isRead).length;

  const handleMarkRead = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      updateOptimisticNotifications({ type: 'READ', id });
      await markNotificationReadAction(id);
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      updateOptimisticNotifications({ type: 'READ_ALL' });
      await markAllNotificationsReadAction(userId);
    });
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'LARGE_WITHDRAWAL':
        return {
          icon: ArrowUpRight,
          style: 'bg-rose-500/10 text-rose-500 border-rose-500/15',
        };
      case 'SALARY_RECEIVED':
        return {
          icon: ArrowDownLeft,
          style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15',
        };
      case 'BUDGET_EXCEEDED':
        return {
          icon: Flame,
          style: 'bg-amber-500/10 text-amber-500 border-amber-500/15',
        };
      case 'UPCOMING_BILL':
      default:
        return {
          icon: Calendar,
          style: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/15',
        };
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-xl hover:bg-accent/40 text-muted-foreground hover:text-foreground shrink-0 flex items-center justify-center"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent className="bg-card/95 backdrop-blur-md border-border/60 w-80 max-h-[380px] overflow-hidden flex flex-col p-0 rounded-2xl shadow-xl align-end">
        {/* Header summary panel */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 bg-muted/5 shrink-0">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-foreground">Notifications</h4>
            <p className="text-[10px] text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread alerts pending` : 'All alerts cleared'}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              disabled={isPending}
              onClick={handleMarkAllRead}
              className="text-[10px] font-bold text-cyan-500 hover:text-cyan-600 hover:bg-cyan-500/5 h-6 rounded-lg px-2 flex items-center gap-1"
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckSquare className="h-3 w-3" />
              )}
              <span>Mark all read</span>
            </Button>
          )}
        </div>

        {/* Dropdown list items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/10 py-1">
          {optimisticNotifications.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground font-medium flex flex-col items-center justify-center gap-2">
              <MailOpen className="h-8 w-8 text-muted-foreground/30" />
              <span>Inbox is currently empty</span>
            </div>
          ) : (
            optimisticNotifications.map((msg) => {
              const { icon: Icon, style } = getNotificationStyle(msg.type);

              return (
                <DropdownMenuItem
                  key={msg.id}
                  className={`flex items-start gap-3 p-3 transition-colors ${
                    msg.isRead ? 'bg-transparent opacity-65' : 'bg-cyan-500/5 font-medium'
                  }`}
                >
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${style}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-center gap-2">
                      <p className="text-[11px] font-bold text-foreground truncate">{msg.title}</p>
                      {!msg.isRead && (
                        <button
                          onClick={(e) => handleMarkRead(msg.id, e)}
                          className="text-[10px] text-cyan-500 hover:underline shrink-0"
                        >
                          Read
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-normal select-text break-words">
                      {msg.message}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
