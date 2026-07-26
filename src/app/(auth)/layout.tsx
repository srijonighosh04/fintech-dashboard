import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Glow Effects */}
      <div className="absolute top-[20%] left-[25%] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[25%] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

      {/* Main Auth Container */}
      <div className="w-full max-w-md z-10 flex flex-col gap-6">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent tracking-tight">
              AstraBank
            </span>
          </Link>
        </div>

        {/* Auth Forms Body */}
        {children}
      </div>
    </div>
  );
}
