import { getRecipes, getAllTags } from '@/app/actions/recipes';
import RecipePageContent from '@/components/recipe/RecipePageContent';

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    tags?: string;
  }>;
}

export default async function RecipesPage({ searchParams }: PageProps) {
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