import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/actions/authActions';
import prisma from '@/lib/prisma';
import { Shield, ShieldAlert, Cpu, Terminal, Users, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDate } from '@/utils/format';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Role-Based Access Control (RBAC) Guard
  // Restricts view to admin accounts (mocked to @astrabank.com domains or admin account)
  const isAdmin = user.email === 'admin@astrabank.com' || user.email.endsWith('@astrabank.com');
  if (!isAdmin) {
    redirect('/dashboard');
  }

  // Gather system details from PostgreSQL AuditLog
  const auditLogs = await prisma.auditLog.findMany({
    take: 15,
    orderBy: { createdAt: 'desc' },
  });

  const totalUsersCount = await prisma.auditLog.groupBy({
    by: ['userId'],
    _count: true,
  });

  const uniqueUsersActive = totalUsersCount.filter(item => item.userId !== null).length;

  const totalAuditLogs = await prisma.auditLog.count();

  // Simulated metrics
  const systemMemory = process.memoryUsage();
  const memoryUsedMB = (systemMemory.heapUsed / 1024 / 1024).toFixed(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section details */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground text-sm">
            Monitor system operations, evaluate security logs, and review platform sessions.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        {/* Active sessions */}
        <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Active Users</span>
            <p className="text-2xl font-extrabold text-foreground">{uniqueUsersActive || 1}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </Card>

        {/* Security Logs count */}
        <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Audit Records</span>
            <p className="text-2xl font-extrabold text-foreground">{totalAuditLogs}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Database className="h-5 w-5" />
          </div>
        </Card>

        {/* Node Memory usage */}
        <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Memory Allocation</span>
            <p className="text-2xl font-extrabold text-foreground">{memoryUsedMB} MB</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Cpu className="h-5 w-5" />
          </div>
        </Card>

        {/* Status indicator */}
        <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Threat Index</span>
            <p className="text-2xl font-extrabold text-emerald-500">Secure</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Centralized Audit Logs Table */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-4">
          <div>
            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-1.5">
              <Terminal className="h-4.5 w-4.5 text-cyan-500" />
              <span>Immutable System Audit Logs</span>
            </CardTitle>
            <CardDescription className="text-xs">Security operations and administrative transaction history.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {auditLogs.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground font-medium">
              No audit logs captured.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-medium uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">User ID</th>
                    <th className="py-2.5 px-3">Security Action</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/5 transition-colors">
                      <td className="py-3 px-3 font-medium text-foreground whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground font-mono truncate max-w-[120px]">
                        {log.userId || 'GUEST'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 font-semibold text-cyan-500 text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground font-mono">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground truncate max-w-[180px]" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
