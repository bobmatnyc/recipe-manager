'use server';

import { db } from '@/lib/db';
import { recipes, type NewRecipe, type Recipe } from '@/lib/db/schema';
import { eq, desc, like, or, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

// Get all recipes for the current user
export async function getRecipes() {
  try {
    const { userId } = await auth();

    if (!userId) {
      // Return only public recipes for non-authenticated users
      const publicRecipes = await db
        .select()
        .from(recipes)
        .where(eq(recipes.isPublic, true))
        .orderBy(desc(recipes.createdAt));
      return { success: true, data: publicRecipes };
    }

    // Return user's recipes for authenticated users
    const userRecipes = await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, userId))
      .orderBy(desc(recipes.createdAt));

    return { success: true, data: userRecipes };
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    return { success: false, error: 'Failed to fetch recipes' };
  }
}

// Get a single recipe by ID
export async function getRecipe(id: number) {
  try {
    const { userId } = await auth();
    const recipe = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, id))
      .limit(1);

    if (recipe.length === 0) {
      return { success: false, error: 'Recipe not found' };
    }

    // Check if user has access to this recipe
    const recipeData = recipe[0];
    if (!recipeData.isPublic && recipeData.userId !== userId) {
      return { success: false, error: 'Access denied' };
    }

    return { success: true, data: recipeData };
  } catch (error) {
    console.error('Failed to fetch recipe:', error);
    return { success: false, error: 'Failed to fetch recipe' };
  }
}

// Search recipes
export async function searchRecipes(query: string) {
  try {
    const { userId } = await auth();
    const searchPattern = `%${query}%`;

    // Build search conditions
    const searchConditions = or(
      like(recipes.name, searchPattern),
      like(recipes.description, searchPattern),
      like(recipes.cuisine, searchPattern),
      like(recipes.tags, searchPattern)
    );

    // For authenticated users, search their recipes and public recipes
    // For non-authenticated users, search only public recipes
    const accessCondition = userId
      ? or(eq(recipes.userId, userId), eq(recipes.isPublic, true))
      : eq(recipes.isPublic, true);

    const searchResults = await db
      .select()
      .from(recipes)
      .where(and(searchConditions, accessCondition))
      .orderBy(desc(recipes.createdAt));

    return { success: true, data: searchResults };
  } catch (error) {
    console.error('Failed to search recipes:', error);
    return { success: false, error: 'Failed to search recipes' };
  }
}

// Create a new recipe
export async function createRecipe(data: Omit<NewRecipe, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    // Ensure ingredients and instructions are JSON strings if they're arrays
    const recipeData = {
      ...data,
      userId,
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
  data: Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    // Check if user owns this recipe
    const existingRecipe = await db
      .select()
      .from(recipes)
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)))
      .limit(1);

    if (existingRecipe.length === 0) {
      return { success: false, error: 'Recipe not found or access denied' };
    }

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
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)))
      .returning();

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
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    const result = await db
      .delete(recipes)
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)))
      .returning();

    if (result.length === 0) {
      return { success: false, error: 'Recipe not found or access denied' };
    }

    revalidatePath('/recipes');
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Failed to delete recipe:', error);
    return { success: false, error: 'Failed to delete recipe' };
  }
}

// Get public recipes for discover page
export async function getPublicRecipes() {
  try {
    const publicRecipes = await db
      .select()
      .from(recipes)
      .where(eq(recipes.isPublic, true))
      .orderBy(desc(recipes.createdAt));

    return { success: true, data: publicRecipes };
  } catch (error) {
    console.error('Failed to fetch public recipes:', error);
    return { success: false, error: 'Failed to fetch public recipes' };
  }
}

// Toggle recipe public/private status
export async function toggleRecipeVisibility(id: number) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    // Get the current recipe
    const recipe = await db
      .select()
      .from(recipes)
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)))
      .limit(1);

    if (recipe.length === 0) {
      return { success: false, error: 'Recipe not found or access denied' };
    }

    // Toggle the isPublic field
    const result = await db
      .update(recipes)
      .set({
        isPublic: !recipe[0].isPublic,
        updatedAt: new Date()
      })
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)))
      .returning();

    revalidatePath('/recipes');
    revalidatePath(`/recipes/${id}`);
    revalidatePath('/discover');

    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Failed to toggle recipe visibility:', error);
    return { success: false, error: 'Failed to toggle recipe visibility' };
  }
}