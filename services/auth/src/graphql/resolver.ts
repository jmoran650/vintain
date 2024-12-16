import { Resolver, Query, buildSchema, Ctx, ObjectType, InputType, Field, Arg } from "type-graphql";
import {
    Authenticated,
    Credentials,
  } from './schema';
@Resolver()
class authResolver{
  @Query(() => Authenticated)
  async login(
    @Ctx() req: Request,
    @Arg('input') creds: Credentials
  ): Promise<Authenticated> {
    const account = await new AuthService().login(creds);
    if(!account) {

    }
  }
}