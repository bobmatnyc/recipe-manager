import { RecipeForm } from '@/components/recipe/RecipeForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function NewRecipePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link
        href="/recipes"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Recipes
      </Link>

      <h1 className="text-4xl font-bold mb-8">Create New Recipe</h1>

      <RecipeForm />
    </div>
  );
}