import type { Recipe } from '@/lib/db/schema';
import matter from 'gray-matter';

/**
 * Formats a recipe object into markdown with YAML frontmatter
 */
export function recipeToMarkdown(recipe: Recipe): string {
  // Parse JSON fields
  const ingredients = typeof recipe.ingredients === 'string'
    ? JSON.parse(recipe.ingredients)
    : recipe.ingredients || [];
  const instructions = typeof recipe.instructions === 'string'
    ? JSON.parse(recipe.instructions)
    : recipe.instructions || [];
  const tags = recipe.tags
    ? (typeof recipe.tags === 'string' ? JSON.parse(recipe.tags) : recipe.tags)
    : [];
  const nutritionInfo = recipe.nutritionInfo
    ? (typeof recipe.nutritionInfo === 'string' ? JSON.parse(recipe.nutritionInfo) : recipe.nutritionInfo)
    : {};
  // Prepare frontmatter data
  const frontmatter = {
    title: recipe.name,
    description: recipe.description,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: (recipe.prepTime || 0) + (recipe.cookTime || 0),
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    cuisine: recipe.cuisine,
    imageUrl: recipe.imageUrl,
    tags: tags,
    nutritionInfo: nutritionInfo,
    createdAt: recipe.createdAt?.toISOString(),
    updatedAt: recipe.updatedAt?.toISOString(),
  };

  // Build markdown content
  const markdownContent = [];

  // Add description if present
  if (recipe.description) {
    markdownContent.push(`> ${recipe.description}`);
    markdownContent.push('');
  }

  // Add recipe metadata
  markdownContent.push('## Recipe Information');
  markdownContent.push('');
  if (recipe.prepTime) markdownContent.push(`- **Prep Time:** ${recipe.prepTime} minutes`);
  if (recipe.cookTime) markdownContent.push(`- **Cook Time:** ${recipe.cookTime} minutes`);
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  if (totalTime > 0) markdownContent.push(`- **Total Time:** ${totalTime} minutes`);
  if (recipe.servings) markdownContent.push(`- **Servings:** ${recipe.servings}`);
  if (recipe.difficulty) markdownContent.push(`- **Difficulty:** ${recipe.difficulty}`);
  if (recipe.cuisine) markdownContent.push(`- **Cuisine:** ${recipe.cuisine}`);
  markdownContent.push('');

  // Add ingredients
  if (ingredients && ingredients.length > 0) {
    markdownContent.push('## Ingredients');
    markdownContent.push('');
    ingredients.forEach((ingredient: string) => {
      markdownContent.push(`- ${ingredient}`);
    });
    markdownContent.push('');
  }

  // Add instructions
  if (instructions && instructions.length > 0) {
    markdownContent.push('## Instructions');
    markdownContent.push('');
    instructions.forEach((instruction: string, index: number) => {
      markdownContent.push(`${index + 1}. ${instruction}`);
    });
    markdownContent.push('');
  }

  // Add nutrition info if present
  if (nutritionInfo && Object.keys(nutritionInfo).length > 0) {
    markdownContent.push('## Nutrition Information');
    markdownContent.push('');
    markdownContent.push('| Nutrient | Value |');
    markdownContent.push('|----------|-------|');

    const nutritionLabels: Record<string, string> = {
      calories: 'Calories',
      protein: 'Protein',
      carbs: 'Carbohydrates',
      fat: 'Fat',
      fiber: 'Fiber',
      sugar: 'Sugar',
      sodium: 'Sodium',
    };

    Object.entries(nutritionInfo).forEach(([key, value]) => {
      const label = nutritionLabels[key] || key;
      markdownContent.push(`| ${label} | ${value} |`);
    });
    markdownContent.push('');
  }

  // Add tags if present
  if (tags && tags.length > 0) {
    markdownContent.push('## Tags');
    markdownContent.push('');
    markdownContent.push(tags.map((tag: string) => `#${tag}`).join(' '));
    markdownContent.push('');
  }

  // Combine frontmatter and content
  const fullMarkdown = matter.stringify(markdownContent.join('\n'), frontmatter);

  return fullMarkdown;
}

/**
 * Generates a safe filename from recipe title
 */
export function generateRecipeFilename(title: string): string {
  // Remove special characters and replace spaces with hyphens
  const safeName = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  return `${safeName}.md`;
}

/**
 * Formats recipe data for display in markdown preview
 */
export function formatRecipePreview(recipe: Partial<Recipe>): string {
  const preview = [];

  preview.push(`# ${recipe.name || 'Untitled Recipe'}`);
  preview.push('');

  if (recipe.description) {
    preview.push(`*${recipe.description}*`);
    preview.push('');
  }

  const details = [];
  if (recipe.prepTime) details.push(`Prep: ${recipe.prepTime}min`);
  if (recipe.cookTime) details.push(`Cook: ${recipe.cookTime}min`);
  if (recipe.servings) details.push(`Servings: ${recipe.servings}`);

  if (details.length > 0) {
    preview.push(details.join(' | '));
    preview.push('');
  }

  return preview.join('\n');
}