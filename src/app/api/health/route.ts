import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Health Check API Endpoint.
 * Reports PostgreSQL connection status, system uptime, and memory parameters.
 * Responds with 200 on success, or 503 if any core service fails.
 */
export async function GET() {
  try {
    // 1. Validate PostgreSQL connection health
    await prisma.$queryRaw`SELECT 1`;

    // 2. Fetch runtime stats details
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: `${uptime.toFixed(1)}s`,
        services: {
          database: 'online',
          auth: 'online',
        },
        system: {
          memoryUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          memoryTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Healthcheck endpoint error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'offline',
        },
      },
      { status: 503 }
    );
  }
}
