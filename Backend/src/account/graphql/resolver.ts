// src/account/graphql/resolver.ts

import { Authorized, Query, Resolver, Ctx, Mutation, Arg } from "type-graphql";
import { Request } from "express";
import { AccountService } from "./service";
import { Account, Email, NewAccount, UUID } from "./schema";

@Resolver()
export class AccountResolver {
  @Authorized()
  @Query(() => Account)
  async account(
    @Ctx() _req: Request,
    @Arg("input") ID: UUID
  ): Promise<Account> {
    return new AccountService().getAccount(ID);
  }

  @Authorized()
  @Query(() => Account)
  async accountByEmail(
    @Ctx() _req: Request,
    @Arg("input") email: Email
  ): Promise<Account> {
    email = email.toLowerCase();
    return new AccountService().getAccountByEmail(email);
  }

  @Authorized()
  @Query(() => [Account])
  async allAccounts(@Ctx() _req: Request): Promise<Account[]> {
    return new AccountService().getAllAccounts();
  }

  @Authorized()
  @Query(() => [Account])
  async restrictedVendors(@Ctx() _req: Request): Promise<Account[]> {
    const all = await new AccountService().getAllAccounts();
    return all.filter((acc) => acc.restricted === true && acc.roles.includes("Vendor"));
  }

  // Public operation: account creation remains unprotected.
  @Mutation(() => Account)
  async makeAccount(
    @Arg("input") newAccount: NewAccount,
    @Ctx() _request: Request
  ): Promise<Account> {
    newAccount.email = newAccount.email.toLowerCase();
    return new AccountService().makeAccount(newAccount);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteAccount(
    @Arg("input") accountID: UUID,
    @Ctx() _request: Request
  ): Promise<boolean> {
    return new AccountService().deleteAccount(accountID);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteAccountByEmail(
    @Arg("input") accountEmail: Email,
    @Ctx() _request: Request
  ): Promise<boolean> {
    accountEmail = accountEmail.toLowerCase();
    return new AccountService().deleteAccountByEmail(accountEmail);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async suspendAccount(
    @Arg("input") accountID: UUID,
    @Ctx() _request: Request
  ): Promise<boolean> {
    return new AccountService().suspendAccount(accountID);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async suspendAccountByEmail(
    @Arg("input") accountEmail: Email,
    @Ctx() _request: Request
  ): Promise<boolean> {
    accountEmail = accountEmail.toLowerCase();
    return new AccountService().suspendAccountByEmail(accountEmail);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async resumeAccount(
    @Arg("input") accountID: UUID,
    @Ctx() _request: Request
  ): Promise<boolean> {
    return new AccountService().resumeAccount(accountID);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async resumeAccountByEmail(
    @Arg("input") accountEmail: Email,
    @Ctx() _request: Request
  ): Promise<boolean> {
    accountEmail = accountEmail.toLowerCase();
    return new AccountService().resumeAccountByEmail(accountEmail);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async updateProfile(
    @Arg("id") id: UUID,
    @Arg("username", { nullable: true }) username?: string,
    @Arg("bio", { nullable: true }) bio?: string
  ): Promise<boolean> {
    return new AccountService().updateProfile(id, username, bio);
  }
}