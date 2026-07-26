'use client';

import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logoutUser } from '@/features/auth/actions/authActions';

interface TopNavProps {
  user?: {
    name: string;
    email: string;
  } | null;
}

export function TopNav({ user }: TopNavProps) {
  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/60 px-4 backdrop-blur-md md:px-8">
      {/* Left side: Mobile navigation toggle and Search bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <MobileNav user={user} />
        <div className="relative w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions, accounts, settings..."
            className="w-full pl-9 bg-accent/25 border-border focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Right side: Utilities (Notification, Theme, User Profile) */}
      <div className="flex items-center gap-3">
        {/* Search button for mobile only */}
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-cyan-500 ring-2 ring-background animate-pulse" />
        </Button>

        {/* Theme Toggler */}
        <ThemeToggle />

        {/* User Dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 font-semibold text-white shadow-md"
                />
              }
            >
              {user.name.charAt(0).toUpperCase()}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <span>Security</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
