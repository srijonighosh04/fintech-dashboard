import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, Zap, CreditCard, Lock } from 'lucide-react';
import { getCurrentUser } from '@/features/auth/actions/authActions';
import { buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      {/* Decorative Blur Vectors */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              AstraBank
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard" className={buttonVariants({ size: 'sm', className: 'shadow-md shadow-primary/10' })}>
                Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className={buttonVariants({ size: 'sm', className: 'bg-primary text-primary-foreground shadow-md' })}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center py-20 px-6">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-cyan-500" />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Welcome to the Future of Fintech
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Premium Banking, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Built for Modern Pioneers
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            AstraBank offers a premium, secure digital experience to manage accounts, make transfers, and analyze transactions. Designed to give you absolute control of your financial destiny.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {user ? (
              <Link href="/dashboard" className={buttonVariants({ size: 'lg', className: 'w-full sm:w-auto text-base' })}>
                Enter Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link href="/signup" className={buttonVariants({ size: 'lg', className: 'w-full sm:w-auto text-base' })}>
                  Create Free Account
                </Link>
                <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'w-full sm:w-auto text-base bg-card/30 backdrop-blur-sm' })}>
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-border/40 py-20 px-6 bg-card/10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Financial Mastery, Simplified</h2>
            <p className="text-muted-foreground">We assemble advanced technology with elite security to create the ultimate banking platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group rounded-xl border border-border bg-card/40 p-6 backdrop-blur-sm hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">Unified Accounts</h3>
              <p className="text-muted-foreground">Manage your savings, checking, and investment accounts in one sleek, centralized view.</p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-xl border border-border bg-card/40 p-6 backdrop-blur-sm hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">Instant Transfers</h3>
              <p className="text-muted-foreground">Send money to family, friends, or institutions immediately with standard security protocols.</p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-xl border border-border bg-card/40 p-6 backdrop-blur-sm hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">Elite Protection</h3>
              <p className="text-muted-foreground">Your finances are protected by Appwrite security, Multi-factor auth, and fully encrypted tokens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6 bg-card/25 mt-auto">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-wide">AstraBank</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AstraBank Technologies Inc. All rights reserved. AstraBank is a financial technology platform, not a bank. Banking services provided by partner banks, Members FDIC.
          </p>
        </div>
      </footer>
    </div>
  );
}
