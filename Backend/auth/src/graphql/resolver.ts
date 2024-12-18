import { Resolver, Query, buildSchema, Ctx, ObjectType, InputType, Field, Arg } from "type-graphql";
import {
    Authenticated,
    Credentials,
    SessionAccount
  } from './schema';
import {AuthService} from "./service"

@Resolver()
export class AuthResolver{
  @Query(() => Authenticated)
  async login(
    @Ctx() req: Request,
    @Arg('input') creds: Credentials
  ): Promise<Authenticated> {

    const account = await new AuthService().login(creds);
    if(!account) {
      return new Promise<Authenticated>((_res, reject) => {
        reject(new Error('Invalid Credentials'));
      });
    }
    return account;
  }

  @Query((returns) => SessionAccount)
  async check(
    @Ctx() req: Request,
    @Arg('input') accessToken: string
  ): Promise<SessionAccount> {
    //console.log('Check attempt');
    const account = await new AuthService().check(accessToken);

    //console.log('Check Received:', account);
    return account;
  }


}