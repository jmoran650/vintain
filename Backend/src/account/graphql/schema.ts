// src/account/graphql/schema.ts
import { ObjectType, InputType, Field } from "type-graphql";
import { MinLength } from "class-validator";
import { Name, UUID, Email } from "../../common/types";

@ObjectType()
export class Profile {
  @Field()
  @MinLength(1)
  username!: string;

  @Field({ nullable: true })
  bio?: string;
}

/**
 * The Account object includes a non-null profile.
 */
@ObjectType()
export class Account {
  @Field()
  id!: UUID;

  @Field()
  email!: Email;

  @Field()
  name!: Name;

  @Field(() => [String])
  roles!: string[];

  @Field()
  restricted!: boolean;

  @Field(() => Profile)
  profile!: Profile;
}

/**
 * Input for creating a new account.
 */
@InputType()
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

  @Field(() => [String])
  roles!: string[];

  @Field()
  @MinLength(1)
  username!: string;

  @Field({ nullable: true })
  bio?: string;
}