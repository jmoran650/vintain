// Backend/index.ts

import dotenv from "dotenv";
import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { Pool } from "pg";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
dotenv.config();

// Import all resolvers
import { AccountResolver } from "./src/account/graphql/resolver";
import { AuthResolver } from "./src/auth/graphql/resolver";
import { ListingResolver } from "./src/listing/graphql/resolver";
import { MessageResolver } from "./src/message/graphql/resolver";

// Create a single database pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Builds the GraphQL schema using all resolvers.
 */
async function createSchema() {
  return await buildSchema({
    resolvers: [
      AuthResolver,
      AccountResolver,
      ListingResolver,
      MessageResolver,
    ],
  });
}

/**
 * Creates and configures the Express app, but does NOT call `app.listen()`.
 * This lets us import it in tests or run it from CLI.
 */
export async function createApp() {
  // Optionally test database connection
  const client = await pool.connect();
  const res = await client.query("SELECT NOW()");
  client.release();
  console.log("Connected to database, current time:", res.rows[0].now);

  // Build the schema
  const schema = await createSchema();

  // Create the Express server
  const app = express();

  // Add the GraphQL endpoint
  app.all(
    "/graphql",
    createHandler({
      schema,
    })
  );

  return app;
}

/**
 * If this file is run directly from the command line,
 * start the server on port 4000.
 * This check (require.main === module) means:
 *   "are we running `node index.js`/`ts-node index.ts` directly?"
 */
if (require.main === module) {
  createApp()
    .then((app) => {
      app.listen(4000, () => {
        console.log(
          "Running a GraphQL API server at http://localhost:4000/graphql"
        );
      });
    })
    .catch((err) => {
      console.error("Failed to start server", err);
    });
}
