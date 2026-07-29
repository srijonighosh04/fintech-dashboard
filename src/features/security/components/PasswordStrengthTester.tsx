'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PasswordStrengthTester() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  const getStrengthText = () => {
    if (password.length === 0) return 'Enter a password';
    if (score <= 2) return 'Weak (Insecure)';
    if (score <= 4) return 'Medium (Moderate)';
    return 'Strong (Production Ready)';
  };

  const getStrengthColor = () => {
    if (password.length === 0) return 'bg-muted';
    if (score <= 2) return 'bg-rose-500';
    if (score <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tester-password">Test Password Strength</Label>
        <div className="relative">
          <Input
            id="tester-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Type a password to test..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10 bg-accent/15"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Strength Bar indicators */}
      {password.length > 0 && (
        <div className="space-y-1.5 animate-in fade-in duration-300">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-muted-foreground uppercase">Strength Index</span>
            <span
              className={
                score <= 2
                  ? 'text-rose-500'
                  : score <= 4
                  ? 'text-amber-500'
                  : 'text-emerald-500'
              }
            >
              {getStrengthText()}
            </span>
          </div>

          <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden flex gap-0.5">
            <div
              className={`h-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${(score / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Strength Checklist list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-muted/10 border border-border/20 rounded-xl">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
          {checks.length ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <X className="h-3.5 w-3.5 text-rose-500" />
          )}
          <span className={checks.length ? 'text-foreground' : ''}>At least 8 characters</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
          {checks.uppercase ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <X className="h-3.5 w-3.5 text-rose-500" />
          )}
          <span className={checks.uppercase ? 'text-foreground' : ''}>Uppercase letter (A-Z)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
          {checks.lowercase ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <X className="h-3.5 w-3.5 text-rose-500" />
          )}
          <span className={checks.lowercase ? 'text-foreground' : ''}>Lowercase letter (a-z)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
          {checks.number ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <X className="h-3.5 w-3.5 text-rose-500" />
          )}
          <span className={checks.number ? 'text-foreground' : ''}>Numeric digit (0-9)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground sm:col-span-2">
          {checks.symbol ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <X className="h-3.5 w-3.5 text-rose-500" />
          )}
          <span className={checks.symbol ? 'text-foreground' : ''}>Special character (!@#$%^&*)</span>
        </div>
      </div>
    </div>
  );
}
