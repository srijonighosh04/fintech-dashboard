'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonthSelectorProps {
  month: number;
  year: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function MonthSelector({ month, year }: MonthSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePrev = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    updateParams(newMonth, newYear);
  };

  const handleNext = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    updateParams(newMonth, newYear);
  };

  const updateParams = (m: number, y: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', String(m));
    params.set('year', String(y));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 bg-card/60 backdrop-blur-md px-4 py-2 rounded-xl border border-border/40 shadow-sm select-none shrink-0 w-fit">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handlePrev}
        className="hover:bg-accent/40"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2 text-sm font-bold text-foreground min-w-[120px] justify-center">
        <Calendar className="h-4 w-4 text-cyan-500" />
        <span>{MONTH_NAMES[month - 1]} {year}</span>
      </div>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleNext}
        className="hover:bg-accent/40"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
