'use server';

import prisma from '@/lib/prisma';
import { ActionResponse } from '@/features/plaid/actions/plaidActions';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Zod schema for new recipients validation
const RecipientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(40),
  email: z.string().email('Invalid email address'),
  routingNumber: z.string().length(9, 'Routing number must be exactly 9 digits').regex(/^\d+$/, 'Digits only'),
  accountNumber: z.string().min(4, 'Account number must be 4 to 17 digits').max(17).regex(/^\d+$/, 'Digits only'),
});

interface InitiateTransferOptions {
  userId: string;
  amount: number;
  type: 'INTERNAL' | 'EXTERNAL';
  senderAccountId: string;
  recipientAccountId?: string;
  recipientId?: string;
  scheduledDate?: string;
  idempotencyKey: string;
}

/**
 * Server Action to add/register a new transfer recipient.
 */
export async function createRecipientAction(
  userId: string,
  name: string,
  email: string,
  routingNumber: string,
  accountNumber: string,
): Promise<ActionResponse> {
  try {
    if (!userId) return { success: false, error: 'Unauthorized user context.' };

    const validation = RecipientSchema.safeParse({ name, email, routingNumber, accountNumber });
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    // Check if recipient already exists for this user
    const existing = await prisma.recipient.findFirst({
      where: {
        userId,
        routingNumber,
        accountNumber,
      },
    });

    if (existing) {
      return { success: false, error: 'Recipient with these bank coordinates already exists.' };
    }

    const recipient = await prisma.recipient.create({
      data: {
        userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        routingNumber,
        accountNumber,
      },
    });

    revalidatePath('/transfers');
    return { success: true, data: recipient };
  } catch (error) {
    console.error('Create recipient error:', error);
    return { success: false, error: 'Failed to create recipient.' };
  }
}

/**
 * Server Action to toggle the favorite star indicator for a recipient.
 */
export async function toggleFavoriteRecipientAction(recipientId: string): Promise<ActionResponse> {
  try {
    if (!recipientId) return { success: false, error: 'Recipient ID is required.' };

    const recipient = await prisma.recipient.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) return { success: false, error: 'Recipient not found.' };

    await prisma.recipient.update({
      where: { id: recipientId },
      data: {
        isFavorite: !recipient.isFavorite,
      },
    });

    revalidatePath('/transfers');
    return { success: true };
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return { success: false, error: 'Failed to update favorite status.' };
  }
}

/**
 * Server Action to execute a money transfer with double-submit blocks and limit validations.
 */
export async function initiateTransferAction(options: InitiateTransferOptions): Promise<ActionResponse> {
  const {
    userId,
    amount,
    type,
    senderAccountId,
    recipientAccountId,
    recipientId,
    scheduledDate,
    idempotencyKey,
  } = options;

  try {
    if (!userId || !idempotencyKey || !senderAccountId || !amount) {
      return { success: false, error: 'Missing required parameters.' };
    }

    // 1. Double Submission / Idempotency Check
    const existingTransfer = await prisma.transfer.findUnique({
      where: { idempotencyKey },
    });

    if (existingTransfer) {
      return { success: false, error: 'Duplicate transaction request detected and blocked.' };
    }

    // 2. Transfer Limit Verification (e.g. limit $5000)
    const DAILY_LIMIT = 5000;
    if (amount > DAILY_LIMIT) {
      return { success: false, error: `Transfer exceeds the daily standard limit of $${DAILY_LIMIT}.` };
    }

    // 3. Sender Balance Check
    const senderAccount = await prisma.account.findUnique({
      where: { id: senderAccountId },
    });

    if (!senderAccount) {
      return { success: false, error: 'Source account not found.' };
    }

    if (senderAccount.balanceCurrent < amount) {
      return { success: false, error: 'Insufficient funds available in selected account.' };
    }

    // 4. Destination Account verification for internal transfers
    let destinationAccount = null;
    if (type === 'INTERNAL') {
      if (!recipientAccountId) {
        return { success: false, error: 'Destination account is required for internal transfers.' };
      }

      destinationAccount = await prisma.account.findUnique({
        where: { id: recipientAccountId },
      });

      if (!destinationAccount) {
        return { success: false, error: 'Destination account not found.' };
      }
    }

    // 5. Execute transfer and update local balances in a transaction (Optimistic/Local Sync)
    const isScheduled = !!scheduledDate;

    const transfer = await prisma.$transaction(async (tx) => {
      // Create transfer log
      const log = await tx.transfer.create({
        data: {
          userId,
          amount,
          type,
          senderAccountId,
          recipientAccountId: recipientAccountId || null,
          recipientId: recipientId || null,
          status: isScheduled ? 'PENDING' : 'COMPLETED',
          scheduledDate: isScheduled ? new Date(scheduledDate) : null,
          idempotencyKey,
        },
      });

      // Adjust balances instantly if the transfer is not scheduled for the future
      if (!isScheduled) {
        // Decrement sender account
        await tx.account.update({
          where: { id: senderAccountId },
          data: {
            balanceCurrent: senderAccount.balanceCurrent - amount,
            balanceAvailable: senderAccount.balanceAvailable 
              ? senderAccount.balanceAvailable - amount 
              : null,
          },
        });

        // Increment receiver account if internal
        if (type === 'INTERNAL' && recipientAccountId) {
          await tx.account.update({
            where: { id: recipientAccountId },
            data: {
              balanceCurrent: (destinationAccount?.balanceCurrent || 0) + amount,
              balanceAvailable: destinationAccount?.balanceAvailable 
                ? destinationAccount.balanceAvailable + amount 
                : null,
            },
          });
        }
      }

      return log;
    });

    revalidatePath('/dashboard');
    revalidatePath('/transfers');
    return { success: true, data: transfer };
  } catch (error) {
    console.error('Initiate transfer error:', error);
    return { success: false, error: 'Failed to process transfer.' };
  }
}

/**
 * Server Action to retrieve the list of all recipients for a user.
 */
export async function getRecipientsAction(userId: string) {
  try {
    if (!userId) return [];
    return await prisma.recipient.findMany({
      where: { userId },
      orderBy: [
        { isFavorite: 'desc' },
        { name: 'asc' },
      ],
    });
  } catch (error) {
    console.error('Get recipients error:', error);
    return [];
  }
}

/**
 * Server Action to fetch transfer history and scheduled transactions.
 */
export async function getTransferHistoryAction(userId: string) {
  try {
    if (!userId) return [];
    return await prisma.transfer.findMany({
      where: { userId },
      include: {
        recipient: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Get transfer history error:', error);
    return [];
  }
}
