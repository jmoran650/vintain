// src/auth/graphql/service.ts
import { Service } from "typedi";
import { pool } from "../../../db";
import * as jwt from "jsonwebtoken";
import { Credentials, Authenticated, Account, SessionAccount } from "./schema";

@Service()
export class AuthService {
  private async find(creds: Credentials): Promise<Account | undefined> {
    const select = `SELECT id, email, data->'name' as name, data->'roles' as roles FROM account 
      WHERE email = $1 AND
      (data->>'password') = crypt($2, '${process.env.CRYPT_SECRET}') AND restricted = FALSE`;
    const { rows } = await pool.query(select, [creds.email, creds.password]);
    if (rows.length !== 1) {
      return undefined;
    }
    return rows[0];
  }

  public async login(creds: Credentials): Promise<Authenticated | undefined> {
    const account = await this.find(creds);
    if (!account) {
      return undefined;
    }
    const accessToken = jwt.sign(
      {
        id: account.id,
      },
      process.env.MASTER_SECRET as string,
      { algorithm: "HS256" }
    );

    return { id: account.id, name: account.name, accessToken };
  }

  public async check(accessToken: string): Promise<SessionAccount> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        accessToken,
        process.env.MASTER_SECRET as string,
        (err, decoded) => {
          if (err) {
            return reject(err);
          }
          const account = decoded as { id: string };
          resolve({ id: account.id });
        }
      );
    });
  }
}