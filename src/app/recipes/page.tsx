import { getRecipes, getAllTags } from '@/app/actions/recipes';
import RecipePageContent from '@/components/recipe/RecipePageContent';
import { auth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChefHat } from 'lucide-react';

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    tags?: string;
  }>;
}

export default async function RecipesPage({ searchParams }: PageProps) {
  // Check authentication
  const { userId } = await auth();
  const isLocalhost = process.env.NODE_ENV === 'development';
  const isAuthenticated = userId || isLocalhost;

  // If not authenticated, show sign-in prompt
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Welcome to Recipe Manager</CardTitle>
              <CardDescription>
                Sign in to create, manage, and organize your personal recipe collection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/sign-in" className="block">
                <Button className="w-full" size="lg">
                  Sign In to Manage Recipes
                </Button>
              </Link>
              <div className="text-center">
                <Link
                  href="/discover"
                  className="text-sm text-muted-foreground hover:text-primary underline"
                >
                  Browse public recipes instead
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Await searchParams as it's now a Promise in Next.js 15
  const params = await searchParams;

  // Parse selected tags from URL
  const selectedTags = params.tags ? params.tags.split(',').filter(Boolean) : [];

  // Fetch recipes with tag filtering
  const result = await getRecipes(selectedTags);
  const recipes = result.success && result.data ? result.data : [];

  // Fetch all available tags
  const tagsResult = await getAllTags();
  const tagData = tagsResult.success && tagsResult.data ? tagsResult.data : { tags: [], counts: {} };

  return (
    <RecipePageContent
      recipes={recipes}
      availableTags={tagData.tags}
      tagCounts={tagData.counts}
      initialSelectedTags={selectedTags}
    />
  );
}