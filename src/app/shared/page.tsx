import { getSharedRecipes, getAllTags } from '@/app/actions/recipes';
import { SharedRecipesContent } from '@/components/recipe/SharedRecipesContent';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    tags?: string;
  };
}

export default async function SharedRecipesPage({ searchParams }: PageProps) {
  // Parse selected tags from URL
  const selectedTags = searchParams.tags ? searchParams.tags.split(',').filter(Boolean) : [];

  // Fetch recipes with tag filtering
  const result = await getSharedRecipes(selectedTags);
  const sharedRecipes = result.success ? result.data : [];

  // Fetch all available tags
  const tagsResult = await getAllTags();
  const tagData = tagsResult.success && tagsResult.data ? tagsResult.data : { tags: [], counts: {} };

  return (
    <SharedRecipesContent
      sharedRecipes={sharedRecipes}
      availableTags={tagData.tags}
      tagCounts={tagData.counts}
      initialSelectedTags={selectedTags}
    />
  );
}