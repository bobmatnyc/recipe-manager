'use client';

import { ReactNode } from 'react';
import { ClerkProvider, GoogleOneTap } from '@clerk/nextjs';

// Check if Clerk is properly configured with valid keys
const isClerkConfigured =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'YOUR_PUBLISHABLE_KEY' &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== '';

export function AuthProvider({ children }: { children: ReactNode }) {
  // If Clerk is not configured, just return children
  if (!isClerkConfigured) {
    return <>{children}</>;
  }

  // Return ClerkProvider with GoogleOneTap
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          card: 'shadow-lg',
        }
      }}
    >
      <GoogleOneTap
        cancelOnTapOutside={true}
      />
      {children}
    </ClerkProvider>
  );
}