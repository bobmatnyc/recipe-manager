/**
 * Migration: Add instruction_metadata column to recipes table
 *
 * Adds JSONB column for storing AI-generated instruction classifications
 * including work types, techniques, tools, time estimates, and more.
 *
 * Run with: pnpm tsx scripts/migrations/add-instruction-metadata-column.ts
 */

import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function addInstructionMetadataColumn() {
  console.log('🚀 Starting instruction metadata migration...\n');

  try {
    // Add columns
    console.log('📝 Adding instruction_metadata columns...');
    await db.execute(sql`
      ALTER TABLE recipes
      ADD COLUMN IF NOT EXISTS instruction_metadata JSONB,
      ADD COLUMN IF NOT EXISTS instruction_metadata_version VARCHAR(20) DEFAULT '1.0.0',
      ADD COLUMN IF NOT EXISTS instruction_metadata_generated_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS instruction_metadata_model VARCHAR(100);
    `);

    console.log('✅ Columns added successfully\n');

    // Create indexes
    console.log('📝 Creating indexes...');

    // GIN index for JSONB queries (efficient for @> and ? operators)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_recipes_instruction_metadata
      ON recipes USING GIN (instruction_metadata);
    `);

    // Partial index for recipes WITH classifications
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_recipes_has_instruction_metadata
      ON recipes (instruction_metadata)
      WHERE instruction_metadata IS NOT NULL;
    `);

    // Index for classification version
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_recipes_instruction_version
      ON recipes (instruction_metadata_version)
      WHERE instruction_metadata_version IS NOT NULL;
    `);

    console.log('✅ Indexes created successfully\n');

    // Verify migration
    console.log('🔍 Verifying migration...');
    const result = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'recipes'
      AND column_name LIKE 'instruction_metadata%'
      ORDER BY column_name;
    `);

    console.log('📊 Columns created:');
    result.rows.forEach((row: any) => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
    console.log('');

    // Check index creation
    const indexes = await db.execute(sql`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'recipes'
      AND indexname LIKE '%instruction_metadata%'
      ORDER BY indexname;
    `);

    console.log('📊 Indexes created:');
    indexes.rows.forEach((row: any) => {
      console.log(`   - ${row.indexname}`);
    });
    console.log('');

    console.log('✅ Migration complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: pnpm tsx scripts/test-instruction-classification.ts');
    console.log('2. Classify sample recipes to verify system');
    console.log('3. Begin batch processing with: pnpm tsx scripts/classify-all-recipes.ts');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
addInstructionMetadataColumn()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed with error:', error);
    process.exit(1);
  });
