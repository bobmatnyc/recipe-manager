import { getRecipes } from '@/app/actions/recipes';
import { RecipeList } from '@/components/recipe/RecipeList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function RecipesPage() {
  const result = await getRecipes();
  const recipes = result.success && result.data ? result.data : [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">My Recipes</h1>
          <p className="text-muted-foreground mt-2">
            Browse and manage your recipe collection
          </p>
        </div>
        <Link href="/recipes/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Recipe
          </Button>
        </Link>
      </div>

      <RecipeList recipes={recipes} />
    </div>
  );
}