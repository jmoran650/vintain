//src/schema.ts

import { Resolver, Query, buildSchema, Ctx, ObjectType, InputType, Field } from "type-graphql";
import {Request} from "express";
import {MinLength} from 'class-validator';

/**
 * From https://tsoa-community.github.io/docs/examples.html
 * Stringified UUIDv4.
 * See [RFC 4112](https://tools.ietf.org/html/rfc4122)
 * @pattern [0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}
 * @format uuid
 */
export type UUID = string;

/**
 * From https://tsoa-community.github.io/docs/examples.html
 * Stringified UUIDv4.
 * See [RFC 4112](https://tools.ietf.org/html/rfc4122)
 * @pattern ^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$
 * @format email
 */
export type Email = string;

@ObjectType()
export class Name {
  @Field()
  @MinLength(1)
  first!:string

  @Field()
  @MinLength(1)
  last!:string
}

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

