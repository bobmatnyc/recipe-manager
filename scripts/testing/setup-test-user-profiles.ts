#!/usr/bin/env tsx

/**
 * Setup Test User Profiles
 *
 * Creates user_profiles database records for E2E test users.
 * This script should be run after creating test users in Clerk Dashboard.
 *
 * Usage:
 *   pnpm tsx scripts/testing/setup-test-user-profiles.ts
 *
 * Prerequisites:
 *   - Test users created in Clerk
 *   - TEST_USER_EMAIL in .env.local
 *   - DATABASE_URL configured
 *
 * What this script does:
 *   1. Reads test user emails from environment
 *   2. Fetches Clerk user IDs from Clerk API
 *   3. Creates user_profiles records if they don't exist
 *   4. Optionally seeds initial test data (collections, favorites)
 */

import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/db/user-discovery-schema';
import { eq } from 'drizzle-orm';

interface TestUserConfig {
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  isAdmin?: boolean;
}

const TEST_USERS: TestUserConfig[] = [
  {
    email: process.env.TEST_USER_EMAIL || '',
    username: 'testuser1',
    displayName: 'Test User One',
    bio: 'Primary E2E test user account for automated testing',
  },
  {
    email: process.env.TEST_USER_2_EMAIL || '',
    username: 'testuser2',
    displayName: 'Test User Two',
    bio: 'Secondary E2E test user for parallel testing',
  },
  {
    email: process.env.TEST_ADMIN_EMAIL || '',
    username: 'testadmin',
    displayName: 'Test Admin',
    bio: 'Admin test user for testing administrative features',
    isAdmin: true,
  },
];

async function setupTestUserProfiles() {
  console.log('🚀 Starting test user profile setup...\n');

  const client = await clerkClient();
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const testUser of TEST_USERS) {
    if (!testUser.email) {
      console.log(`⏭️  Skipping user (no email configured): ${testUser.username}`);
      skipCount++;
      continue;
    }

    try {
      console.log(`\n📧 Processing: ${testUser.email}`);

      // 1. Find user in Clerk by email
      console.log('   Fetching Clerk user...');
      const clerkUsers = await client.users.getUserList({
        emailAddress: [testUser.email],
      });

      if (!clerkUsers.data || clerkUsers.data.length === 0) {
        console.log('   ❌ User not found in Clerk');
        console.log(
          `   → Create this user in Clerk Dashboard first: ${testUser.email}`
        );
        errorCount++;
        continue;
      }

      const clerkUser = clerkUsers.data[0];
      const clerkUserId = clerkUser.id;
      console.log(`   ✓ Found Clerk user (ID: ${clerkUserId})`);

      // 2. Check if user_profile already exists
      console.log('   Checking database...');
      const existingProfile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.user_id, clerkUserId))
        .limit(1);

      if (existingProfile.length > 0) {
        console.log(`   ✓ Profile already exists`);
        console.log(`      Username: ${existingProfile[0].username}`);
        console.log(`      Display Name: ${existingProfile[0].display_name}`);
        skipCount++;
        continue;
      }

      // 3. Create user_profile
      console.log('   Creating user profile...');
      const newProfile = await db
        .insert(userProfiles)
        .values({
          user_id: clerkUserId,
          username: testUser.username,
          display_name: testUser.displayName,
          bio: testUser.bio || null,
          is_public: true,
        })
        .returning();

      console.log(`   ✅ Created profile successfully`);
      console.log(`      Profile ID: ${newProfile[0].id}`);
      console.log(`      Username: ${newProfile[0].username}`);
      console.log(`      Display Name: ${newProfile[0].display_name}`);

      successCount++;
    } catch (error) {
      console.error(`   ❌ Error processing ${testUser.email}:`, error);
      errorCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Setup Summary');
  console.log('='.repeat(60));
  console.log(`✅ Created: ${successCount}`);
  console.log(`⏭️  Skipped (already exists): ${skipCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('='.repeat(60));

  if (successCount > 0) {
    console.log('\n✨ Test user profiles are ready for E2E testing!');
    console.log('\nNext steps:');
    console.log('  1. Verify setup: pnpm test:verify-auth');
    console.log('  2. Run E2E tests: pnpm test:e2e');
  }

  if (errorCount > 0) {
    console.log('\n⚠️  Some users failed to set up.');
    console.log('Check errors above and ensure:');
    console.log('  - Users exist in Clerk Dashboard');
    console.log('  - Email addresses match .env.local');
    console.log('  - Database connection is working');
    process.exit(1);
  }
}

// Run the script
setupTestUserProfiles()
  .then(() => {
    console.log('\n✓ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
