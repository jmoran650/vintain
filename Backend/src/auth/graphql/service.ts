// Backend/src/auth/graphql/service.ts
import { Service } from "typedi";
import { pool } from "../../../db";
import * as jwt from "jsonwebtoken";
import { Credentials, Authenticated, Account, SessionAccount } from "./schema";
import { logInfo, logError } from "../../common/logger";

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
    logInfo(`Login attempt for email: ${creds.email}`, "Backend/src/auth/graphql/service.ts");
    const account = await this.find(creds);
    if (!account) {
      logError(`Login failed for email: ${creds.email}`, "Backend/src/auth/graphql/service.ts");
      return undefined;
    }
    const accessToken = jwt.sign(
      { id: account.id },
      process.env.MASTER_SECRET as string,
      { algorithm: "HS256" }
    );
    logInfo(`Login successful for email: ${creds.email}`, "Backend/src/auth/graphql/service.ts");
    return { id: account.id, name: account.name, accessToken };
  }

  public async check(accessToken: string): Promise<SessionAccount> {
    logInfo(`Checking token: ${accessToken}`, "Backend/src/auth/graphql/service.ts");
    return new Promise((resolve, reject) => {
      jwt.verify(
        accessToken,
        process.env.MASTER_SECRET as string,
        (err, decoded) => {
          if (err) {
            logError(`Token check failed: ${err.message}`, "Backend/src/auth/graphql/service.ts");
            return reject(err);
          }
          const account = decoded as { id: string };
          logInfo(`Token valid for user id: ${account.id}`, "Backend/src/auth/graphql/service.ts");
          resolve({ id: account.id });
        }
      );
    });
  }
}