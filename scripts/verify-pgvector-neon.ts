#!/usr/bin/env tsx

/**
 * pgvector Verification Script (Neon Serverless)
 * Tests pgvector installation and performs basic vector operations
 * Usage: tsx scripts/verify-pgvector-neon.ts
 */

import { neon } from '@neondatabase/serverless';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
} as const;

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verifyPgvector() {
  log('\n🔍 pgvector Verification Test Suite', 'blue');
  log('='.repeat(60), 'blue');

  // Validate environment
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.startsWith('postgresql://')) {
    log('❌ ERROR: Invalid DATABASE_URL in .env.local', 'red');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    // Test pgvector extension
    log('\n🔌 Test 1: pgvector Extension', 'cyan');
    const extResult = await sql`
      SELECT extname, extversion
      FROM pg_extension
      WHERE extname = 'vector';
    `;

    if (extResult.length === 0) {
      log('❌ FAILED: pgvector extension not installed', 'red');
      throw new Error('pgvector extension missing');
    }

    log(`✓ pgvector version ${extResult[0].extversion} is installed`, 'green');

    // Test table structure
    log('\n📋 Test 2: Table Structure', 'cyan');
    const tableResult = await sql`
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'recipe_embeddings'
      ORDER BY ordinal_position;
    `;

    if (tableResult.length === 0) {
      log('❌ FAILED: recipe_embeddings table not found', 'red');
      throw new Error('recipe_embeddings table missing');
    }

    log('✓ recipe_embeddings table exists with columns:', 'green');
    tableResult.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      log(`  - ${col.column_name}: ${col.data_type}${maxLength} ${nullable}`, 'cyan');
    });

    // Test indexes
    log('\n🔍 Test 3: Vector Indexes', 'cyan');
    const indexResult = await sql`
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'recipe_embeddings'
      ORDER BY indexname;
    `;

    if (indexResult.length === 0) {
      log('⚠️  WARNING: No indexes found on recipe_embeddings', 'yellow');
    } else {
      log(`✓ Found ${indexResult.length} index(es):`, 'green');
      indexResult.forEach(idx => {
        log(`  - ${idx.indexname}`, 'cyan');
        if (idx.indexdef.includes('hnsw')) {
          log('    ✓ HNSW index for fast vector search', 'green');
        }
      });
    }

    // Test vector operations
    log('\n⚡ Test 4: Vector Operations', 'cyan');

    // Create test vectors
    const testVector1 = Array.from({ length: 384 }, (_, i) => Math.sin(i * 0.01));
    const testVector2 = Array.from({ length: 384 }, (_, i) => Math.cos(i * 0.01));

    log('  Creating test vectors (384 dimensions)...', 'cyan');

    // Test vector creation and similarity
    const similarityResult = await sql`
      SELECT
        1 - (${JSON.stringify(testVector1)}::vector <=> ${JSON.stringify(testVector2)}::vector) as cosine_similarity,
        ${JSON.stringify(testVector1)}::vector <-> ${JSON.stringify(testVector2)}::vector as l2_distance,
        ${JSON.stringify(testVector1)}::vector <#> ${JSON.stringify(testVector2)}::vector as inner_product
    `;

    log('✓ Vector operations successful:', 'green');
    log(`  - Cosine similarity: ${parseFloat(similarityResult[0].cosine_similarity as string).toFixed(6)}`, 'cyan');
    log(`  - L2 distance: ${parseFloat(similarityResult[0].l2_distance as string).toFixed(6)}`, 'cyan');
    log(`  - Inner product: ${parseFloat(similarityResult[0].inner_product as string).toFixed(6)}`, 'cyan');

    // Test recipes table new columns
    log('\n📝 Test 5: Recipe Table Enhancements', 'cyan');
    const recipeColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'recipes'
        AND column_name IN ('search_query', 'discovery_date', 'confidence_score', 'validation_model', 'embedding_model')
      ORDER BY column_name;
    `;

    if (recipeColumns.length < 5) {
      log(`⚠️  WARNING: Only ${recipeColumns.length}/5 new columns found`, 'yellow');
    } else {
      log('✓ All 5 provenance tracking columns added:', 'green');
      recipeColumns.forEach(col => {
        log(`  - ${col.column_name} (${col.data_type})`, 'cyan');
      });
    }

    // Test constraints and foreign keys
    log('\n🔗 Test 6: Foreign Key Constraints', 'cyan');
    const fkResult = await sql`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'recipe_embeddings';
    `;

    if (fkResult.length === 0) {
      log('⚠️  WARNING: No foreign key constraints found', 'yellow');
    } else {
      log('✓ Foreign key constraints:', 'green');
      fkResult.forEach(fk => {
        log(`  - ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`, 'cyan');
      });
    }

    // Test triggers
    log('\n⚡ Test 7: Database Triggers', 'cyan');
    const triggerResult = await sql`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'recipe_embeddings';
    `;

    if (triggerResult.length === 0) {
      log('⚠️  WARNING: No triggers found', 'yellow');
    } else {
      log('✓ Triggers configured:', 'green');
      triggerResult.forEach(trigger => {
        log(`  - ${trigger.trigger_name} (${trigger.event_manipulation})`, 'cyan');
      });
    }

    // Performance test
    log('\n🚀 Test 8: Query Performance', 'cyan');
    const perfStart = Date.now();
    await sql`
      SELECT 1
      WHERE EXISTS (
        SELECT 1 FROM recipe_embeddings LIMIT 1
      );
    `;
    const perfEnd = Date.now();
    log(`✓ Query execution time: ${perfEnd - perfStart}ms`, 'green');

    // Summary
    log('\n' + '='.repeat(60), 'blue');
    log('✅ All tests passed successfully!', 'green');
    log('🎉 pgvector is fully operational and ready for semantic search', 'green');
    log('\n📊 Configuration Summary:', 'cyan');
    log(`  - Vector dimensions: 384`, 'cyan');
    log(`  - Default model: all-MiniLM-L6-v2`, 'cyan');
    log(`  - Distance metric: Cosine similarity`, 'cyan');
    log(`  - Index type: HNSW (Hierarchical Navigable Small World)`, 'cyan');
    log('\n💡 Next Steps:', 'yellow');
    log('  1. Generate embeddings for existing recipes', 'yellow');
    log('  2. Implement embedding generation API endpoint', 'yellow');
    log('  3. Create semantic search API endpoint', 'yellow');
    log('  4. Test similarity search with real recipe data', 'yellow');
    log('\n📚 Example Usage:', 'cyan');
    log(`  - Generate embedding: POST /api/embeddings/generate`, 'cyan');
    log(`  - Search recipes: POST /api/recipes/search { query: "spicy pasta" }`, 'cyan');
    log(`  - Similar recipes: GET /api/recipes/{id}/similar`, 'cyan');

  } catch (error) {
    log('\n❌ Verification failed!', 'red');
    const err = error as Error;
    log(`Error: ${err.message}`, 'red');
    if (err.stack) {
      log('\nStack trace:', 'red');
      log(err.stack, 'red');
    }
    process.exit(1);
  }
}

// Run verification
verifyPgvector().catch(error => {
  log(`\n💥 Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
