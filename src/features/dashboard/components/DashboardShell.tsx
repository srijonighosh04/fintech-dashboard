'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    $id: string;
    name: string;
    email: string;
  } | null;
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <Sidebar user={user} className="hidden md:flex flex-shrink-0" />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Top Header Navigation */}
        <TopNav user={user} />

        {/* Dynamic Page Scroll Body */}
        <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
