import "reflect-metadata";
import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { createSchema } from "./graphql/schema";
import { pool } from "./db";

async function main() {
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
      // rootValue is not needed if you're using resolvers defined by type-graphql.
      // The `hello` query is provided by your HelloResolver.
    })
  );

  app.listen(4000);
  console.log("Running a GraphQL API server at http://localhost:4000/graphql");
}

main().catch((err) => {
  console.error("Failed to start server", err);
});