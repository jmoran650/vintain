// Backend/src/auth/graphql/schema.ts

import { ObjectType, InputType, Field } from "type-graphql";
import { MinLength } from "class-validator";

export type UUID = string;
export type Email = string;

@ObjectType()
export class Name {
  @Field()
  @MinLength(1)
  first!: string;

  @Field()
  @MinLength(1)
  last!: string;
}

/**
 * A profile object with required `username` and optional `bio`.
 */
@ObjectType()
export class Profile {
  // Make username non-null in GraphQL
  @Field()
  @MinLength(1)
  username!: string;

  @Field({ nullable: true })
  bio?: string;
}

/**
 * The Account object includes `profile` as a non-null field,
 * so we always return an object (even if it has default values).
 */
@ObjectType()
export class Account {
  @Field()
  id!: UUID;

  @Field()
  email!: Email;

  @Field()
  name!: Name;

  @Field(() => [String!])
  roles!: string[];

  @Field()
  restricted!: boolean;

  // Profile is always defined, but inside it `username` is required, `bio` is optional.
  @Field(() => Profile)
  profile!: Profile;
}

/**
 * Input for creating a new account.
 * We now require `username`, while `bio` remains optional.
 */
@InputType()
@ObjectType()
export class NewAccount {
  @Field()
  email!: Email;

  @Field()
  @MinLength(1)
  password!: string;

  @Field()
  @MinLength(1)
  firstName!: string;

  @Field()
  @MinLength(1)
  lastName!: string;

  @Field(() => [String!])
  roles!: string[];

  @Field()
  @MinLength(1)
  username!: string;

  @Field({ nullable: true })
  bio?: string;
}
