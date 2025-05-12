import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const run = async () => {
  try {
    console.log('Running database push...');
    
    // Connect to the database
    const db = drizzle(pool);
    
    // Apply the schema changes
    await pool.query(`
      -- Create enums
      DO $$ BEGIN
        CREATE TYPE challenge_frequency AS ENUM ('daily', 'weekly', 'monthly');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE challenge_status AS ENUM ('active', 'completed', 'abandoned');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE challenge_type AS ENUM ('emotions', 'meditation', 'journaling', 'activity', 'custom');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE emotion_intensity AS ENUM ('very_low', 'low', 'medium', 'high', 'very_high');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      -- Create new tables
      CREATE TABLE IF NOT EXISTS emotion_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        color VARCHAR(7),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS emotions (
        id SERIAL PRIMARY KEY,
        category_id INTEGER NOT NULL,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS user_emotions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS wellness_challenges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        type challenge_type NOT NULL,
        frequency challenge_frequency NOT NULL DEFAULT 'daily',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        target_value INTEGER NOT NULL DEFAULT 1,
        status challenge_status NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS wellness_challenge_goals (
        id SERIAL PRIMARY KEY,
        challenge_id INTEGER NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        target_value INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS wellness_challenge_progress (
        id SERIAL PRIMARY KEY,
        challenge_id INTEGER NOT NULL,
        date DATE NOT NULL,
        value INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Database push complete!');
  } catch (error) {
    console.error('Error during database push:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

run();