import { Field, InputType, ObjectType } from 'type-graphql';
import { MinLength } from 'class-validator';

/**
 * Stringified UUIDv4.
 * @pattern [0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}
 * @format uuid
 */
export type UUID = string;

@ObjectType()
export class Listing {
  @Field()
  id!: UUID;

  @Field()
  ownerId!: UUID;

  @Field()
  @MinLength(1)
  brand!: string;

  @Field()
  @MinLength(1)
  name!: string;

  @Field()
  @MinLength(1)
  description!: string;

  @Field(() => [String])
  imageUrls!: string[];
}

@InputType()
export class NewListing {
  @Field()
  ownerId!: UUID;

  @Field()
  @MinLength(1)
  brand!: string;

  @Field()
  @MinLength(1)
  name!: string;

  @Field()
  @MinLength(1)
  description!: string;

  @Field(() => [String])
  imageUrls!: string[];
}