/* eslint-disable @typescript-eslint/no-unused-vars */
import {Authorized, Query, Resolver, Ctx, Mutation, Arg} from 'type-graphql';

import {Request} from 'express';
import {AccountService} from './service';
import {
  Account,
  Email,
  NewAccount,
  UUID,
} from './schema';
// import {ExampleResponse} from './schema';

/* eslint-disable @typescript-eslint/no-unused-vars */
@Resolver()
export class AccountResolver {
  // @Authorized('someRole') Put role authorizations right here
  @Query((_returns) => Account)
  async account(@Ctx() _req: Request, @Arg('input') ID: UUID): Promise<Account> {
    //console.log('Getting Account');
    const result = await new AccountService().getAccount(ID);
    return result;
  }

  @Query((_returns) => Account)
  async accountByEmail(
    @Ctx() _req: Request,
    @Arg('input') email: Email
  ): Promise<Account> {
    email = email.toLowerCase();
    const result = await new AccountService().getAccountByEmail(email);
    return result;
  }

  @Query((_returns) => [Account])
  async allAccounts(@Ctx() _req: Request): Promise<Account[]> {
    const result = await new AccountService().getAllAccounts();
    //console.log('All accounts returning:', result);
    return result;
  }

  @Query((_returns) => [Account])
  async restrictedVendors(@Ctx() _req: Request): Promise<Account[]> {
    let result = await new AccountService().getAllAccounts();

    // Filter all accounts to only include restricted accounts with vendor roles
    result = result.filter((acc) => {
      return acc.restricted == true && acc.roles.includes('Vendor');
    });
    //console.log('Restricted:', result);
    return result;
  }

  //@Authorized('someRole')
  @Mutation((_returns) => Account)
  async makeAccount(
    @Arg('input') NewAccount: NewAccount,
    @Ctx() _request: Request
  ): Promise<Account> {
    NewAccount.email = NewAccount.email.toLowerCase();
    //console.log('Making New Account:', NewAccount.firstName);
    const result = await new AccountService().makeAccount(NewAccount);
    return result;
  }

  @Mutation((_returns) => Boolean)
  async deleteAccount(
    @Arg('input') accountID: UUID,
    @Ctx() _request: Request
  ): Promise<boolean> {
    //console.log('Deleting account', accountID);
    const result = await new AccountService().deleteAccount(accountID);
    //console.log('Success?:', result);
    return result;
  }

  @Mutation((_returns) => Boolean)
  async deleteAccountByEmail(
    @Arg('input') accountEmail: Email,
    @Ctx() _request: Request
  ): Promise<boolean> {
    accountEmail = accountEmail.toLowerCase();
    //console.log('Deleting account', accountEmail);
    const result = await new AccountService().deleteAccountByEmail(
      accountEmail
    );
    //console.log('Success?:', result);
    return result;
  }

  @Mutation((_returns) => Boolean)
  async suspendAccount(
    @Arg('input') accountID: UUID,
    @Ctx() _request: Request
  ): Promise<boolean> {
    //console.log('Suspending account', accountID);
    const result = await new AccountService().suspendAccount(accountID);
    //console.log('Success?:', result);
    return result;
  }

  @Mutation((_returns) => Boolean)
  async suspendAccountByEmail(
    @Arg('input') accountEmail: Email,
    @Ctx() _request: Request
  ): Promise<boolean> {
    accountEmail = accountEmail.toLowerCase();
    //console.log('Suspending account', accountEmail);
    const result = await new AccountService().suspendAccountByEmail(
      accountEmail
    );
    //console.log('Success?:', result);
    return result;
  }

  @Mutation((_returns) => Boolean)
  async resumeAccount(
    @Arg('input') accountID: UUID,
    @Ctx() _request: Request
  ): Promise<boolean> {
    //console.log('Suspending account', accountID);
    const result = await new AccountService().resumeAccount(accountID);
    //console.log('Success?:', result);
    return result;
  }

  @Mutation((_returns) => Boolean)
  async resumeAccountByEmail(
    @Arg('input') accountEmail: Email,
    @Ctx() _request: Request
  ): Promise<boolean> {
    accountEmail = accountEmail.toLowerCase();
    //console.log('Suspending account', accountEmail);
    const result = await new AccountService().resumeAccountByEmail(
      accountEmail
    );
    //console.log('Success?:', result);
    return result;
  }
}
