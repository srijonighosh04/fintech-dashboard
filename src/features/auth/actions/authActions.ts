'use server';

import { ID } from 'node-appwrite';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient, createSessionClient } from '@/lib/appwrite';
import { LoginInput, SignupInput, ForgotPasswordInput } from '../schema';

export interface AuthResponse {
  success: boolean;
  error?: string;
}

/**
 * Server Action to register a new user.
 * Automatically logs the user in after registration by creating a session and setting a cookie.
 */
export async function signUpWithEmail(data: SignupInput): Promise<AuthResponse> {
  try {
    const { account } = await createAdminClient();

    // 1. Create the user account
    await account.create(ID.unique(), data.email, data.password, data.name);

    // 2. Log them in to generate a session
    const session = await account.createEmailPasswordSession(data.email, data.password);

    // 3. Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign up.';
    console.error('Signup error:', error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action to log in an existing user.
 * Creates an Appwrite email/password session and sets the session cookie.
 */
export async function loginWithEmail(data: LoginInput): Promise<AuthResponse> {
  try {
    const { account } = await createAdminClient();

    // 1. Authenticate credentials
    const session = await account.createEmailPasswordSession(data.email, data.password);

    // 2. Save session token to HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid email or password.';
    console.error('Login error:', error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action to log out the current user.
 * Deletes the session on Appwrite servers and removes the session cookie.
 */
export async function logoutUser(): Promise<AuthResponse> {
  try {
    const { account } = await createSessionClient();

    // 1. Delete session from Appwrite
    await account.deleteSession('current');
  } catch (error) {
    // If the session was already expired on the server, we still want to clean up the cookie
    console.warn('Appwrite session delete failed (already expired):', error);
  } finally {
    // 2. Always delete local session cookie
    const cookieStore = await cookies();
    cookieStore.delete('appwrite-session');
  }

  redirect('/login');
}

/**
 * Helper to fetch details of the currently authenticated user.
 * Returns null if the user is not authenticated or if an error occurs.
 */
export async function getCurrentUser() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    return {
      $id: user.$id,
      name: user.name,
      email: user.email,
      emailVerification: user.emailVerification,
    };
  } catch {
    return null;
  }
}

/**
 * Server Action to trigger password reset logic.
 */
export async function requestPasswordReset(data: ForgotPasswordInput): Promise<AuthResponse> {
  try {
    const { account } = await createAdminClient();
    
    // We send them a recovery link. Under real production, specify the actual password recovery reset page.
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await account.createRecovery(data.email, `${origin}/reset-password`);
    
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Could not process password recovery request.';
    console.error('Password reset error:', error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
