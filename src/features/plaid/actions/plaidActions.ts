'use server';

import { Products, CountryCode } from 'plaid';
import { plaidClient } from '@/lib/plaid';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action to generate a Plaid link token.
 */
export async function createLinkTokenAction(userId: string): Promise<ActionResponse<string>> {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required.' };
    }

    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'AstraBank',
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    return {
      success: true,
      data: response.data.link_token,
    };
  } catch (error: unknown) {
    console.error('Plaid createLinkToken error:', error);
    const message = error instanceof Error ? error.message : 'Could not create Plaid link token.';
    return { success: false, error: message };
  }
}

/**
 * Server Action to exchange a public_token for an access_token,
 * fetch the associated accounts, and store everything in PostgreSQL.
 */
export async function exchangePublicTokenAction(
  publicToken: string,
  institutionId: string,
  institutionName: string,
  userId: string,
): Promise<ActionResponse> {
  try {
    if (!publicToken || !institutionId || !userId) {
      return { success: false, error: 'Missing required parameters.' };
    }

    // 1. Exchange public token for access token
    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = tokenResponse.data.access_token;
    const itemId = tokenResponse.data.item_id;

    // 2. Retrieve account balances from Plaid
    const balanceResponse = await plaidClient.accountsBalanceGet({
      access_token: accessToken,
    });

    const plaidAccounts = balanceResponse.data.accounts;

    // 3. Save Bank and Accounts to PostgreSQL in a transaction
    await prisma.$transaction(async (tx) => {
      // Create the Bank node
      const bank = await tx.bank.create({
        data: {
          userId,
          accessToken,
          itemId,
          institutionId,
          institutionName,
          status: 'CONNECTED',
        },
      });

      // Map and create the associated Accounts
      const accountData = plaidAccounts.map((acc) => {
        // Map Plaid types to our database type categories
        let accountType = 'checking';
        if (acc.type === 'credit') {
          accountType = 'credit';
        } else if (acc.type === 'investment') {
          accountType = 'investment';
        } else if (acc.subtype === 'savings') {
          accountType = 'savings';
        }

        return {
          id: acc.account_id,
          bankId: bank.id,
          name: acc.name,
          officialName: acc.official_name || null,
          mask: acc.mask || '0000',
          type: accountType,
          subtype: acc.subtype || null,
          balanceCurrent: acc.balances.current ?? 0,
          balanceAvailable: acc.balances.available ?? null,
          balanceLimit: acc.balances.limit ?? null,
        };
      });

      await tx.account.createMany({
        data: accountData,
      });
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: unknown) {
    console.error('Plaid exchangePublicToken error:', error);
    const message = error instanceof Error ? error.message : 'Token exchange failed.';
    return { success: false, error: message };
  }
}

/**
 * Server Action to fetch fresh account balances from Plaid for a given Bank item.
 */
export async function refreshBankBalancesAction(bankId: string): Promise<ActionResponse> {
  try {
    if (!bankId) {
      return { success: false, error: 'Bank ID is required.' };
    }

    // 1. Get bank item
    const bank = await prisma.bank.findUnique({
      where: { id: bankId },
    });

    if (!bank) {
      return { success: false, error: 'Bank connection not found.' };
    }

    // 2. Fetch fresh details from Plaid
    const balanceResponse = await plaidClient.accountsBalanceGet({
      access_token: bank.accessToken,
    });

    const plaidAccounts = balanceResponse.data.accounts;

    // 3. Update databases
    await prisma.$transaction(
      plaidAccounts.map((acc) =>
        prisma.account.updateMany({
          where: {
            id: acc.account_id,
            bankId,
          },
          data: {
            balanceCurrent: acc.balances.current ?? 0,
            balanceAvailable: acc.balances.available ?? null,
            balanceLimit: acc.balances.limit ?? null,
            updatedAt: new Date(),
          },
        })
      )
    );

    // Ensure status is updated back to CONNECTED if it was in REAUTH_REQUIRED
    await prisma.bank.update({
      where: { id: bankId },
      data: { status: 'CONNECTED' },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: unknown) {
    console.error('Plaid refreshBalances error:', error);
    
    // Check if error is related to Plaid item login expiration
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('ITEM_LOGIN_REQUIRED')) {
      await prisma.bank.update({
        where: { id: bankId },
        data: { status: 'REAUTH_REQUIRED' },
      });
      return { success: false, error: 'Re-authentication is required with your bank.' };
    }

    const message = error instanceof Error ? error.message : 'Balance refresh failed.';
    return { success: false, error: message };
  }
}
