import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon to use WebSockets
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Drop all tables if they exist
    await client.query(`
      DROP TABLE IF EXISTS habit_completions CASCADE;
      DROP TABLE IF EXISTS habits CASCADE;
      DROP TABLE IF EXISTS daily_goals CASCADE;
      DROP TABLE IF EXISTS dbt_sleep CASCADE;
      DROP TABLE IF EXISTS dbt_emotions CASCADE;
      DROP TABLE IF EXISTS dbt_urges CASCADE;
      DROP TABLE IF EXISTS dbt_skills CASCADE;
      DROP TABLE IF EXISTS dbt_events CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    
    console.log('All tables dropped successfully');
    
    await client.query('COMMIT');
    console.log('Database reset complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error resetting database:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();