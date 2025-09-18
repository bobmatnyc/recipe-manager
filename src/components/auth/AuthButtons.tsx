'use client';

import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import Link from 'next/link';

// Check if Clerk keys are configured
const isClerkConfigured =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'YOUR_PUBLISHABLE_KEY';

export function AuthButtons() {
  if (!isClerkConfigured) {
    // Show placeholder button when Clerk is not configured
    return (
      <Button size="sm" variant="ghost" disabled>
        <User className="h-4 w-4 mr-2" />
        Auth Not Configured
      </Button>
    );
  }

  // Import Clerk components only when configured
  const { SignedIn, SignedOut, UserButton } = require('@clerk/nextjs');

  return (
    <>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          afterSwitchSessionUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8"
            }
          }}
        />
      </SignedIn>
      <SignedOut>
        <Link href="/sign-in">
          <Button size="sm">
            <User className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </Link>
      </SignedOut>
    </>
  );
}