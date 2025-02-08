// Backend/src/auth/graphql/resolver.ts
import { Resolver, Mutation, Query, Ctx, Arg } from "type-graphql";
import { Authenticated, Credentials, SessionAccount } from "./schema";
import { AuthService } from "./service";
import { Service } from "typedi";
import { Request } from "express";
import { logInfo, logError } from "../../common/logger";
import { Public } from "../../common/decorators"; // <-- Import the Public decorator

@Service()
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public() // <-- Mark login as public so it bypasses authentication
  @Mutation(() => Authenticated)
  async login(
    @Ctx() req: Request,
    @Arg("input") creds: Credentials
  ): Promise<Authenticated> {
    logInfo(`Resolver: login called for email: ${creds.email}`, "Backend/src/auth/graphql/resolver.ts");
    const account = await this.authService.login(creds);
    if (!account) {
      logError(`Resolver: login failed for email: ${creds.email}`, "Backend/src/auth/graphql/resolver.ts");
      throw new Error("Invalid Credentials");
    }
    logInfo(`Resolver: login successful for email: ${creds.email}`, "Backend/src/auth/graphql/resolver.ts");
    return account;
  }

  @Query(() => SessionAccount)
  async check(
    @Ctx() req: Request,
    @Arg("input") accessToken: string
  ): Promise<SessionAccount> {
    logInfo(`Resolver: check called with token: ${accessToken}`, "Backend/src/auth/graphql/resolver.ts");
    return this.authService.check(accessToken);
  }
}