import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, ShieldAlert, Cpu, BrainCircuit, Wallet, CreditCard, ChevronRight } from 'lucide-react';
import { getCurrentUser } from '@/features/auth/actions/authActions';
import { buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { InterestCalculator } from '@/features/landing/components/InterestCalculator';

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      {/* Background radial gradients */}
      <div className="absolute top-[-30%] left-[-15%] h-[800px] w-[800px] rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[700px] w-[700px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

      {/* Header Sticky Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/20 bg-background/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md">
              <Zap className="h-5 w-5 text-white animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              AstraBank
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link
                href="/dashboard"
                className={buttonVariants({
                  size: 'sm',
                  className: 'bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-md h-9 px-4',
                })}
              >
                Enter App <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className={buttonVariants({
                    size: 'sm',
                    className: 'bg-primary text-primary-foreground font-bold rounded-xl shadow-md h-9 px-4',
                  })}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Descriptions and CTAs */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm shadow-sm">
            <Sparkles className="h-4 w-4 text-cyan-500 animate-pulse" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Built for Modern Digital Pioneers
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Next-Gen Banking, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Without the Compromises
            </span>
          </h1>

          <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-muted-foreground font-medium leading-relaxed">
            AstraBank integrates secure account sync, real-time ACH rails, customized AI budgeting recommendations, and modular fraud shields to give you ultimate authority of your financial assets.
          </p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className={buttonVariants({
                  size: 'lg',
                  className: 'w-full sm:w-auto text-sm font-bold bg-primary text-primary-foreground rounded-2xl h-11 px-6 shadow-xl shadow-primary/10',
                })}
              >
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className={buttonVariants({
                    size: 'lg',
                    className: 'w-full sm:w-auto text-sm font-bold bg-primary text-primary-foreground rounded-2xl h-11 px-6 shadow-xl shadow-primary/10',
                  })}
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'lg',
                    className: 'w-full sm:w-auto text-sm font-bold bg-card/30 border-border/60 hover:bg-card/65 rounded-2xl h-11 px-6 backdrop-blur-sm',
                  })}
                >
                  Sign In <ChevronRight className="ml-1.5 h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Growth Simulator Widget */}
        <div className="lg:col-span-5 w-full">
          <InterestCalculator />
        </div>
      </section>

      {/* Feature Grids */}
      <section className="border-t border-border/20 py-20 px-6 bg-card/5">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Fintech Framework Architecture</h2>
            <p className="text-muted-foreground text-sm font-medium">
              We leverage premium technology stacks and state-of-the-art security layers to protect your capital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm hover:border-cyan-500/30 hover:shadow-lg transition-all duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold mb-2 text-foreground">Unified Accounts</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Connect checks, savings, and assets directly via encrypted Plaid web hooks inside a sleek dashboard view.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm hover:border-blue-500/30 hover:shadow-lg transition-all duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold mb-2 text-foreground">Instant Transfers</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Send internal balance adjustments or execute ACH payments seamlessly via custom Dwolla sandbox integration.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm hover:border-purple-500/30 hover:shadow-lg transition-all duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold mb-2 text-foreground">Custom Budgeting</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Set active category targets, map monthly limits, and tracks emergency savings goals progress timelines.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold mb-2 text-foreground">AI Intelligence</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Assess budgets, calculate financial health ratings, and chat with a customized LLM Financial Assistant.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm hover:border-amber-500/30 hover:shadow-lg transition-all duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold mb-2 text-foreground">Automation Center</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Manage upcoming billers, scan multimodal invoices OCR, and schedule active threshold rules triggers.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-2xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm hover:border-rose-500/30 hover:shadow-lg transition-all duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold mb-2 text-foreground">Fraud Shield</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Track unusual card velocities, impossible travel logs, abnormal times, and approve queue investigations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/25 py-8 px-6 bg-card/10 mt-auto">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase">AstraBank</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium max-w-md">
            &copy; {new Date().getFullYear()} AstraBank Technologies Inc. AstraBank is a financial technology software provider. Banking services are simulated or provided by authorized partner banks, Members FDIC.
          </p>
        </div>
      </footer>
    </div>
  );
}
