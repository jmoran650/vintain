// src/orders/graphql/resolver.ts

import { Authorized, Resolver, Query, Mutation, Arg } from "type-graphql";
import { OrderService } from "./service";
import { Order, NewOrder, UUID, ShippingStatus } from "./schema";

@Resolver()
export class OrderResolver {
  private readonly orderService = new OrderService();

  @Authorized()
  @Query(() => Order)
  async order(@Arg("id") id: UUID): Promise<Order> {
    return this.orderService.getOrder(id);
  }

  @Authorized()
  @Query(() => [Order])
  async allOrders(): Promise<Order[]> {
    return this.orderService.getAllOrders();
  }

  @Authorized()
  @Mutation(() => Order)
  async createOrder(@Arg("input") input: NewOrder): Promise<Order> {
    return this.orderService.createOrder(input);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteOrder(@Arg("id") id: UUID): Promise<boolean> {
    return this.orderService.deleteOrder(id);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async updateOrderStatus(
    @Arg("id") id: UUID,
    @Arg("status", () => ShippingStatus) status: ShippingStatus
  ): Promise<boolean> {
    return this.orderService.updateShippingStatus(id, status);
  }
}