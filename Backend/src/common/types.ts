// src/common/types.ts
import { ObjectType, Field, InputType } from "type-graphql";
import { MinLength } from "class-validator";

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