import {pool} from '../../db';
import * as jwt from 'jsonwebtoken';
import {
  Credentials,
  Authenticated,
  Account,
  UUID,
} from './schema';
import {randomUUID} from 'crypto';

export class AuthService() {
    private async find(creds: Credentials): Promise<Account | Undefined> {
        const select = `SELECT id, email, data->'name' as name, data->'roles' as roles FROM account 
    WHERE email = $1 AND
    (data->>'password') = crypt($2,'${process.env.CRYPT_SECRET}') AND restricted = FALSE`;
    }
}