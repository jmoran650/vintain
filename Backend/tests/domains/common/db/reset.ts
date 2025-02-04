// tests/domains/common/db/reset.ts

import { pool } from "../../../../db";
import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function runSqlFile(filePath: string): Promise<void> {
  const content = fs.readFileSync(filePath, "utf8");
  await pool.query(content);
  console.log(`Executed SQL file: ${filePath}`);
}

/**
 * Resets the entire test database using the global fixtures.
 */
export async function resetGlobal(): Promise<void> {
  const fixturesPath = path.join(__dirname, "..", "..", "..", "fixtures");
  const schemaFile = path.join(fixturesPath, "schema.sql");
  const dataFile = path.join(fixturesPath, "data.sql");

  if (fs.existsSync(schemaFile)) {
    await runSqlFile(schemaFile);
  } else {
    throw new Error(`Global schema file not found at: ${schemaFile}`);
  }

  if (fs.existsSync(dataFile)) {
    await runSqlFile(dataFile);
  } else {
    throw new Error(`Global data file not found at: ${dataFile}`);
  }
}

/**
 * Shut down the pool entirely.
 */
export function shutdown(done: Function): void {
  pool.end(() => done());
}