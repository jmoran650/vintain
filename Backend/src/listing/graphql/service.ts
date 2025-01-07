import { pool } from '../../../db';
import { NewListing, Listing, UUID } from './schema';

export class ListingService {
  public async getListing(id: UUID): Promise<Listing> {
    const select = `SELECT id, owner_id as "ownerId", data->>'brand' as brand, data->>'name' as name, data->>'description' as description, data->'imageUrls' as "imageUrls"
    FROM listing WHERE id = $1`;
    const query = {
      text: select,
      values: [id],
    };
    const { rows } = await pool.query(query);
    if (rows.length == 0) {
      return new Promise<Listing>((_res, reject) => {
        reject(new Error('Listing with given ID does not exist.'));
      });
    }
    // imageUrls is stored as JSON array, ensure it is an array of strings
    rows[0].imageUrls = rows[0].imageUrls || [];
    return rows[0];
  }

  public async getAllListings(): Promise<Listing[]> {
    const select = `SELECT id, owner_id as "ownerId", data->>'brand' as brand, data->>'name' as name, data->>'description' as description, data->'imageUrls' as "imageUrls"
    FROM listing`;
    const query = {
      text: select,
      values: [],
    };
    const { rows } = await pool.query(query);
    return rows.map((r: any) => {
      r.imageUrls = r.imageUrls || [];
      return r;
    });
  }

  public async createListing(info: NewListing): Promise<Listing> {
    const insert = `INSERT INTO listing(owner_id, data) VALUES ($1::uuid,
    jsonb_build_object(
      'brand', $2::text,
      'name', $3::text,
      'description', $4::text,
      'imageUrls', $5::text[]
    )) RETURNING id;`;
    const query = {
      text: insert,
      values: [
        info.ownerId,
        info.brand,
        info.name,
        info.description,
        info.imageUrls,
      ],
    };
    const { rows } = await pool.query(query);
    return {
      id: rows[0].id,
      ownerId: info.ownerId,
      brand: info.brand,
      name: info.name,
      description: info.description,
      imageUrls: info.imageUrls,
    };
  }

  public async deleteListing(id: UUID): Promise<boolean> {
    const del = `DELETE FROM listing WHERE id = $1`;
    const query = {
      text: del,
      values: [id],
    };
    await pool.query(query);
    return true;
  }
}