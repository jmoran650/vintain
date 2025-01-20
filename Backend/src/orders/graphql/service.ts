import { pool } from '../../../db';
import { NewOrder, Order, ShippingStatus, UUID } from './schema';

export class OrderService {
  /**
   * Fetch a single order by id.
   */
  public async getOrder(id: UUID): Promise<Order> {
    const select = `
      SELECT
        id,
        buyer_id,
        seller_id,
        item_id,
        shipping_status,
        data
      FROM orders
      WHERE id = $1
    `;
    const query = {
      text: select,
      values: [id],
    };
    const { rows } = await pool.query(query);

    if (rows.length === 0) {
      throw new Error('Order with given ID does not exist.');
    }

    // Convert row to Order object
    const row = rows[0];
    return {
      id: row.id,
      buyerId: row.buyer_id,
      sellerId: row.seller_id,
      itemId: row.item_id,
      shippingStatus: row.shipping_status as ShippingStatus,
      data: row.data || undefined,
    };
  }

  /**
   * Fetch all orders in the system (or optionally filter).
   */
  public async getAllOrders(): Promise<Order[]> {
    const select = `
      SELECT
        id,
        buyer_id,
        seller_id,
        item_id,
        shipping_status,
        data
      FROM orders
    `;
    const { rows } = await pool.query(select);

    return rows.map((row) => ({
      id: row.id,
      buyerId: row.buyer_id,
      sellerId: row.seller_id,
      itemId: row.item_id,
      shippingStatus: row.shipping_status as ShippingStatus,
      data: row.data || undefined,
    }));
  }

  /**
   * Create a new order in the DB.
   * shippingStatus defaults to 'PENDING' if not provided.
   */
  public async createOrder(info: NewOrder): Promise<Order> {
    const status = info.shippingStatus || ShippingStatus.PENDING;
    
    const insert = `
      INSERT INTO orders (buyer_id, seller_id, shipping_status, item_id, data)
      VALUES ($1::uuid, $2::uuid, $3::text, $4::uuid, $5::jsonb)
      RETURNING id
    `;
    const query = {
      text: insert,
      values: [
        info.buyerId,
        info.sellerId,
        status,
        info.itemId, // <--- pass the itemId now
        info.data ? JSON.stringify(info.data) : null,
      ],
    };
    
    const { rows } = await pool.query(query);
    const id = rows[0].id as UUID;
  
    return {
      id,
      buyerId: info.buyerId,
      sellerId: info.sellerId,
      itemId: info.itemId,
      shippingStatus: status,
      data: info.data,
    };
  }

  /**
   * Delete an order by id.
   * Returns true if deleted successfully, false if not found (optional).
   */
  public async deleteOrder(id: UUID): Promise<boolean> {
    const del = `
      DELETE FROM orders
      WHERE id = $1
    `;
    const query = {
      text: del,
      values: [id],
    };

    const result = await pool.query(query);
    // result.rowCount === 1 if a row was deleted
    return result.rowCount === 1;
  }

  /**
   * Update the shipping status for a given order.
   */
  public async updateShippingStatus(
    id: UUID,
    newStatus: ShippingStatus
  ): Promise<boolean> {
    const update = `
      UPDATE orders
      SET shipping_status = $2
      WHERE id = $1
    `;
    const query = {
      text: update,
      values: [id, newStatus],
    };

    const result = await pool.query(query);
    return result.rowCount === 1; // true if an order was updated
  }
}