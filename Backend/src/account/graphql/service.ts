import { pool } from "../../../db";
import { NewAccount } from "./schema";
import { Account } from "./schema";
import { UUID, Email } from "./schema";

export class AccountService {
  public async getAccount(id: UUID): Promise<Account> {
    const select = `SELECT id, email, restricted, data->'name' as name, data->'roles' as roles FROM account WHERE (id = $1)`;
    const query = {
      text: select,
      values: [id],
    };
    const { rows } = await pool.query(query);
    if (rows.length == 0) {
      return new Promise<Account>((_res, reject) => {
        reject(new Error("Account with given ID does not exist."));
      });
    }
    return rows[0];
  }

  public async getAccountByEmail(email: Email): Promise<Account> {
    const select = `SELECT id, email, restricted, data->'name' as name, data->'roles' as roles FROM account WHERE (email = $1)`;
    const query = {
      text: select,
      values: [email],
    };
    const { rows } = await pool.query(query);
    if (rows.length == 0) {
      return new Promise<Account>((_res, reject) => {
        reject(new Error("Account with given Email does not exist."));
      });
    }
    return rows[0];
  }

  public async getAllAccounts(): Promise<Account[]> {
    const select = `SELECT id, email, restricted, data->'name' as name, data->'roles' as roles FROM account`;
    const query = {
      text: select,
      values: [],
    };
    const { rows } = await pool.query(query);
    // if (rows.length == 0) {
    //   return new Promise<Account[]>((_res, reject) => {
    //     reject(new Error('No accounts exist.'));
    //   });
    // }
    //console.log('All accounts:', rows);
    return rows;
  }

  public async makeAccount(info: NewAccount): Promise<Account> {
    const restrictedVal =
      info.roles.includes("Vendor") || info.roles.includes("vendor");
    const insert = `INSERT INTO account(email, restricted, data) VALUES ($1::text, $6,
  jsonb_build_object(
      'name', jsonb_build_object(
          'first', $2::text,
          'last', $3::text),
      'password', crypt($4::text, '${process.env.CRYPT_SECRET}'),
      'roles', $5::text[]
  )) RETURNING id;`;
    const query = {
      text: insert,
      values: [
        info.email,
        info.firstName,
        info.lastName,
        info.password,
        info.roles,
        restrictedVal,
      ],
    };
    const { rows } = await pool.query(query);
    return {
      id: rows[0].id,
      email: info.email,
      name: { first: info.firstName, last: info.lastName },
      roles: info.roles,
      restricted: restrictedVal,
    };
  }

  public async deleteAccount(id: UUID): Promise<boolean> {
    const del = `DELETE FROM account WHERE (id=$1)`;
    const query = {
      text: del,
      values: [id],
    };

    await pool.query(query);
    return true;
  }

  public async deleteAccountByEmail(email: string): Promise<boolean> {
    const del = `DELETE FROM account WHERE (email=$1)`;
    const query = {
      text: del,
      values: [email],
    };

    await pool.query(query);
    return true;
  }

  private async modifyRestricted(
    byWhat: "id" | "email",
    setTo: boolean,
    byValue: UUID | Email
  ) {
    const update = `UPDATE account SET restricted = $2 WHERE (${byWhat}=$1)`;
    const query = {
      text: update,
      values: [byValue, setTo],
    };
    await pool.query(query);
    return true;
  }

  public async suspendAccount(id: UUID): Promise<boolean> {
    return await this.modifyRestricted("id", true, id);
  }

  public async resumeAccount(id: UUID): Promise<boolean> {
    return await this.modifyRestricted("id", false, id);
  }

  public async suspendAccountByEmail(email: Email): Promise<boolean> {
    return await this.modifyRestricted("email", true, email);
  }

  public async resumeAccountByEmail(email: Email): Promise<boolean> {
    return await this.modifyRestricted("email", false, email);
  }
}
