// src/account/graphql/service.ts

import { Service } from "typedi";
import { pool } from "../../../db";
import { NewAccount, Account } from "./schema";
import { UUID, Email } from "../../common/types";

@Service()
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
    const { rows } = await pool.query(select, [id]);

    if (rows.length === 0) {
      throw new Error("Account with given ID does not exist.");
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
    const { rows } = await pool.query(select, [email]);

    if (rows.length === 0) {
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
    const restrictedVal = info.roles.some(role => role.toLowerCase() === "vendor");

    // Explicitly cast parameters so that PostgreSQL can infer types.
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
    const values = [
      info.email,
      info.firstName,
      info.lastName,
      info.password,
      info.roles,
      info.username,
      restrictedVal,
      info.bio || null,
    ];
    const { rows } = await pool.query(insert, values);

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
    const del = `DELETE FROM account WHERE id = $1`;
    await pool.query(del, [id]);
    return true;
  }

  public async deleteAccountByEmail(email: string): Promise<boolean> {
    const del = `DELETE FROM account WHERE email = $1`;
    await pool.query(del, [email]);
    return true;
  }

  private async modifyRestricted(byWhat: "id" | "email", setTo: boolean, byValue: UUID | Email) {
    const update = `UPDATE account SET restricted = $2 WHERE ${byWhat} = $1`;
    await pool.query(update, [byValue, setTo]);
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
    const select = `
      SELECT data->'profile' as profile
      FROM account
      WHERE id = $1
    `;
    const { rows } = await pool.query(select, [id]);

    if (rows.length === 0) {
      throw new Error("No account found for that ID.");
    }

    const oldProfile = rows[0].profile || {};
    const newProfile = {
      ...oldProfile,
      ...(username !== undefined ? { username } : {}),
      ...(bio !== undefined ? { bio } : {}),
    };

    const updateSql = `
      UPDATE account
      SET data = jsonb_set(
        data,
        '{profile}',
        $2::jsonb,
        true
      )
      WHERE id = $1
    `;
    await pool.query(updateSql, [id, JSON.stringify(newProfile)]);

    return true;
  }
}