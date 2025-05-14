/**
 * Migration script for crisis events table
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function migrateDatabase() {
  try {
    console.log('Starting database migration for crisis events...');
    
    // Connect to the database
    const connectionString = process.env.DATABASE_URL;
    const sql = postgres(connectionString, { max: 1 });
    const db = drizzle(sql);
    
    // Create the crisis_intensity enum if it doesn't exist
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crisis_intensity') THEN
          CREATE TYPE crisis_intensity AS ENUM ('mild', 'moderate', 'severe', 'extreme');
        END IF;
      END
      $$;
    `;
    
    // Create the crisis_type enum if it doesn't exist
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crisis_type') THEN
          CREATE TYPE crisis_type AS ENUM ('panic_attack', 'emotional_crisis', 'suicidal_thoughts', 'self_harm_urge', 'substance_urge', 'other');
        END IF;
      END
      $$;
    `;
    
    // Create the crisis_events table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS crisis_events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type crisis_type NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(8),
        intensity crisis_intensity NOT NULL,
        duration INTEGER,
        notes TEXT,
        symptoms JSONB,
        triggers JSONB,
        coping_strategies_used JSONB,
        coping_strategy_effectiveness INTEGER,
        help_sought BOOLEAN NOT NULL DEFAULT FALSE,
        medication BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    
    console.log('Migration completed successfully.');
    
    // Close the connection
    await sql.end();
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateDatabase();