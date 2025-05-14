/**
 * Migration script for adding RBAC and therapist-client relationships
 * 
 * This script adds the following:
 * 1. user_role enum
 * 2. role column to users table
 * 3. therapist_clients table
 * 4. therapist_notes table
 * 5. treatment_plans table
 */

import { db } from './server/db.ts';
import { users, userRoleEnum } from './shared/schema.ts';
import { eq, sql } from 'drizzle-orm';

async function migrateDatabase() {
  console.log('Starting RBAC migration...');

  try {
    // Create the user_role enum if it doesn't exist
    console.log('Creating user_role enum...');
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('client', 'therapist', 'admin');
        END IF;
      END
      $$;
    `);
    console.log('user_role enum created successfully.');

    // Check if the role column exists in the users table
    const roleColumnExists = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'role';
    `);

    // Add role column to users table if it doesn't exist
    if (roleColumnExists.rowCount === 0) {
      console.log('Adding role column to users table...');
      await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN role user_role NOT NULL DEFAULT 'client';
      `);
      console.log('Role column added successfully.');
    } else {
      console.log('Role column already exists in users table.');
    }

    // Create the therapist_clients table if it doesn't exist
    console.log('Creating therapist_clients table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS therapist_clients (
        id SERIAL PRIMARY KEY,
        therapist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        start_date DATE NOT NULL DEFAULT CURRENT_DATE,
        end_date DATE,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(therapist_id, client_id, status)
      );
    `);
    console.log('therapist_clients table created successfully.');

    // Create the therapist_notes table if it doesn't exist
    console.log('Creating therapist_notes table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS therapist_notes (
        id SERIAL PRIMARY KEY,
        therapist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_date DATE NOT NULL,
        content TEXT NOT NULL,
        mood VARCHAR(50),
        progress VARCHAR(50),
        goal_completion INTEGER,
        is_private BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('therapist_notes table created successfully.');

    // Create the treatment_plans table if it doesn't exist
    console.log('Creating treatment_plans table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS treatment_plans (
        id SERIAL PRIMARY KEY,
        therapist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        end_date DATE,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        goals JSONB,
        assessments JSONB,
        interventions JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('treatment_plans table created successfully.');

    // Set the first user to be an admin (if any users exist)
    const allUsers = await db.select().from(users);
    if (allUsers.length > 0) {
      console.log('Setting the first user as admin...');
      await db.update(users)
        .set({ role: 'admin' })
        .where(eq(users.id, allUsers[0].id));
      console.log(`User ${allUsers[0].username} set as admin.`);
    }

    console.log('RBAC migration completed successfully.');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Run the migration
migrateDatabase()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });