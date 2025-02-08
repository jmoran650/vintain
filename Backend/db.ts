import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

if(process.env.DATABASE_URL){

  console.log("database url visible to db.ts");

}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });