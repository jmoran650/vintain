import { pool } from '../../../db';
import { NewMessage, Message, UUID } from './schema';

export class MessageService {
  public async getMessage(id: UUID): Promise<Message> {
    const select = `SELECT id, item_owner_id as "itemOwnerId", sender_id as "senderId", data->>'content' as content
    FROM message WHERE id = $1`;
    const query = {
      text: select,
      values: [id],
    };
    const { rows } = await pool.query(query);
    if (rows.length === 0) {
      return Promise.reject(new Error('Message not found.'));
    }
    return rows[0];
  }

  public async getMessagesByItemOwner(itemOwnerId: UUID): Promise<Message[]> {
    const select = `SELECT id, item_owner_id as "itemOwnerId", sender_id as "senderId", data->>'content' as content
    FROM message WHERE item_owner_id = $1`;
    const query = {
      text: select,
      values: [itemOwnerId],
    };
    const { rows } = await pool.query(query);
    return rows;
  }

  public async getMessagesBySender(senderId: UUID): Promise<Message[]> {
    const select = `SELECT id, item_owner_id as "itemOwnerId", sender_id as "senderId", data->>'content' as content
    FROM message WHERE sender_id = $1`;
    const query = {
      text: select,
      values: [senderId],
    };
    const { rows } = await pool.query(query);
    return rows;
  }

  public async createMessage(info: NewMessage): Promise<Message> {
    const insert = `INSERT INTO message(item_owner_id, sender_id, data) VALUES ($1::uuid, $2::uuid, jsonb_build_object(
      'content', $3::text
    )) RETURNING id;`;
    const query = {
      text: insert,
      values: [info.itemOwnerId, info.senderId, info.content],
    };
    const { rows } = await pool.query(query);
    return {
      id: rows[0].id,
      itemOwnerId: info.itemOwnerId,
      senderId: info.senderId,
      content: info.content,
    };
  }

  public async deleteMessage(id: UUID): Promise<boolean> {
    const del = `DELETE FROM message WHERE id = $1`;
    const query = {
      text: del,
      values: [id],
    };
    await pool.query(query);
    return true;
  }
}