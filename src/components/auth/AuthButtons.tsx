'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

// Check if we're in production (recipe.help domain) or local development
const isProduction = typeof window !== 'undefined' &&
                    (window.location.hostname.includes('recipe.help') ||
                     window.location.hostname.includes('vercel.app'));

// Only enable Clerk in production, disable for localhost
const isClerkConfigured =
  isProduction &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'YOUR_PUBLISHABLE_KEY';

// Component to show when Clerk is not configured (development mode)
function DevelopmentAuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/sign-in">
        <Button variant="ghost" size="sm">
          <LogIn className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </Link>
    </div>
  );
}

// Component to show when Clerk is configured (production mode)
function ProductionAuthButtons() {
  if (!isClerkConfigured) {
    return <DevelopmentAuthButtons />;
  }

  try {
    const { useUser, UserButton, SignInButton } = require('@clerk/nextjs');

    // Hook must be called inside the component
    function AuthButtonsContent() {
      const { isSignedIn, isLoaded, user } = useUser();

      // Show loading state while auth status is being determined
      if (!isLoaded) {
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 bg-muted animate-pulse rounded-md" />
          </div>
        );
      }

      // Show UserButton if signed in
      if (isSignedIn) {
        return (
          <div className="flex items-center gap-2">
            <UserButton
              appearance={{
                elements: {
                  rootBox: 'flex items-center',
                  avatarBox: 'h-8 w-8',
                  userButtonPopoverCard: 'shadow-lg border',
                  userButtonPopoverActions: 'space-y-1',
                },
              }}
              userProfileMode="navigation"
              userProfileUrl="/user-profile"
              afterSignOutUrl="/"
            />
          </div>
        );
      }

      // Show Sign In button if not signed in
      return (
        <div className="flex items-center gap-2">
          <SignInButton mode="navigation" forceRedirectUrl="/">
            <Button variant="ghost" size="sm">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </SignInButton>
        </div>
      );
    }

    return <AuthButtonsContent />;
  } catch (error) {
    // Fallback to development buttons if Clerk fails to load
    console.warn('Clerk failed to load:', error);
    return <DevelopmentAuthButtons />;
  }
}

export function AuthButtons() {
  // Always show buttons, but adapt based on environment
  if (isClerkConfigured) {
    return <ProductionAuthButtons />;
  } else {
    return <DevelopmentAuthButtons />;
  }
}