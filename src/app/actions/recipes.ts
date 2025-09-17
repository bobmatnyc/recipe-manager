'use server';

import { db } from '@/lib/db';
import { recipes, type NewRecipe, type Recipe } from '@/lib/db/schema';
import { eq, desc, like, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Get all recipes
export async function getRecipes() {
  try {
    const allRecipes = await db
      .select()
      .from(recipes)
      .orderBy(desc(recipes.createdAt));

    return { success: true, data: allRecipes };
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    return { success: false, error: 'Failed to fetch recipes' };
  }
}

// Get a single recipe by ID
export async function getRecipe(id: number) {
  try {
    const recipe = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, id))
      .limit(1);

    if (recipe.length === 0) {
      return { success: false, error: 'Recipe not found' };
    }

    return { success: true, data: recipe[0] };
  } catch (error) {
    console.error('Failed to fetch recipe:', error);
    return { success: false, error: 'Failed to fetch recipe' };
  }
}

// Search recipes
export async function searchRecipes(query: string) {
  try {
    const searchPattern = `%${query}%`;
    const searchResults = await db
      .select()
      .from(recipes)
      .where(
        or(
          like(recipes.name, searchPattern),
          like(recipes.description, searchPattern),
          like(recipes.cuisine, searchPattern),
          like(recipes.tags, searchPattern)
        )
      )
      .orderBy(desc(recipes.createdAt));

    return { success: true, data: searchResults };
  } catch (error) {
    console.error('Failed to search recipes:', error);
    return { success: false, error: 'Failed to search recipes' };
  }
}

// Create a new recipe
export async function createRecipe(data: Omit<NewRecipe, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    // Ensure ingredients and instructions are JSON strings if they're arrays
    const recipeData = {
      ...data,
      ingredients: typeof data.ingredients === 'string'
        ? data.ingredients
        : JSON.stringify(data.ingredients),
      instructions: typeof data.instructions === 'string'
        ? data.instructions
        : JSON.stringify(data.instructions),
      tags: data.tags
        ? (typeof data.tags === 'string' ? data.tags : JSON.stringify(data.tags))
        : null,
    };

    const result = await db
      .insert(recipes)
      .values(recipeData)
      .returning();

    revalidatePath('/recipes');
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Failed to create recipe:', error);
    return { success: false, error: 'Failed to create recipe' };
  }
}

// Update a recipe
export async function updateRecipe(
  id: number,
  data: Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>>
) {
  try {
    // Ensure ingredients and instructions are JSON strings if they're arrays
    const updateData: any = { ...data };

    if (data.ingredients) {
      updateData.ingredients = typeof data.ingredients === 'string'
        ? data.ingredients
        : JSON.stringify(data.ingredients);
    }

    if (data.instructions) {
      updateData.instructions = typeof data.instructions === 'string'
        ? data.instructions
        : JSON.stringify(data.instructions);
    }

    if (data.tags) {
      updateData.tags = typeof data.tags === 'string'
        ? data.tags
        : JSON.stringify(data.tags);
    }

    updateData.updatedAt = new Date();

    const result = await db
      .update(recipes)
      .set(updateData)
      .where(eq(recipes.id, id))
      .returning();

    if (result.length === 0) {
      return { success: false, error: 'Recipe not found' };
    }

    revalidatePath('/recipes');
    revalidatePath(`/recipes/${id}`);
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Failed to update recipe:', error);
    return { success: false, error: 'Failed to update recipe' };
  }
}

// Delete a recipe
export async function deleteRecipe(id: number) {
  try {
    const result = await db
      .delete(recipes)
      .where(eq(recipes.id, id))
      .returning();

    if (result.length === 0) {
      return { success: false, error: 'Recipe not found' };
    }

    revalidatePath('/recipes');
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Failed to delete recipe:', error);
    return { success: false, error: 'Failed to delete recipe' };
  }
}

