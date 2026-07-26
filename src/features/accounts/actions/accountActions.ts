'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/features/plaid/actions/plaidActions';

/**
 * Server Action to update the custom nickname of a connected bank account.
 */
export async function updateAccountNicknameAction(
  accountId: string,
  nickname: string,
): Promise<ActionResponse> {
  try {
    if (!accountId) {
      return { success: false, error: 'Account ID is required.' };
    }

    const trimmedNickname = nickname.trim();
    await prisma.account.update({
      where: { id: accountId },
      data: {
        nickname: trimmedNickname || null,
      },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: unknown) {
    console.error('Update nickname error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update nickname.';
    return { success: false, error: message };
  }
}

/**
 * Server Action to disconnect/unlink an entire Bank institution and all its child accounts.
 */
export async function disconnectBankAction(bankId: string): Promise<ActionResponse> {
  try {
    if (!bankId) {
      return { success: false, error: 'Bank ID is required.' };
    }

    // Deleting the Bank will cascade delete all linked Accounts in PostgreSQL
    await prisma.bank.delete({
      where: { id: bankId },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: unknown) {
    console.error('Disconnect bank error:', error);
    const message = error instanceof Error ? error.message : 'Failed to disconnect bank connection.';
    return { success: false, error: message };
  }
}

/**
 * Server Action to fetch all connected banks and their accounts for a user.
 */
export async function getConnectedAccountsAction(userId: string) {
  try {
    if (!userId) return [];
    
    return await prisma.bank.findMany({
      where: { userId },
      include: {
        accounts: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { institutionName: 'asc' },
    });
  } catch (error) {
    console.error('Failed to get connected accounts:', error);
    return [];
  }
}
