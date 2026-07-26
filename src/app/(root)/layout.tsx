import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/actions/authActions';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch current user session details
  const user = await getCurrentUser();

  // Route guarding fallback
  if (!user) {
    redirect('/login');
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
