'use client';

import React, { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Loader2, Plus } from 'lucide-react';
import { createLinkTokenAction, exchangePublicTokenAction } from '../actions/plaidActions';
import { Button } from '@/components/ui/button';

interface PlaidLinkButtonProps {
  userId: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'xs';
  className?: string;
  onSuccess?: () => void;
}

export function PlaidLinkButton({
  userId,
  variant = 'default',
  size = 'default',
  className,
  onSuccess,
}: PlaidLinkButtonProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isExchanging, setIsExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate Plaid Link Token on mount
  useEffect(() => {
    async function fetchToken() {
      const response = await createLinkTokenAction(userId);
      if (response.success && response.data) {
        setToken(response.data);
      } else {
        setError(response.error || 'Failed to initialize bank linker.');
      }
    }
    fetchToken();
  }, [userId]);

  const { open, ready } = usePlaidLink({
    token,
    onSuccess: async (publicToken, metadata) => {
      if (!publicToken) {
        setError('Invalid link response.');
        return;
      }
      setIsExchanging(true);
      setError(null);
      
      const institutionId = (metadata.institution?.institution_id || 'unknown') as string;
      const institutionName = (metadata.institution?.name || 'Financial Institution') as string;

      const response = await exchangePublicTokenAction(
        publicToken as string,
        institutionId,
        institutionName,
        userId,
      );

      setIsExchanging(false);

      if (response.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || 'Failed to connect bank account.');
      }
    },
  });

  const isLoading = !token && !error;

  return (
    <div className="flex flex-col gap-1.5 w-full sm:w-auto">
      <Button
        onClick={() => open()}
        disabled={!ready || isExchanging || isLoading}
        variant={variant}
        size={size}
        className={className}
      >
        {isExchanging ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            Linking...
          </>
        ) : isLoading ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            Loading Linker
          </>
        ) : (
          <>
            <Plus className="mr-1.5 h-4 w-4" />
            Connect Bank
          </>
        )}
      </Button>
      
      {error && (
        <span className="text-xs text-destructive font-medium text-center sm:text-left">
          {error}
        </span>
      )}
    </div>
  );
}
