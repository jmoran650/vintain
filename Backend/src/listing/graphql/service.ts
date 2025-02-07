// src/listing/graphql/service.ts

import { Service } from "typedi";
import { pool } from "../../../db";
import { NewListing, Listing, PaginatedListings } from "./schema";
import { UUID } from "../../common/types";

@Service()
export class ListingService {
  /**
   * Fetch all listings with pagination.
   * @param page The page number (>= 1).
   * @param pageSize The number of listings per page (>= 1).
   * Returns { listings, totalCount }.
   */
  public async getAllListings(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedListings> {
    if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 10;

    const offset = (page - 1) * pageSize;

    const countResult = await pool.query(`SELECT COUNT(*) AS total FROM listing`);
    const totalCount = parseInt(countResult.rows[0].total, 10);

    const select = `
      SELECT
        id,
        owner_id as "ownerId",
        data->>'brand' as brand,
        data->>'name' as name,
        data->>'description' as description,
        data->'imageUrls' as "imageUrls"
      FROM listing
      LIMIT $1
      OFFSET $2
    `;

    const { rows } = await pool.query(select, [pageSize, offset]);

    const listings = rows.map((row: any) => ({
      ...row,
      imageUrls: row.imageUrls || [],
    }));

    return { listings, totalCount };
  }

  /**
   * Get a single listing by ID.
   */
  public async getListing(id: UUID): Promise<Listing> {
    const select = `
      SELECT
        id,
        owner_id as "ownerId",
        data->>'brand' as brand,
        data->>'name' as name,
        data->>'description' as description,
        data->'imageUrls' as "imageUrls"
      FROM listing
      WHERE id = $1
    `;
    const { rows } = await pool.query(select, [id]);
    if (rows.length === 0) {
      throw new Error("Listing with given ID does not exist.");
    }
    rows[0].imageUrls = rows[0].imageUrls || [];
    return rows[0];
  }

  /**
   * Create a new listing.
   */
  public async createListing(info: NewListing): Promise<Listing> {
    const insert = `
      INSERT INTO listing (owner_id, data)
      VALUES (
        $1::uuid,
        jsonb_build_object(
          'brand', $2::text,
          'name', $3::text,
          'description', $4::text,
          'imageUrls', $5::text[]
        )
      )
      RETURNING id;
    `;
    const { rows } = await pool.query(insert, [
      info.ownerId,
      info.brand,
      info.name,
      info.description,
      info.imageUrls,
    ]);

    return {
      id: rows[0].id,
      ownerId: info.ownerId,
      brand: info.brand,
      name: info.name,
      description: info.description,
      imageUrls: info.imageUrls,
    };
  }

  /**
   * Delete a listing by ID.
   */
  public async deleteListing(id: UUID): Promise<boolean> {
    const del = `DELETE FROM listing WHERE id = $1`;
    await pool.query(del, [id]);
    return true;
  }

  /**
   * Search by substring in brand/name/description (case-insensitive) with pagination.
   */
  public async searchListings(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedListings> {
    if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 10;

    const ilikeValue = `%${searchTerm}%`;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM listing
      WHERE
        (data->>'brand') ILIKE $1
        OR (data->>'name') ILIKE $1
        OR (data->>'description') ILIKE $1
    `;
    const countResult = await pool.query(countSql, [ilikeValue]);
    const totalCount = parseInt(countResult.rows[0].total, 10);

    const offset = (page - 1) * pageSize;
    const selectSql = `
      SELECT
        id,
        owner_id AS "ownerId",
        data->>'brand' AS brand,
        data->>'name' AS name,
        data->>'description' AS description,
        data->'imageUrls' AS "imageUrls"
      FROM listing
      WHERE
        (data->>'brand') ILIKE $1
        OR (data->>'name') ILIKE $1
        OR (data->>'description') ILIKE $1
      LIMIT $2
      OFFSET $3
    `;

    const { rows } = await pool.query(selectSql, [ilikeValue, pageSize, offset]);

    const listings = rows.map((r: any) => ({
      ...r,
      imageUrls: r.imageUrls || [],
    }));

    return { listings, totalCount };
  }

  // In src/listing/graphql/service.ts, add:
  public async updateListingImages(id: UUID, imageUrls: string[]): Promise<boolean> {
    const updateSql = `
      UPDATE listing
      SET data = jsonb_set(
        data,
        '{imageUrls}',
        $2::jsonb,
        true
      )
      WHERE id = $1
    `;
    await pool.query(updateSql, [id, JSON.stringify(imageUrls)]);
    return true;
  }

}