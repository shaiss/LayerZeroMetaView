import { db } from './db';
import { deployments } from '@shared/schema';
import { sql } from 'drizzle-orm';
import { pgTable, serial, text, jsonb, integer, boolean } from 'drizzle-orm/pg-core';

async function migrate() {
  console.log('Running database migrations...');
  
  try {
    // Drop tables if they exist (for clean migration during development)
    await db.execute(sql`DROP TABLE IF EXISTS deployments`);
    await db.execute(sql`DROP TABLE IF EXISTS users`);
    console.log('Dropped existing tables');
    
    // Create users table with proper schema
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);
    console.log('Users table created');
    
    // Create deployments table with proper schema
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS deployments (
        id SERIAL PRIMARY KEY,
        chain_key TEXT NOT NULL,
        eid TEXT NOT NULL,
        stage TEXT NOT NULL,
        endpoint JSONB NOT NULL,
        relayer_v2 JSONB,
        ultra_light_node_v2 JSONB,
        send_uln_301 JSONB,
        receive_uln_301 JSONB,
        nonce_contract JSONB,
        version INTEGER NOT NULL,
        timestamp TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        raw_data JSONB NOT NULL
      )
    `);
    console.log('Deployments table created');
    
    // Create a composite index for faster lookup
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_deployment_chain_eid_stage 
      ON deployments (chain_key, eid, stage)
    `);
    console.log('Created deployment index');
    
    console.log('Migration completed successfully');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error; // Re-throw to ensure the caller knows migration failed
  }
}

// ES modules don't have require.main, removing this code since we'll call the function explicitly
export default migrate;