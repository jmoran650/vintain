
// Backend/index.ts
import dotenv from "dotenv";
dotenv.config();

// Validate required Environment Variables are present
const requiredEnv = [
  "DATABASE_URL",
  "MASTER_SECRET",
  "CRYPT_SECRET",
  "AWS_S3_BUCKET",
  "AWS_REGION"
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}




import express from "express";
import helmet from "helmet";
import { createHandler } from "graphql-http/lib/use/express";
import { Pool } from "pg";
import "reflect-metadata";
import { buildSchema, AuthChecker } from "type-graphql";
import * as jwt from "jsonwebtoken";
import { Container } from "typedi";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import { IS_PUBLIC_KEY } from "./src/common/decorators"; // <-- Import the public metadata key



import { AccountResolver } from "./src/account/graphql/resolver";
import { AuthResolver } from "./src/auth/graphql/resolver";
import { ListingResolver } from "./src/listing/graphql/resolver";
import { MessageResolver } from "./src/message/graphql/resolver";
import { OrderResolver } from "./src/orders/graphql/resolver";
import { S3Resolver } from "./src/s3/graphql/resolver";

// Use a single database pool instance.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Global auth checker for TypeGraphQL.
 * Public operations like login and makeAccount bypass authentication.
 */
const customAuthChecker: AuthChecker<any> = ({ root, args, context, info }, roles) => {
  // Get the resolver function from the GraphQL info object using the parent type's field.
  const field = info.parentType.getFields()[info.fieldName];
  const resolverFn = field?.resolve;
  // Check if the resolver function is marked as public via our custom metadata.
  if (resolverFn && Reflect.getMetadata(IS_PUBLIC_KEY, resolverFn)) {
    return true;
  }
  // Fall back to verifying the token.
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
    console.error(err);
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
 * This ensures that S3 connectivity and credentials are valid before starting the server.
 */
async function pingS3(): Promise<void> {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    // AWS credentials will be loaded from environment variables.
  });
  try {
    const command = new HeadBucketCommand({ Bucket: process.env.AWS_S3_BUCKET! });
    await s3Client.send(command);
    console.log("Successfully connected to S3 bucket:", process.env.AWS_S3_BUCKET);
  } catch (error) {
    console.error("Error connecting to S3 bucket:", error);
    throw error;
  }
}

export async function createApp() {
  // Test database connection.
  const client = await pool.connect();
  const res = await client.query("SELECT NOW()");
  client.release();
  console.log("Connected to database, current time:", res.rows[0].now);

  // Ping S3 to ensure connectivity before starting.
  await pingS3();

  // Build the GraphQL schema.
  const schema = await createSchema();

  const app = express();

  app.use(helmet());
  app.use(express.json());

  // New logging endpoint for frontend logs.
  app.post("/log", express.json(), (req, res) => {
    const { level, message, source } = req.body;
    if (level === "info") {
      const { logInfo } = require("./src/common/logger");
      logInfo(message, source);
    } else if (level === "error") {
      const { logError } = require("./src/common/logger");
      logError(message, source);
    }
    res.sendStatus(200);
  });

  // Mount the GraphQL endpoint (auth is handled via TypeGraphQL).
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