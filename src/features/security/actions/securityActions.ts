'use server';

import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { isRateLimited } from '@/lib/rateLimiter';
import { sanitizeObject } from '@/utils/sanitize';
import { ActionResponse } from '@/features/plaid/actions/plaidActions';

/**
 * Creates an audit log entry in the database.
 * Resolves requesting IP address and User Agent headers dynamically.
 */
export async function logAuditEventAction(
  userId: string | null,
  action: string,
  details: Record<string, unknown>
): Promise<void> {
  try {
    const reqHeaders = await headers();
    const ipAddress = reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip') || 'unknown';
    const userAgent = reqHeaders.get('user-agent') || 'unknown';

    // Prevent sensitive details leakage (e.g. passwords, tokens)
    const filteredDetails = { ...details };
    const sensitiveKeys = ['password', 'accessToken', 'secret', 'token', 'accountNumber'];
    sensitiveKeys.forEach((key) => {
      if (key in filteredDetails) {
        filteredDetails[key] = '[REDACTED]';
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: JSON.stringify(filteredDetails),
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    console.error('logAuditEventAction failed:', err);
  }
}

/**
 * Retrieves the recent audit log records for a specific user ID.
 */
export async function getAuditLogsAction(userId: string) {
  try {
    if (!userId) return [];
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  } catch (error) {
    console.error('getAuditLogsAction error:', error);
    return [];
  }
}

interface SecureWrapperOptions {
  rateLimitMax?: number;
  rateLimitWindowMs?: number;
  sanitize?: boolean;
  auditActionName?: string;
}

/**
 * Higher-order Server Action wrapper providing:
 * - In-memory sliding-window IP rate limiting checks.
 * - Input parameter tag sanitization against XSS injections.
 * - Try/Catch centralized error handling masking database system details.
 * - Auto audit logs persistence.
 */
export async function secureActionWrapper<TArgs, TResult>(
  userId: string | null,
  args: TArgs,
  action: (args: TArgs) => Promise<TResult>,
  options: SecureWrapperOptions = {}
): Promise<ActionResponse> {
  const {
    rateLimitMax = 60,
    rateLimitWindowMs = 60 * 1000,
    sanitize = true,
    auditActionName,
  } = options;

  try {
    // 1. IP rate limiting evaluation
    const reqHeaders = await headers();
    const ip = reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip') || '127.0.0.1';

    if (isRateLimited(ip, rateLimitMax, rateLimitWindowMs)) {
      await logAuditEventAction(userId, 'RATE_LIMIT_EXCEEDED', { ip, actionName: auditActionName });
      return {
        success: false,
        error: 'Too many requests. Please slow down and try again later.',
      };
    }

    // 2. Input sanitization (XSS mitigation)
    const sanitizedArgs = sanitize ? sanitizeObject(args) : args;

    // 3. Execution of primary server handler
    const result = await action(sanitizedArgs);

    // 4. Audit logging on success
    if (auditActionName) {
      await logAuditEventAction(userId, `${auditActionName}_SUCCESS`, {
        parameters: sanitizedArgs as Record<string, unknown>,
      });
    }

    return { success: true, data: result };
  } catch (error: unknown) {
    // 5. Centralized Error Handling & details masking
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error(`Secure action execution failure [${auditActionName || 'UNNAMED'}]:`, errMessage);

    if (auditActionName) {
      await logAuditEventAction(userId, `${auditActionName}_FAILURE`, {
        error: errMessage,
      });
    }

    // Mask database/Prisma/Appwrite detailed stack dump messages to prevent technical leakages
    return {
      success: false,
      error: 'An internal application error occurred. Our team has been notified.',
    };
  }
}
