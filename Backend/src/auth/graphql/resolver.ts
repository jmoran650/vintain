// src/auth/graphql/resolver.ts
import { Resolver, Mutation, Query, Ctx, Arg } from "type-graphql";
import { Authenticated, Credentials, SessionAccount } from "./schema";
import { AuthService } from "./service";
import { Service } from "typedi";
import { Request } from "express";

@Service()
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Authenticated)
  async login(
    @Ctx() req: Request,
    @Arg("input") creds: Credentials
  ): Promise<Authenticated> {
    const account = await this.authService.login(creds);
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
    return this.authService.check(accessToken);
  }
}