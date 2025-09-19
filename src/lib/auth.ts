import { auth as clerkAuth } from '@clerk/nextjs/server';

// Check if we're in production (recipe.help domain) or local development
const isProduction = process.env.NODE_ENV === 'production' ||
                    process.env.VERCEL_URL?.includes('recipe.help') ||
                    process.env.NEXT_PUBLIC_APP_URL?.includes('recipe.help');

// Only enable Clerk in production
const isClerkConfigured =
  isProduction &&
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

  // Properly await the Clerk auth function
  return await clerkAuth();
}