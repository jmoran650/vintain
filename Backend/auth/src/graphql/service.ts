import { pool } from "../db";
import * as jwt from "jsonwebtoken";
import { Credentials, Authenticated, Account, SessionAccount } from "./schema";
import { randomUUID } from "crypto";

export class AuthService {

  private async find(creds: Credentials): Promise<Account | undefined> {
    const select = `SELECT id, email, data->'name' as name, data->'roles' as roles FROM account 
    WHERE email = $1 AND
    (data->>'password') = crypt($2,'${process.env.CRYPT_SECRET}') AND restricted = FALSE`;

    const query = {
      text: select,
      values: [creds.email, creds.password],
    };

    const { rows } = await pool.query(query);

    if (rows.length != 1) {
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
      `${process.env.MASTER_SECRET}`,
      { algorithm: "HS256" }
    );
    
    return {id: account.id, name: account.name, accessToken: accessToken};
  }

  public async check(accessToken:string): Promise<SessionAccount>{
    return new Promise((resolve, reject)=>{
      try {
        jwt.verify(
          accessToken,
          `${process.env.MASTER_SECRET}`,
          (err: jwt.VerifyErrors | null,  decoded?: object | string) => {
            if(err){
              reject(err)
            }
            const account = decoded as {id: string};
            resolve({id: account.id})
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  
}
