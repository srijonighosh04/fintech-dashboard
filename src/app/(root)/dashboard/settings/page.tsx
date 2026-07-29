import React from 'react';
import { getCurrentUser } from '@/features/auth/actions/authActions';
import { getAuditLogsAction } from '@/features/security/actions/securityActions';
import { PasswordStrengthTester } from '@/features/security/components/PasswordStrengthTester';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Key, ClipboardList, Radio } from 'lucide-react';
import { formatDate } from '@/utils/format';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Retrieve current user security logs
  const logs = await getAuditLogsAction(user.$id);

  // Validate environmental variables setup
  const diagnostics = {
    database: {
      name: 'PostgreSQL Database Connection',
      status: !!process.env.DATABASE_URL,
      required: true,
    },
    appwrite: {
      name: 'Appwrite Authentication Service',
      status: !!process.env.APPWRITE_KEY,
      required: true,
    },
    plaid: {
      name: 'Plaid Core Banking SDK API',
      status: !!process.env.PLAID_CLIENT_ID && !!process.env.PLAID_SECRET,
      required: true,
    },
    gemini: {
      name: 'Google Gemini Multimodal AI API',
      status: !!process.env.GEMINI_API_KEY,
      required: false,
    },
    dwolla: {
      name: 'Dwolla ACH Transfer Gateway API',
      status: !!process.env.DWOLLA_KEY && !!process.env.DWOLLA_SECRET,
      required: false,
    },
    sentry: {
      name: 'Sentry Cloud Error Monitoring API',
      status: !!process.env.SENTRY_DSN,
      required: false,
    },
  };

  const parseLogDetails = (detailsStr: string) => {
    try {
      return JSON.stringify(JSON.parse(detailsStr), null, 2);
    } catch {
      return detailsStr;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section details */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Security Settings</h1>
        <p className="text-muted-foreground text-sm">
          Diagnose secrets connections status, evaluate credentials strength, and review audit logs.
        </p>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 items-start">
        {/* Left column: Diagnostics & password tester */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Diagnostics Section */}
          <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/10">
              <div className="space-y-0.5">
                <CardTitle className="text-lg font-bold tracking-tight">System Security Diagnostics</CardTitle>
                <CardDescription>Secrets environment variable load status checkers.</CardDescription>
              </div>
              <Radio className="h-5 w-5 text-cyan-500 animate-pulse" />
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              {Object.entries(diagnostics).map(([key, item]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-muted/10 text-xs font-semibold"
                >
                  <div className="space-y-0.5">
                    <p className="text-foreground font-bold">{item.name}</p>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {item.required ? 'Production Core Required' : 'Optional Feature Enhancement'}
                    </span>
                  </div>

                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${
                    item.status
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : item.required
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {item.status ? 'Secured' : item.required ? 'Config Error' : 'Unset Fallback'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Password Checker section */}
          <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl">
            <CardHeader className="pb-2 border-b border-border/10">
              <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                <Key className="h-5 w-5 text-cyan-500" />
                <span>Password Strength Validation</span>
              </CardTitle>
              <CardDescription>Validate credentials complex rules before updating account access.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <PasswordStrengthTester />
            </CardContent>
          </Card>
        </div>

        {/* Right column: Audit logs history list table */}
        <div className="lg:col-span-6 space-y-8">
          <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/10">
              <div className="space-y-0.5">
                <CardTitle className="text-lg font-bold tracking-tight">Security Audit Logs</CardTitle>
                <CardDescription>Immutable tracking logs of account updates and transfer transactions.</CardDescription>
              </div>
              <ClipboardList className="h-5 w-5 text-cyan-500" />
            </CardHeader>
            
            <CardContent className="pt-6">
              {logs.length === 0 ? (
                <div className="text-center py-16 text-sm text-muted-foreground font-medium border border-dashed border-border/40 rounded-xl bg-card/10">
                  No security events registered yet.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {logs.map((log) => {
                    return (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-xl border border-border/30 bg-card/10 flex flex-col gap-2 text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-foreground truncate max-w-[200px] inline-block">{log.action}</span>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                              IP: {log.ipAddress || 'unknown'} • Agent: {log.userAgent ? log.userAgent.split(' ')[0] : 'unknown'}
                            </p>
                          </div>
                          
                          <span className="text-[10px] text-muted-foreground font-bold shrink-0">
                            {formatDate(log.createdAt instanceof Date ? log.createdAt.toISOString().split('T')[0] : String(log.createdAt).split('T')[0])}
                          </span>
                        </div>
                        
                        <details className="mt-1">
                          <summary className="cursor-pointer text-[10px] text-cyan-500 font-bold hover:underline select-none">
                            View Payload parameters
                          </summary>
                          <pre className="mt-1.5 p-2 bg-muted/40 rounded-lg text-[9px] font-mono text-muted-foreground whitespace-pre-wrap max-h-24 overflow-y-auto">
                            {parseLogDetails(log.details)}
                          </pre>
                        </details>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
