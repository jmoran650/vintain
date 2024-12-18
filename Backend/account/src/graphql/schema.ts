import {Field, InputType, ObjectType} from 'type-graphql';
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
export class AccountName {
    @Field()
    @MinLength(1)
    first!:string
    
    @Field()
    @MinLength(1)
    last!:string
}

@InputType()
@ObjectType()
export class Account {
  @Field()
  id!: UUID;

  @Field()
  email!: Email;

  @Field()
  name!: AccountName;

  @Field(() => [String!])
  roles!: string[];

  @Field()
  restricted!: boolean;
}

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
}