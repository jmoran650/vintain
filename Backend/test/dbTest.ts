import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // points to your test DB
});

/**
 * Helper to run any .sql file from a specific path.
 */
async function runSqlFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  await pool.query(content);
  console.log(`Executed SQL file: ${filePath}`);
}

/**
 * Each domain can have its own subfolder or .sql files, and we can run them in sequence.
 */
export async function resetForDomain(domain: string): Promise<void> {
  // Example: run domain’s schema + data if they exist
  const domainPath = path.join(__dirname, domain, 'testdata'); 
  const schemaFile = path.join(domainPath, 'schema.sql');
  const dataFile = path.join(domainPath, 'data.sql');

  // If domain has a schema.sql, run it
  if (fs.existsSync(schemaFile)) {
    await runSqlFile(schemaFile);
  }
  // If domain has a data.sql, run it
  if (fs.existsSync(dataFile)) {
    await runSqlFile(dataFile);
  }
}

/**
 * Optionally, run a global schema/data if you want to seed common tables first
 */
export async function resetGlobal(): Promise<void> {
  // If you have a top-level testdata folder
  const globalPath = path.join(__dirname, 'testdata');
  const schemaFile = path.join(globalPath, 'schema.sql');
  const dataFile = path.join(globalPath, 'data.sql');

  if (fs.existsSync(schemaFile)) {
    await runSqlFile(schemaFile);
  }
  if (fs.existsSync(dataFile)) {
    await runSqlFile(dataFile);
  }
}

/**
 * Shut down the pool entirely.
 */
export function shutdown(done: Function) {
  pool.end(() => {
    done();
  });
}