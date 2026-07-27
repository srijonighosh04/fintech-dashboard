'use server';

import prisma from '@/lib/prisma';
import { plaidClient } from '@/lib/plaid';
import { ActionResponse } from '@/features/plaid/actions/plaidActions';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@/generated/prisma/client';

export interface GetTransactionsOptions {
  userId: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'amount' | 'name';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  category?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  accountId?: string;
}

export interface TransactionWithAccountDetails {
  id: string;
  accountId: string;
  amount: number;
  date: Date;
  name: string;
  merchantName: string | null;
  category: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  account: {
    name: string;
    bank: {
      institutionName: string;
    };
  };
}

export interface PaginatedTransactionsResponse {
  transactions: TransactionWithAccountDetails[];
  totalCount: number;
  totalPages: number;
}

/**
 * Server Action to pull transaction records from Plaid for a specific Bank connection
 * and cache/upsert them in the PostgreSQL database.
 */
export async function syncPlaidTransactionsAction(bankId: string): Promise<ActionResponse> {
  try {
    if (!bankId) {
      return { success: false, error: 'Bank ID is required.' };
    }

    const bank = await prisma.bank.findUnique({
      where: { id: bankId },
    });

    if (!bank) {
      return { success: false, error: 'Bank connection not found.' };
    }

    // Set search dates (30 days ago to today)
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const formatPlaidDate = (date: Date) => date.toISOString().split('T')[0];

    const response = await plaidClient.transactionsGet({
      access_token: bank.accessToken,
      start_date: formatPlaidDate(thirtyDaysAgo),
      end_date: formatPlaidDate(now),
    });

    const plaidTransactions = response.data.transactions;

    // Caching transactions inside PostgreSQL in an upsert transaction
    await prisma.$transaction(
      plaidTransactions.map((tx) =>
        prisma.transaction.upsert({
          where: { id: tx.transaction_id },
          update: {
            amount: tx.amount,
            date: new Date(tx.date),
            name: tx.name,
            merchantName: tx.merchant_name || null,
            category: tx.category ? tx.category.join(', ') : 'General',
            status: tx.pending ? 'pending' : 'completed',
            updatedAt: new Date(),
          },
          create: {
            id: tx.transaction_id,
            accountId: tx.account_id,
            amount: tx.amount,
            date: new Date(tx.date),
            name: tx.name,
            merchantName: tx.merchant_name || null,
            category: tx.category ? tx.category.join(', ') : 'General',
            status: tx.pending ? 'pending' : 'completed',
          },
        })
      )
    );

    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    return { success: true };
  } catch (error: unknown) {
    console.error('Plaid transactions sync error:', error);
    const message = error instanceof Error ? error.message : 'Transactions synchronization failed.';
    return { success: false, error: message };
  }
}

/**
 * Server Action to fetch paginated, sorted, and filtered transactions from PostgreSQL.
 */
export async function getTransactionsAction(
  options: GetTransactionsOptions
): Promise<PaginatedTransactionsResponse> {
  const {
    userId,
    page = 1,
    limit = 10,
    sortBy = 'date',
    sortOrder = 'desc',
    search,
    category,
    status,
    minAmount,
    maxAmount,
    startDate,
    endDate,
    accountId,
  } = options;

  try {
    // 1. Resolve user accounts
    const userAccounts = await prisma.account.findMany({
      where: {
        bank: {
          userId,
        },
      },
      select: {
        id: true,
      },
    });

    const userAccountIds = userAccounts.map((acc) => acc.id);

    if (userAccountIds.length === 0) {
      return { transactions: [], totalCount: 0, totalPages: 0 };
    }

    // 2. Build Prisma Filter Clause
    const where: Prisma.TransactionWhereInput = {};

    if (accountId) {
      // Filter by a single account if specified, ensuring it belongs to the user
      if (userAccountIds.includes(accountId)) {
        where.accountId = accountId;
      } else {
        return { transactions: [], totalCount: 0, totalPages: 0 };
      }
    } else {
      where.accountId = { in: userAccountIds };
    }

    // Keyword Search (Merchant Name or Transaction Description)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { merchantName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category Filter
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    // Status Filter
    if (status) {
      where.status = { equals: status, mode: 'insensitive' };
    }

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      const amountFilter: Prisma.FloatFilter = {};
      if (minAmount !== undefined) amountFilter.gte = minAmount;
      if (maxAmount !== undefined) amountFilter.lte = maxAmount;
      where.amount = amountFilter;
    }

    // Date range filter
    if (startDate || endDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
      where.date = dateFilter;
    }

    // 3. Count total records matching filters
    const totalCount = await prisma.transaction.count({ where });

    // 4. Fetch dynamic subset with ordering and joins
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        account: {
          select: {
            name: true,
            bank: {
              select: {
                institutionName: true,
              },
            },
          },
        },
      },
    }) as unknown as TransactionWithAccountDetails[];

    const totalPages = Math.ceil(totalCount / limit);

    return {
      transactions,
      totalCount,
      totalPages,
    };
  } catch (error) {
    console.error('Failed to get transactions:', error);
    return { transactions: [], totalCount: 0, totalPages: 0 };
  }
}
