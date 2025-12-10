import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000',
});

export const { signIn, signUp, signOut, useSession } = authClient;
