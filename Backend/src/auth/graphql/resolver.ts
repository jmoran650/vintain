// src/auth/graphql/resolver.ts

import { Resolver, Query, Ctx, Arg } from "type-graphql";
import { Authenticated, Credentials, SessionAccount } from "./schema";
import { AuthService } from "./service";

@Resolver()
export class AuthResolver {
  @Query(() => Authenticated)
  async login(
    @Ctx() req: Request,
    @Arg("input") creds: Credentials
  ): Promise<Authenticated> {
    const account = await new AuthService().login(creds);
    if (!account) {
      throw new Error("Invalid Credentials");
    }
    return account;
  }

  @Query(() => SessionAccount)
  async check(
    @Ctx() req: Request,
    @Arg("input") accessToken: string
  ): Promise<SessionAccount> {
    return new AuthService().check(accessToken);
  }
}