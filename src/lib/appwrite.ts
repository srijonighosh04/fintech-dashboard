'use server';

import { Client, Account, Databases, Users } from 'node-appwrite';
import { cookies } from 'next/headers';

/**
 * Creates a client authenticated with the current user's session cookie.
 * Use this in Server Actions or Server Components that act on behalf of the user.
 */
export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '');

  const cookieStore = await cookies();
  const session = cookieStore.get('appwrite-session');

  if (session && session.value) {
    client.setSession(session.value);
  }

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}

/**
 * Creates an admin client authenticated with the master API Key.
 * Use this for administrative tasks like creating new accounts or database schemas.
 */
export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
    .setKey(process.env.APPWRITE_KEY || '');

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get users() {
      return new Users(client);
    },
  };
}
