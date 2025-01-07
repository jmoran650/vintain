import { Field, InputType, ObjectType } from 'type-graphql';
import { MinLength } from 'class-validator';

/**
 * @pattern [0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}
 * @format uuid
 */
export type UUID = string;

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