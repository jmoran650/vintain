//Backend/src/listing/graphql/service.ts
import { pool } from "../../../db";
import { NewListing, Listing, UUID } from "./schema";

export class ListingService {
  /**
   * Fetch all listings with pagination.
   * @param page The page number (>= 1).
   * @param pageSize The number of listings per page (>= 1).
   *
   * Returns { listings, totalCount }.
   */
  public async getAllListings(
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ listings: Listing[]; totalCount: number }> {
    // Prevent negative or zero inputs
    if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 10;

    const offset = (page - 1) * pageSize;

    // 1) total count for pagination
    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM listing`
    );
    const totalCount = parseInt(countResult.rows[0].total, 10);

    // 2) query the rows
    const select = `
      SELECT
        id,
        owner_id as "ownerId",
        data->>'brand' as brand,
        data->>'name' as name,
        data->>'description' as description,
        data->'imageUrls' as "imageUrls"
      FROM listing
      -- If you have a created_at column:
      -- ORDER BY created_at DESC
      LIMIT $1
      OFFSET $2
    `;

    const { rows } = await pool.query({
      text: select,
      values: [pageSize, offset],
    });

    // ensure imageUrls is not null
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
    const { rows } = await pool.query({ text: select, values: [id] });
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
    const { rows } = await pool.query({
      text: insert,
      values: [
        info.ownerId,
        info.brand,
        info.name,
        info.description,
        info.imageUrls,
      ],
    });

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
    await pool.query({ text: del, values: [id] });
    return true;
  }

  /**
   * Search by substring in brand/name/description (case-insensitive) with pagination.
   *
   * @param searchTerm The text we want to find in brand/name/description
   * @param page The page number (>= 1)
   * @param pageSize The number of results per page (>= 1)
   * @returns {
   *   listings: Listing[],
   *   totalCount: number
   * }
   */
  public async searchListings(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ listings: Listing[]; totalCount: number }> {
    // 1) Normalize page/pageSize
    if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 10;

    // We'll wrap the term in % ... % for a contains match
    const ilikeValue = `%${searchTerm}%`;

    // 2) Determine totalCount for all matched rows (no LIMIT here)
    const countSql = `
     SELECT COUNT(*) AS total
     FROM listing
     WHERE
       (data->>'brand') ILIKE $1
       OR (data->>'name') ILIKE $1
       OR (data->>'description') ILIKE $1
   `;
    const countResult = await pool.query({
      text: countSql,
      values: [ilikeValue],
    });
    const totalCount = parseInt(countResult.rows[0].total, 10);

    // 3) Do the actual SELECT with LIMIT & OFFSET
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

    const { rows } = await pool.query({
      text: selectSql,
      values: [ilikeValue, pageSize, offset],
    });

    // 4) Map rows to your Listing shape, ensuring imageUrls isn’t null
    const listings: Listing[] = rows.map((r: any) => ({
      ...r,
      imageUrls: r.imageUrls || [],
    }));

    // 5) Return listings and the total match count
    return { listings, totalCount };
  }
}
