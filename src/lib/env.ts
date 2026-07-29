import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is missing'),
  NEXT_PUBLIC_APPWRITE_ENDPOINT: z.string().url().default('https://cloud.appwrite.io/v1'),
  NEXT_PUBLIC_APPWRITE_PROJECT: z.string().min(1, 'NEXT_PUBLIC_APPWRITE_PROJECT is missing'),
  APPWRITE_KEY: z.string().min(1, 'APPWRITE_KEY is missing'),
  PLAID_CLIENT_ID: z.string().min(1, 'PLAID_CLIENT_ID is missing'),
  PLAID_SECRET: z.string().min(1, 'PLAID_SECRET is missing'),
  GEMINI_API_KEY: z.string().optional(),
  DWOLLA_KEY: z.string().optional(),
  DWOLLA_SECRET: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

/**
 * Validates the loaded environment variables against strict schema constraints.
 * Alerts in build phase, and throws strict error exceptions at runtime servers.
 */
export function validateEnv(): EnvConfig {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    console.warn('⚠️ Environment configuration check failed:', result.error.format());
    
    // Only throw runtime errors when not compiling under next build phases
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'test';
    if (!isBuildPhase) {
      throw new Error(
        `Failed to load environment configuration: ${JSON.stringify(result.error.format())}`
      );
    }
  }
  return (result.data || {}) as EnvConfig;
}
