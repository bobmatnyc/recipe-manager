import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check if we're in production (recipe.help or vercel.app domains)
  const isProduction =
    request.nextUrl.hostname.includes('recipe.help') ||
    request.nextUrl.hostname.includes('vercel.app');

  // Only enable Clerk in production with proper keys
  const isClerkConfigured =
    isProduction &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'YOUR_PUBLISHABLE_KEY' &&
    process.env.CLERK_SECRET_KEY &&
    process.env.CLERK_SECRET_KEY !== 'YOUR_SECRET_KEY';

  if (!isClerkConfigured) {
    // Skip all authentication for localhost and non-configured environments
    return NextResponse.next();
  }

  // Dynamically import and use clerkMiddleware only when configured
  const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');

  // Define public routes that don't require authentication
  const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/discover(.*)',
    '/api/webhooks(.*)',
  ]);

  // Define protected routes that require authentication
  const isProtectedRoute = createRouteMatcher([
    '/recipes(.*)',
    '/api/recipes(.*)',
  ]);

  // Use the clerkMiddleware with route protection logic
  return clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    // If accessing a protected route without authentication, redirect to sign-in
    if (!userId && isProtectedRoute(req)) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  })(request, {} as any);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};