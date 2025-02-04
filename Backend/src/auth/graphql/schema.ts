//Backend/src/auth/graphql/schema.ts
import { ObjectType, InputType, Field } from "type-graphql";
import {MinLength} from 'class-validator';
import {UUID, Email, Name } from '../../common/types'



@InputType()
@ObjectType()
export class Authenticated {
  @Field()
  @MinLength(1)
  id!:string

  @Field()
  name!:Name

  @Field()
  @MinLength(1)
  accessToken!:string
}

ObjectType()
export class Account {
  @Field()
  id!:UUID

  @Field()
  email!:Email

  @Field()
  name!:Name

  @Field()
  @MinLength(1)
  accessToken!:string

  // TODO: IMPLEMENT TWO TOKENS AUTH
  // @Field()
  // @MinLength(1)
  // refreshToken!:string

}

@InputType()
@ObjectType()
export class Credentials {
  @Field()
  @MinLength(1)
  email!:Email

  @Field()
  @MinLength(1)
  password!:string

}

@InputType()
@ObjectType()
export class SessionAccount {

  @Field()
  @MinLength(1)
  id!: string;

}

