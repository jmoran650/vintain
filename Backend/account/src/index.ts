import "reflect-metadata";
import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { AccountResolver } from "./graphql/resolver";
import { pool } from "./db";
import { buildSchema } from "type-graphql";

export async function createSchema() {
  return await buildSchema({
    resolvers: [AccountResolver],
  });
}

export async function createApp() {
  // Test database connection
  const client = await pool.connect();
  const res = await client.query("SELECT NOW()");
  client.release();
  console.log("Connected to database, current time:", res.rows[0].now);

  const schema = await createSchema();

  const app = express();
  app.all("/graphql", createHandler({ schema }));

  console.log("App has been created but not listening yet.");
  return app;
}