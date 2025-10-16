/**
 * Database Migration: Add slug column to recipes table
 *
 * This migration adds the slug column to the recipes table
 * without breaking existing functionality. The column is nullable
 * initially to allow for gradual rollout.
 *
 * Steps:
 * 1. Add slug column (nullable)
 * 2. Add index on slug column
 * 3. Add unique constraint on slug column
 *
 * After running this migration, use generate-recipe-slugs.ts
 * to populate slugs for all existing recipes.
 */

import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  console.log('Starting migration: Add slug column to recipes table...\n');

  try {
    // Step 1: Add slug column (nullable initially)
    console.log('Step 1: Adding slug column (varchar(255), nullable)...');
    await db.execute(sql`
      ALTER TABLE recipes
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255)
    `);
    console.log('✓ Slug column added successfully\n');

    // Step 2: Add index on slug column
    console.log('Step 2: Adding index on slug column...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_recipes_slug ON recipes(slug)
    `);
    console.log('✓ Index created successfully\n');

    // Step 3: Add unique constraint on slug column
    console.log('Step 3: Adding unique constraint on slug column...');
    await db.execute(sql`
      ALTER TABLE recipes
      ADD CONSTRAINT recipes_slug_unique UNIQUE (slug)
    `);
    console.log('✓ Unique constraint added successfully\n');

    console.log('✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run generate-recipe-slugs.ts to populate slugs for existing recipes');
    console.log('2. Verify slug generation with test-recipe-slugs.ts');
    console.log('3. Update application code to use slug-based URLs\n');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);

    // Check if error is due to duplicate constraint
    if (error.message?.includes('already exists') || error.message?.includes('duplicate key')) {
      console.log('\nℹ️  Note: Constraint/index may already exist. This is safe to ignore.');
      console.log('Migration state: Partially complete or already applied.\n');
    } else {
      console.error('\nError details:', error);
      process.exit(1);
    }
  }
}

// Rollback function (for manual use if needed)
async function rollbackMigration() {
  console.log('Starting rollback: Remove slug column from recipes table...\n');

  try {
    // Remove unique constraint
    console.log('Step 1: Removing unique constraint...');
    await db.execute(sql`
      ALTER TABLE recipes
      DROP CONSTRAINT IF EXISTS recipes_slug_unique
    `);
    console.log('✓ Unique constraint removed\n');

    // Remove index
    console.log('Step 2: Removing index...');
    await db.execute(sql`
      DROP INDEX IF EXISTS idx_recipes_slug
    `);
    console.log('✓ Index removed\n');

    // Remove column
    console.log('Step 3: Removing slug column...');
    await db.execute(sql`
      ALTER TABLE recipes
      DROP COLUMN IF EXISTS slug
    `);
    console.log('✓ Slug column removed\n');

    console.log('✅ Rollback completed successfully!\n');
  } catch (error: any) {
    console.error('❌ Rollback failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Check if running in rollback mode
const isRollback = process.argv.includes('--rollback');

if (isRollback) {
  console.log('⚠️  ROLLBACK MODE ENABLED\n');
  rollbackMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
