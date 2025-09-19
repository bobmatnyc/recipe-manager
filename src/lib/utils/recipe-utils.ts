import { type Recipe } from '@/lib/db/schema';

// Helper function to parse JSON fields for client-side use
export function parseRecipe(recipe: Recipe) {
  return {
    ...recipe,
    ingredients: typeof recipe.ingredients === 'string'
      ? JSON.parse(recipe.ingredients)
      : recipe.ingredients,
    instructions: typeof recipe.instructions === 'string'
      ? JSON.parse(recipe.instructions)
      : recipe.instructions,
    tags: recipe.tags
      ? (typeof recipe.tags === 'string' ? JSON.parse(recipe.tags) : recipe.tags)
      : [],
    images: recipe.images
      ? (typeof recipe.images === 'string' ? JSON.parse(recipe.images) : recipe.images)
      : [],
  };
}