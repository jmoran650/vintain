// Backend/index.ts

import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { createHandler } from "graphql-http/lib/use/express";
import { Pool } from "pg";
import "reflect-metadata";
import { buildSchema, AuthChecker } from "type-graphql";
import * as jwt from "jsonwebtoken";
dotenv.config();

// Import all resolvers
import { AccountResolver } from "./src/account/graphql/resolver";
import { AuthResolver } from "./src/auth/graphql/resolver";
import { ListingResolver } from "./src/listing/graphql/resolver";
import { MessageResolver } from "./src/message/graphql/resolver";
import { OrderResolver } from "./src/orders/graphql/resolver";

// Create a single database pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Global auth checker for TypeGraphQL.
 * If the request query contains login or makeAccount, authentication is skipped.
 * Otherwise, the token is extracted from the Authorization header and verified.
 */
const customAuthChecker: AuthChecker<any> = ({ context }, roles) => {
  if (context.req.body && typeof context.req.body.query === "string") {
    if (/(\blogin\b)|(\bmakeAccount\b)/i.test(context.req.body.query)) {
      return true;
    }
  }
  const authHeader = context.req.headers.authorization;
  if (!authHeader) {
    return false;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.MASTER_SECRET as string) as { id: string };
    // Optionally attach the user id to the context
    context.userId = decoded.id;
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Builds the GraphQL schema using all resolvers and our custom authChecker.
 */
async function createSchema() {
  return await buildSchema({
    resolvers: [AuthResolver, AccountResolver, ListingResolver, MessageResolver, OrderResolver],
    authChecker: customAuthChecker,
  });
}

/**
 * Creates and configures the Express app.
 * Sets secure headers, parses JSON bodies, enforces global authentication (except on public operations),
 * and mounts the GraphQL endpoint.
 */
export async function createApp() {
  // Test database connection
  const client = await pool.connect();
  const res = await client.query("SELECT NOW()");
  client.release();
  console.log("Connected to database, current time:", res.rows[0].now);

  // Build the schema
  const schema = await createSchema();

  // Create the Express app
  const app = express();

  // Set secure HTTP headers with Helmet
  app.use(helmet());

  // Parse incoming JSON bodies
  app.use(express.json());

  // Custom authentication middleware for /graphql:
  // Allow login and makeAccount operations even without a token.
  app.use(
    "/graphql",
    ((req: Request, res: Response, next: NextFunction): void | Response => {
      if (req.body && typeof req.body.query === "string") {
        if (/(\blogin\b)|(\bmakeAccount\b)/i.test(req.body.query)) {
          return next();
        }
      }
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ errors: [{ message: "Not authenticated" }] });
      }
      const token = authHeader.split(" ")[1];
      try {
        jwt.verify(token, process.env.MASTER_SECRET as string);
        next();
      } catch (err) {
        return res.status(401).json({ errors: [{ message: "Invalid token" }] });
      }
    }) as express.RequestHandler
  );

  // Mount the GraphQL endpoint
  app.all(
    "/graphql",
    createHandler({
      schema,
    })
  );

  return app;
}

/**
 * If this file is run directly, start the server on port 4000.
 */
if (require.main === module) {
  createApp()
    .then((app) => {
      app.listen(4000, () => {
        console.log("Running a GraphQL API server at http://localhost:4000/graphql");
      });
    })
    .catch((err) => {
      console.error("Failed to start server", err);
    });
}