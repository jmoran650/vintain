import "reflect-metadata";
import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import {AuthResolver} from "./graphql/resolver"
import { pool } from "./db";
import {buildSchema} from "type-graphql";


export async function createSchema() {
  return await buildSchema({
    resolvers: [AuthResolver],
  });
}
async function app() {
  // Optionally test the database connection:
  const client = await pool.connect();
  const res = await client.query("SELECT NOW()");
  client.release();
  console.log("Connected to database, current time:", res.rows[0].now);

  const schema = await createSchema();

  const app = express();

  app.all(
    "/graphql",
    createHandler({
      schema: schema,
    })
  );

  app.listen(4000);
  console.log("Running a GraphQL API server at http://localhost:4000/graphql");
}

app().catch((err) => {
  console.error("Failed to start server", err);
});

export { app }