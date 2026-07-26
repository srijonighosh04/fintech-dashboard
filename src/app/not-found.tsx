import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
      {/* Background Decorative Blur */}
      <div className="absolute top-[30%] left-[30%] h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[30%] right-[30%] h-[350px] w-[350px] rounded-full bg-destructive/10 blur-[90px] pointer-events-none" />

      <div className="z-10 space-y-6 max-w-md">
        {/* Error Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-lg shadow-destructive/5">
          <ShieldAlert className="h-10 w-10" />
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            404 - Transaction Void
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            The page or financial ledger record you are requesting could not be located on AstraBank servers. It may have been relocated or archived.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className={buttonVariants({ variant: 'outline' })}>
            <Home className="mr-2 h-4 w-4" /> Go to Home
          </Link>
          <Link href="/dashboard" className={buttonVariants({ variant: 'default' })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
