import { pgTable, text, integer, serial, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Recipes table with authentication support
export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // Clerk user ID
  name: text('name').notNull(),
  description: text('description'),
  ingredients: text('ingredients').notNull(), // JSON array of strings
  instructions: text('instructions').notNull(), // JSON array of strings
  prepTime: integer('prep_time'), // in minutes
  cookTime: integer('cook_time'), // in minutes
  servings: integer('servings'),
  difficulty: text('difficulty', { enum: ['easy', 'medium', 'hard'] }),
  cuisine: text('cuisine'),
  tags: text('tags'), // JSON array of strings
  imageUrl: text('image_url'), // External URL only
  isAiGenerated: boolean('is_ai_generated').default(false),
  isPublic: boolean('is_public').default(false), // Recipe visibility
  nutritionInfo: text('nutrition_info'), // JSON object with nutritional data
  modelUsed: text('model_used'), // AI model used for generation
  source: text('source'), // Recipe source (URL, chef name, etc.)
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Type exports
export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;

// Zod schemas for validation
export const insertRecipeSchema = createInsertSchema(recipes);
export const selectRecipeSchema = createSelectSchema(recipes);