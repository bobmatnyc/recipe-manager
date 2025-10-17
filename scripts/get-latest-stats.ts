#!/usr/bin/env tsx

import { sql } from 'drizzle-orm';
import { db } from '../src/lib/db';

async function getLatestStats() {
  try {
    // Get the count from the original console output visible in timeout
    // We saw it processing recipe [763/1000] when it timed out

    // Check current database state
    const result = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE source LIKE '%food.com%') as total_foodcom,
        COUNT(*) FILTER (WHERE source LIKE '%food.com%' AND created_at > NOW() - INTERVAL '15 minutes') as last_15min,
        COUNT(*) FILTER (WHERE user_id = 'system_imported') as system_imported_total,
        MIN(created_at) FILTER (WHERE source LIKE '%food.com%' AND created_at > NOW() - INTERVAL '15 minutes') as first_recent,
        MAX(created_at) FILTER (WHERE source LIKE '%food.com%' AND created_at > NOW() - INTERVAL '15 minutes') as last_recent
      FROM recipes
    `);

    const stats = result.rows[0] as any;

    console.log('\n📊 CURRENT DATABASE STATE');
    console.log('='.repeat(70));
    console.log(`Total Food.com recipes: ${stats.total_foodcom}`);
    console.log(`Added in last 15 min: ${stats.last_15min}`);
    console.log(`System imported total: ${stats.system_imported_total}`);

    if (stats.first_recent && stats.last_recent) {
      const start = new Date(stats.first_recent);
      const end = new Date(stats.last_recent);
      const duration = (end.getTime() - start.getTime()) / 1000;

      console.log(`\nIngestion window: ${start.toISOString()} to ${end.toISOString()}`);
      console.log(`Duration: ${(duration / 60).toFixed(2)} minutes`);
      console.log(`Rate: ${(stats.last_15min / duration).toFixed(2)} recipes/second`);
    }

    console.log('='.repeat(70));
  } catch (error: any) {
    console.error('Error:', error.message);
    throw error;
  }
}

getLatestStats()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
