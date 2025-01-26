// Backend/src/auth/graphql/service.ts

import { pool } from "../../../db";
import { NewAccount, Account } from "./schema";
import { UUID, Email } from "./schema";

export class AccountService {
  public async getAccount(id: UUID): Promise<Account> {
    const select = `
      SELECT
        id,
        email,
        restricted,
        data->'name' AS name,
        data->'roles' AS roles,
        data->'profile' AS profile
      FROM account
      WHERE id = $1
    `;
    const query = { text: select, values: [id] };
    const { rows } = await pool.query(query);

    if (rows.length === 0) {
      throw new Error("Account with given ID does not exist.");
    }

    const row = rows[0];
    // row.profile might be null or {username, bio} or partial
    return {
      id: row.id,
      email: row.email,
      restricted: row.restricted,
      name: row.name,         // { first, last }
      roles: row.roles || [],
      // Always return a Profile object:
      profile: {
        username: row.profile?.username ?? "", // fallback to empty string
        bio: row.profile?.bio ?? null,
      },
    };
  }

  public async getAccountByEmail(email: Email): Promise<Account> {
    const select = `
      SELECT
        id,
        email,
        restricted,
        data->'name' as name,
        data->'roles' as roles,
        data->'profile' as profile
      FROM account
      WHERE email = $1
    `;
    const query = { text: select, values: [email] };
    const { rows } = await pool.query(query);

    if (rows.length == 0) {
      throw new Error("Account with given Email does not exist.");
    }

    const row = rows[0];
    return {
      id: row.id,
      email: row.email,
      restricted: row.restricted,
      name: row.name,
      roles: row.roles || [],
      profile: {
        username: row.profile?.username ?? "",
        bio: row.profile?.bio ?? null,
      },
    };
  }

  public async getAllAccounts(): Promise<Account[]> {
    const select = `
      SELECT
        id,
        email,
        restricted,
        data->'name' as name,
        data->'roles' as roles,
        data->'profile' as profile
      FROM account
    `;
    const { rows } = await pool.query(select);

    return rows.map((row: any) => ({
      id: row.id,
      email: row.email,
      restricted: row.restricted,
      name: row.name,
      roles: row.roles || [],
      profile: {
        username: row.profile?.username ?? "",
        bio: row.profile?.bio ?? null,
      },
    }));
  }

  public async makeAccount(info: NewAccount): Promise<Account> {
    const restrictedVal = info.roles.includes("Vendor") || info.roles.includes("vendor");

    // Insert includes 'profile' with 'username' and optional 'bio'
    const insert = `
      INSERT INTO account (email, restricted, data)
      VALUES (
        $1::text,
        $7,
        jsonb_build_object(
          'name', jsonb_build_object(
            'first', $2::text,
            'last', $3::text
          ),
          'password', crypt($4::text, '${process.env.CRYPT_SECRET}'),
          'roles', $5::text[],
          'profile', jsonb_build_object(
            'username', $6::text,
            'bio', $8::text
          )
        )
      )
      RETURNING id
    `;
    const query = {
      text: insert,
      values: [
        info.email,        // $1
        info.firstName,    // $2
        info.lastName,     // $3
        info.password,     // $4
        info.roles,        // $5
        info.username,     // $6
        restrictedVal,     // $7
        info.bio || null,  // $8
      ],
    };
    const { rows } = await pool.query(query);

    // Return the newly created account data
    return {
      id: rows[0].id,
      email: info.email,
      name: { first: info.firstName, last: info.lastName },
      roles: info.roles,
      restricted: restrictedVal,
      profile: {
        username: info.username,
        bio: info.bio || undefined,
      },
    };
  }

  public async deleteAccount(id: UUID): Promise<boolean> {
    const del = `DELETE FROM account WHERE (id=$1)`;
    await pool.query({ text: del, values: [id] });
    return true;
  }

  public async deleteAccountByEmail(email: string): Promise<boolean> {
    const del = `DELETE FROM account WHERE (email=$1)`;
    await pool.query({ text: del, values: [email] });
    return true;
  }

  private async modifyRestricted(byWhat: "id" | "email", setTo: boolean, byValue: UUID | Email) {
    const update = `UPDATE account SET restricted = $2 WHERE (${byWhat}=$1)`;
    await pool.query({ text: update, values: [byValue, setTo] });
    return true;
  }

  public async suspendAccount(id: UUID): Promise<boolean> {
    return this.modifyRestricted("id", true, id);
  }

  public async resumeAccount(id: UUID): Promise<boolean> {
    return this.modifyRestricted("id", false, id);
  }

  public async suspendAccountByEmail(email: Email): Promise<boolean> {
    return this.modifyRestricted("email", true, email);
  }

  public async resumeAccountByEmail(email: Email): Promise<boolean> {
    return this.modifyRestricted("email", false, email);
  }

  public async updateProfile(
    id: UUID,
    username?: string,
    bio?: string
  ): Promise<boolean> {
    // 1) fetch existing profile subobject from DB
    const select = `
      SELECT data->'profile' as profile
      FROM account
      WHERE id = $1
    `;
    const { rows } = await pool.query({ text: select, values: [id] });

    if (rows.length === 0) {
      throw new Error("No account found for that ID.");
    }

    // oldProfile is either null or { username, bio }
    const oldProfile = rows[0].profile || {};

    // 2) Merge old data with new
    const newProfile = {
      ...oldProfile,
      ...(username !== undefined ? { username } : {}),
      ...(bio !== undefined ? { bio } : {}),
    };

    // 3) Update the row in DB
    const updateSql = `
      UPDATE account
      SET data = jsonb_set(
        data,
        '{profile}',
        $2::jsonb,  -- the new profile object
        true
      )
      WHERE id = $1
    `;
    await pool.query({
      text: updateSql,
      values: [id, JSON.stringify(newProfile)],
    });

    return true;
  }

}