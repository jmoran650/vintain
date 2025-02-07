// src/index.ts
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { createHandler } from "graphql-http/lib/use/express";
import { Pool } from "pg";
import "reflect-metadata";
import { buildSchema, AuthChecker } from "type-graphql";
import * as jwt from "jsonwebtoken";
import { Container } from "typedi";

// Import AWS SDK (v2 in this example)
import AWS from "aws-sdk";

dotenv.config();

import { AccountResolver } from "./src/account/graphql/resolver";
import { AuthResolver } from "./src/auth/graphql/resolver";
import { ListingResolver } from "./src/listing/graphql/resolver";
import { MessageResolver } from "./src/message/graphql/resolver";
import { OrderResolver } from "./src/orders/graphql/resolver";
import { S3Resolver } from "./src/s3/graphql/resolver";

// Use a single database pool instance
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


/**
 * Global auth checker for TypeGraphQL.
 * Public operations like login and makeAccount bypass authentication.
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
    context.userId = decoded.id;
    return true;
  } catch (err) {
    return false;
  }
};

async function createSchema() {
  return await buildSchema({
    resolvers: [
      AuthResolver,
      AccountResolver,
      ListingResolver,
      MessageResolver,
      OrderResolver,
      S3Resolver,
    ],
    authChecker: customAuthChecker,
    container: Container,
  });
}

/**
 * Ping the S3 bucket by calling headBucket.
 */
async function pingS3(): Promise<void> {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION!,
  });
  try {
    // headBucket checks that the bucket exists and that the credentials are valid.
    await s3.headBucket({ Bucket: process.env.AWS_S3_BUCKET! }).promise();
    console.log("Successfully connected to S3 bucket:", process.env.AWS_S3_BUCKET);
  } catch (error) {
    console.error("Error connecting to S3 bucket:", error);
    throw error;
  }
}

export async function createApp() {
  // Test database connection
  const client = await pool.connect();
  const res = await client.query("SELECT NOW()");
  client.release();
  console.log("Connected to database, current time:", res.rows[0].now);

  // Ping S3 to ensure connectivity before starting
  await pingS3();

  // Build the GraphQL schema
  const schema = await createSchema();

  const app = express();

  app.use(helmet());
  app.use(express.json());

  // Mount the GraphQL endpoint (auth is handled via TypeGraphQL)
  app.all(
    "/graphql",
    createHandler({
      schema,
      context: (req) => ({ req }),
    })
  );

  return app;
}

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