import { auth as clerkAuth } from '@clerk/nextjs/server';

// Check if Clerk keys are configured
const isClerkConfigured =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'YOUR_PUBLISHABLE_KEY' &&
  process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY !== 'YOUR_SECRET_KEY';

export async function auth() {
  if (!isClerkConfigured) {
    // Return mock auth when Clerk is not configured
    // This allows the app to work in development without Clerk keys
    return {
      userId: null,
      sessionId: null,
      sessionClaims: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
    };
  }

  return clerkAuth();
}