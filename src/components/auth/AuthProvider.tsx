'use client';

import { ReactNode } from 'react';

// Check if Clerk keys are configured
const isClerkConfigured =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'YOUR_PUBLISHABLE_KEY';

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!isClerkConfigured) {
    // Return children without ClerkProvider if not configured
    return <>{children}</>;
  }

  // Import and use ClerkProvider and GoogleOneTap only when configured
  const { ClerkProvider, GoogleOneTap } = require('@clerk/nextjs');

  return (
    <ClerkProvider>
      {/* GoogleOneTap provides seamless sign-in for users with Google accounts */}
      <GoogleOneTap
        cancelOnTapOutside={true}
        oauthStrategy="oauth_google"
      />
      {children}
    </ClerkProvider>
  );
}