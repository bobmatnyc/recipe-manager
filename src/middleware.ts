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
  // These routes are accessible to everyone
  const isPublicRoute = createRouteMatcher([
    '/',                      // Homepage
    '/sign-in(.*)',          // Sign in pages
    '/sign-up(.*)',          // Sign up pages
    '/shared(.*)',           // Shared recipes browsing
    '/discover(.*)',         // Discover/AI recipe generation (read-only browsing)
    '/api/webhooks(.*)',     // Webhooks
  ]);

  // Define routes that are conditionally protected
  // These need special handling based on the specific path and method
  const isRecipeViewRoute = createRouteMatcher([
    '/recipes/[^/]+$',       // Viewing individual recipes (not /new or /edit)
  ]);

  // Define strictly protected routes that always require authentication
  const isProtectedRoute = createRouteMatcher([
    '/recipes/new(.*)',      // Creating new recipes
    '/recipes/.*/edit(.*)',  // Editing recipes
    '/recipes$',             // My Recipes listing (personal collection)
    '/meal-plans(.*)',       // Meal planning
    '/shopping-lists(.*)',   // Shopping lists
  ]);

  // Define protected API routes
  const isProtectedApiRoute = createRouteMatcher([
    '/api/recipes/create',
    '/api/recipes/update',
    '/api/recipes/delete',
    '/api/meal-plans(.*)',
    '/api/shopping-lists(.*)',
  ]);

  // Use the clerkMiddleware with route protection logic
  return clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    const path = req.nextUrl.pathname;

    // Check if this is a recipe view route (e.g., /recipes/123) but NOT /recipes/new or /recipes/*/edit
    const isViewingRecipe = path.match(/^\/recipes\/[a-zA-Z0-9-]+$/) &&
                           !path.endsWith('/new') &&
                           !path.includes('/edit');

    // If it's a recipe view route, allow it (the page itself will check if the recipe is public)
    if (isViewingRecipe) {
      return NextResponse.next();
    }

    // If accessing a strictly protected route without authentication, redirect to sign-in
    if (!userId && (isProtectedRoute(req) || isProtectedApiRoute(req))) {
      // For API routes, return 401 instead of redirecting
      if (path.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // For regular routes, redirect to sign-in with return URL
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