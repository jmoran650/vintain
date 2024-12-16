//src/schema.ts

import { Resolver, Query, buildSchema, Ctx } from "type-graphql";
import {Request} from "express";

@Resolver()
class HelloResolver {
  @Query(() => String)
  hello(): string {
    return "Hello from Authentication Service";
  }
}



export async function createSchema() {
  return await buildSchema({
    resolvers: [HelloResolver],
  });
}