//Backend/src/orders/graphql/schema.ts
import { Field, InputType, ObjectType, registerEnumType } from "type-graphql";
import { MinLength } from "class-validator";

/**
 * From your listing schema example:
 * @pattern [0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}
 * @format uuid
 */
export type UUID = string;

/**
 * Example shipping statuses. Feel free to add or change these.
 */
export enum ShippingStatus {
  PENDING = "PENDING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

/**
 * Let TypeGraphQL know about our enum so it can generate correct schema types.
 */
registerEnumType(ShippingStatus, {
  name: "ShippingStatus",
});

@ObjectType()
export class Order {
  @Field()
  id!: UUID;

  // The account who placed the order
  @Field()
  buyerId!: UUID;

  // The account fulfilling the order (e.g. vendor or seller)
  @Field()
  sellerId!: UUID;

  @Field()
  itemId!: UUID;

  // Current shipping status of the order
  @Field(() => ShippingStatus)
  shippingStatus!: ShippingStatus;

  // Optionally store extra info
  // e.g., items, addresses, timestamps, etc.
  @Field({ nullable: true })
  data?: string;
}

@InputType()
export class NewOrder {
  @Field()
  buyerId!: UUID;

  @Field()
  sellerId!: UUID;

  @Field()
  itemId!: UUID; // ensure you capture itemId if needed

  @Field(() => ShippingStatus, { nullable: true })
  shippingStatus?: ShippingStatus;

  @Field({ nullable: true })
  @MinLength(1)
  data?: string;
}