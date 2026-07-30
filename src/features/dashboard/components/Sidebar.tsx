'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { SIDEBAR_NAV_ITEMS, NavItem } from '@/constants/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/features/auth/actions/authActions';

interface SidebarProps {
  user?: {
    name: string;
    email: string;
  } | null;
  className?: string;
}

export function Sidebar({ user, className }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutUser();
  };

  const isAdmin = user?.email === 'admin@astrabank.com' || user?.email.endsWith('@astrabank.com');
  const navItems = isAdmin
    ? [
        ...SIDEBAR_NAV_ITEMS.slice(0, SIDEBAR_NAV_ITEMS.length - 1),
        { title: 'Admin Console', href: '/dashboard/admin', iconName: 'Shield' as const },
        SIDEBAR_NAV_ITEMS[SIDEBAR_NAV_ITEMS.length - 1],
      ]
    : SIDEBAR_NAV_ITEMS;

  return (
    <aside
      className={cn(
        'flex h-screen w-64 flex-col border-r border-border bg-card/60 backdrop-blur-md transition-all duration-300',
        className,
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Icons.Zap className="h-5 w-5 text-white animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-xl font-bold tracking-tight text-transparent">
            AstraBank
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navItems.map((item: NavItem) => {
          const Icon = (Icons[item.iconName] as React.ComponentType<{ className?: string }>) || Icons.HelpCircle;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                'group flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent/80 hover:text-accent-foreground',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                  : 'text-muted-foreground hover:translate-x-1',
              )}
            >
              <Icon className={cn('h-5 w-5', isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Session Footer */}
      {user && (
        <div className="border-t border-border p-4 bg-accent/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 font-semibold text-white shadow-md shadow-blue-500/10">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-semibold text-foreground">
                {user.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
          >
            <Icons.LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      )}
    </aside>
  );
}
