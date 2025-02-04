// tests/dbTest.ts

import { Pool } from "pg";
import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // points to your test DB
});

export async function resetGlobal(): Promise<void> {
  const fixturesPath = path.join(__dirname, "fixtures");
  const schemaFile = path.join(fixturesPath, "schema.sql");
  const dataFile = path.join(fixturesPath, "data.sql");

  if (fs.existsSync(schemaFile)) {
    const schema = fs.readFileSync(schemaFile, "utf8");
    await pool.query(schema);
    console.log(`Executed global schema file: ${schemaFile}`);
  } else {
    throw new Error(`Global schema file not found at: ${schemaFile}`);
  }

  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, "utf8");
    await pool.query(data);
    console.log(`Executed global data file: ${dataFile}`);
  } else {
    throw new Error(`Global data file not found at: ${dataFile}`);
  }
}

export function shutdown(done: Function): void {
  pool.end(() => {
    done();
  });
}