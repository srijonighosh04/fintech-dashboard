'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Categories options available in our seeded sandbox dataset
const CATEGORIES = [
  'Rent & Housing',
  'Food & Dining',
  'Software & SaaS',
  'Entertainment',
  'Utilities & Others',
  'Infrastructure',
  'Travel',
];

const STATUSES = ['pending', 'completed', 'failed', 'refunded'];

export function TransactionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for debounced search and inputs
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [minAmount, setMinAmount] = useState(searchParams.get('minAmount') || '');
  const [maxAmount, setMaxAmount] = useState(searchParams.get('maxAmount') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  
  const [isExpanded, setIsExpanded] = useState(false);

  const updateQueryParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
      params.set('page', '1'); // Reset to page 1 on filter change
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  // Debounce the search keyword input
  useEffect(() => {
    const handler = setTimeout(() => {
      updateQueryParam('search', searchInput);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, updateQueryParam]);

  const handleClearFilters = () => {
    setSearchInput('');
    setCategory('');
    setStatus('');
    setMinAmount('');
    setMaxAmount('');
    setStartDate('');
    setEndDate('');
    router.push(pathname); // push with empty search queries
  };

  const hasActiveFilters = 
    searchParams.get('search') ||
    searchParams.get('category') ||
    searchParams.get('status') ||
    searchParams.get('minAmount') ||
    searchParams.get('maxAmount') ||
    searchParams.get('startDate') ||
    searchParams.get('endDate');

  return (
    <Card className="border border-border/60 bg-card/50 backdrop-blur-sm shadow-md">
      <CardContent className="p-4 space-y-4">
        {/* Core row (Search bar + Expand toggle + Clear) */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search merchant, descriptions or keywords..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 bg-card/40"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`bg-card/40 w-full sm:w-auto ${isExpanded ? 'border-primary text-primary' : ''}`}
            >
              <Filter className="h-4 w-4 mr-1.5" />
              <span>Filters</span>
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Collapsible advanced filters section */}
        {isExpanded && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border-t border-border/20 pt-4 animate-in slide-in-from-top duration-300">
            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  updateQueryParam('category', e.target.value);
                }}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  updateQueryParam('status', e.target.value);
                }}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none capitalize"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount range */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Amount Range ($)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => {
                    setMinAmount(e.target.value);
                    updateQueryParam('minAmount', e.target.value);
                  }}
                  className="h-9 bg-card/40 text-xs"
                />
                <span className="text-muted-foreground text-xs">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => {
                    setMaxAmount(e.target.value);
                    updateQueryParam('maxAmount', e.target.value);
                  }}
                  className="h-9 bg-card/40 text-xs"
                />
              </div>
            </div>

            {/* Date range picker */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Date Range
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    updateQueryParam('startDate', e.target.value);
                  }}
                  className="h-9 bg-card/40 text-xs"
                />
                <span className="text-muted-foreground text-xs">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    updateQueryParam('endDate', e.target.value);
                  }}
                  className="h-9 bg-card/40 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
