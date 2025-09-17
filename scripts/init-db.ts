import { db } from '../src/lib/db';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import path from 'path';

async function initDatabase() {
  console.log('Initializing database...');

  try {
    // Run migrations
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'drizzle'),
    });

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();