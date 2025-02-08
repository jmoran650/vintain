// Backend/src/common/jsonbMapping.ts
import { Account } from "../account/graphql/schema";

/**
 * Maps a database row from the account table to an Account object.
 *
 * @param row - The raw database row.
 * @returns An Account object with properly mapped properties.
 */
export function mapAccountRow(row: any): Account {
  return {
    id: row.id,
    email: row.email,
    restricted: row.restricted,
    name: row.name,
    roles: row.roles || [],
    profile: {
      username: row.profile?.username ?? "",
      bio: row.profile?.bio ?? null,
      profilePicture: row.profile?.profilePicture ?? null,
    },
  };
}