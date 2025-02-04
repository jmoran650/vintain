// src/message/graphql/schema.ts

import { Field, InputType, ObjectType } from "type-graphql";
import { MinLength } from "class-validator";
import { UUID } from "../../common/types";

@ObjectType()
export class Message {
  @Field()
  id!: UUID;

  @Field()
  itemOwnerId!: UUID;

  @Field()
  senderId!: UUID;

  @Field()
  @MinLength(1)
  content!: string;
}

@InputType()
export class NewMessage {
  @Field()
  itemOwnerId!: UUID;

  @Field()
  senderId!: UUID;

  @Field()
  @MinLength(1)
  content!: string;
}