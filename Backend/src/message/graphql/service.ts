// src/message/graphql/service.ts

import { Service } from "typedi";
import { pool } from "../../../db";
import { NewMessage, Message } from "./schema";
import { UUID } from "../../common/types";

@Service()
export class MessageService {
  public async getMessage(id: UUID): Promise<Message> {
    const select = `
      SELECT id, 
             item_owner_id as "itemOwnerId", 
             sender_id as "senderId", 
             data->>'content' as content
      FROM message 
      WHERE id = $1
    `;
    const { rows } = await pool.query(select, [id]);
    if (rows.length === 0) {
      throw new Error("Message not found.");
    }
    return rows[0];
  }

  public async getMessagesByItemOwner(itemOwnerId: UUID): Promise<Message[]> {
    const select = `
      SELECT id, 
             item_owner_id as "itemOwnerId", 
             sender_id as "senderId", 
             data->>'content' as content
      FROM message 
      WHERE item_owner_id = $1
    `;
    const { rows } = await pool.query(select, [itemOwnerId]);
    return rows;
  }

  public async getMessagesBySender(senderId: UUID): Promise<Message[]> {
    const select = `
      SELECT id, 
             item_owner_id as "itemOwnerId", 
             sender_id as "senderId", 
             data->>'content' as content
      FROM message 
      WHERE sender_id = $1
    `;
    const { rows } = await pool.query(select, [senderId]);
    return rows;
  }

  public async createMessage(info: NewMessage): Promise<Message> {
    const insert = `
      INSERT INTO message(item_owner_id, sender_id, data)
      VALUES ($1::uuid, $2::uuid, jsonb_build_object('content', $3::text))
      RETURNING id;
    `;
    const { rows } = await pool.query(insert, [
      info.itemOwnerId,
      info.senderId,
      info.content,
    ]);
    return {
      id: rows[0].id,
      itemOwnerId: info.itemOwnerId,
      senderId: info.senderId,
      content: info.content,
    };
  }

  public async deleteMessage(id: UUID): Promise<boolean> {
    const del = `DELETE FROM message WHERE id = $1`;
    await pool.query(del, [id]);
    return true;
  }
}