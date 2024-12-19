//listing/src/db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
import * as fs from 'fs';
import * as path from 'path';


if(!process.env.DATABASE_URL){
    console.log("dotenv error in account/src/test/db.ts")
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const run = async (file: string) => {
    // Use __dirname to build an absolute path
    const filePath = path.join(__dirname, 'testdata', file);
    const content = fs.readFileSync(filePath, 'utf8');
    await pool.query(content);
    console.log(`Executed ${filePath} successfully`);
  };
  
  const reset = async () => {
    await run('schema.sql');
    await run('data.sql');
  };
  
  // eslint-disable-next-line @typescript-eslint/ban-types
  const shutdown = (done: Function) => {
    pool.end(() => {
      done();
    });
  };


  export { reset, shutdown}