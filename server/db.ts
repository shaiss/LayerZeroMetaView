import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

// Get the DATABASE_URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

// Configure neon
neonConfig.fetchConnectionCache = true;

// Create a connection factory
const sql = neon(DATABASE_URL);

// Create a Drizzle client
export const db = drizzle(sql, { schema });

export async function initializeDatabase() {
  try {
    // Test database connection
    const result = await db.select().from(schema.deployments).limit(1);
    console.log("Database connection successful");
    
    // Create database schema if not exists (this will run the first time only)
    const tableExists = result.length > 0;
    if (!tableExists) {
      console.log("Creating database schema...");
      // No need to create schema manually, Drizzle ORM will handle it when we insert data
    }
    
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}