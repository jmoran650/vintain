import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { OrderService } from './service';
import { Order, NewOrder, UUID, ShippingStatus } from './schema';

@Resolver()
export class OrderResolver {
    
  private readonly orderService = new OrderService();

  /**
   * Query a single order by its id.
   */
  @Query(() => Order)
  async order(@Arg('id') id: UUID): Promise<Order> {
    return this.orderService.getOrder(id);
  }

  /**
   * Query all orders (optionally you can add filtering later).
   */
  @Query(() => [Order])
  async allOrders(): Promise<Order[]> {
    return this.orderService.getAllOrders();
  }

  /**
   * Create a new order by providing buyerId, sellerId, optional shippingStatus, etc.
   */
  @Mutation(() => Order)
  async createOrder(@Arg('input') input: NewOrder): Promise<Order> {
    return this.orderService.createOrder(input);
  }

  /**
   * Delete an order by id. Returns true if an order was deleted.
   */
  @Mutation(() => Boolean)
  async deleteOrder(@Arg('id') id: UUID): Promise<boolean> {
    return this.orderService.deleteOrder(id);
  }

  /**
   * Update the shipping status of an existing order.
   */
  @Mutation(() => Boolean)
  async updateOrderStatus(
    @Arg('id') id: UUID,
    @Arg('status', () => ShippingStatus) status: ShippingStatus
  ): Promise<boolean> {
    return this.orderService.updateShippingStatus(id, status);
  }
}