import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/actions/authActions';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { validateEnv } from '@/lib/env';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce strict runtime environment variables validation
  validateEnv();

  // Fetch current user session details
  const user = await getCurrentUser();

  // Route guarding fallback
  if (!user) {
    redirect('/login');
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
