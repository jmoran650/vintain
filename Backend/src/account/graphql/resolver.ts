// src/account/graphql/resolver.ts
import { Authorized, Query, Resolver, Ctx, Mutation, Arg } from "type-graphql";
import { Request } from "express";
import { AccountService } from "./service";
import { Account, NewAccount } from "./schema";
import { UUID, Email } from "../../common/types";
import { Service } from "typedi";
import { Public } from "../../common/decorators";

@Service()
@Resolver()
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}

  @Authorized()
  @Query(() => Account)
  async account(
    @Ctx() _req: Request,
    @Arg("input") id: UUID
  ): Promise<Account> {
    return this.accountService.getAccount(id);
  }

  @Authorized()
  @Query(() => Account)
  async accountByEmail(
    @Ctx() _req: Request,
    @Arg("input") email: Email
  ): Promise<Account> {
    return this.accountService.getAccountByEmail(email.toLowerCase());
  }

  @Authorized()
  @Query(() => [Account])
  async allAccounts(@Ctx() _req: Request): Promise<Account[]> {
    return this.accountService.getAllAccounts();
  }

  @Authorized()
  @Query(() => [Account])
  async restrictedVendors(@Ctx() _req: Request): Promise<Account[]> {
    const all = await this.accountService.getAllAccounts();
    return all.filter((acc) => acc.restricted && acc.roles.includes("Vendor"));
  }

  // Public operation: account creation is marked as public via decorator.
  @Public()
  @Mutation(() => Account)
  async makeAccount(
    @Arg("input") newAccount: NewAccount,
    @Ctx() _request: Request
  ): Promise<Account> {
    newAccount.email = newAccount.email.toLowerCase();
    return this.accountService.makeAccount(newAccount);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteAccount(
    @Arg("input") accountID: UUID,
    @Ctx() _request: Request
  ): Promise<boolean> {
    return this.accountService.deleteAccount(accountID);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteAccountByEmail(
    @Arg("input") accountEmail: Email,
    @Ctx() _request: Request
  ): Promise<boolean> {
    return this.accountService.deleteAccountByEmail(accountEmail.toLowerCase());
  }

  @Authorized()
  @Mutation(() => Boolean)
  async suspendAccount(
    @Arg("input") accountID: UUID,
    @Ctx() _request: Request
  ): Promise<boolean> {
    return this.accountService.suspendAccount(accountID);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async suspendAccountByEmail(
    @Arg("input") accountEmail: Email,
    @Ctx() _request: Request
  ): Promise<boolean> {
    return this.accountService.suspendAccountByEmail(accountEmail.toLowerCase());
  }

  @Authorized()
  @Mutation(() => Boolean)
  async resumeAccount(
    @Arg("input") accountID: UUID,
    @Ctx() _request: Request
  ): Promise<boolean> {
    return this.accountService.resumeAccount(accountID);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async resumeAccountByEmail(
    @Arg("input") accountEmail: Email,
    @Ctx() _request: Request
  ): Promise<boolean> {
    return this.accountService.resumeAccountByEmail(accountEmail.toLowerCase());
  }

// src/account/graphql/resolver.ts (partial change)

@Authorized()
@Mutation(() => Boolean)
async updateProfile(
  @Arg("id") id: UUID,
  @Arg("username", { nullable: true }) username?: string,
  @Arg("bio", { nullable: true }) bio?: string,
  // New optional argument:
  @Arg("profilePicture", { nullable: true }) profilePicture?: string
): Promise<boolean> {
  return this.accountService.updateProfile(id, username, bio, profilePicture);
}

}