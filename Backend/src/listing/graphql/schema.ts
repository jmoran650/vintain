// src/listing/graphql/schema.ts

import { Field, InputType, ObjectType, Int } from "type-graphql";
import { MinLength } from "class-validator";
import { UUID } from "../../common/types";

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

/**
 * For returning paginated listing results (listings + totalCount).
 */
@ObjectType()
export class PaginatedListings {
  @Field(() => [Listing])
  listings!: Listing[];

  @Field(() => Int)
  totalCount!: number;
}