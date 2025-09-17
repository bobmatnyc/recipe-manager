import { getRecipe } from '@/app/actions/recipes';
import { RecipeForm } from '@/components/recipe/RecipeForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

interface EditRecipePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params;
  const result = await getRecipe(parseInt(id));

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link
        href={`/recipes/${id}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Recipe
      </Link>

      <h1 className="text-4xl font-bold mb-8">Edit Recipe</h1>

      <RecipeForm recipe={result.data} />
    </div>
  );
}