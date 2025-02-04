// tests/domains/auth/check.test.ts

import { gql, request } from "graphql-request";
import * as http from "http";
import { AddressInfo } from "net";
import { createApp } from "../../../index";
import { resetGlobal, shutdown } from "../common/db/reset";

let server: http.Server;
let endpoint: string;

beforeAll(async () => {
  await resetGlobal();
  const app = await createApp();
  server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const address = server.address() as AddressInfo;
      endpoint = `http://localhost:${address.port}/graphql`;
      resolve();
    });
  });
}, 10000);

afterAll((done) => {
  shutdown(() => server.close(done));
});

interface LoginForCheckResponse {
  login: {
    id: string;
    accessToken: string;
  };
}

interface CheckResponse {
  check: {
    id: string;
  };
}

describe("AuthService check", () => {
  let accessToken: string;
  beforeAll(async () => {
    const loginQuery = gql`
      mutation Login($input: Credentials!) {
        login(input: $input) {
          id
          accessToken
        }
      }
    `;
    const variables = {
      input: { email: "test@example.com", password: "password" },
    };
    const response = await request<LoginForCheckResponse>(
      endpoint,
      loginQuery,
      variables
    );
    accessToken = response.login.accessToken;
  });

  it("should return an account id with a valid token", async () => {
    const checkQuery = gql`
      query Check($input: String!) {
        check(input: $input) {
          id
        }
      }
    `;
    const checkVars = { input: accessToken };

    const checkResponse = await request<CheckResponse>(
      endpoint,
      checkQuery,
      checkVars,
      { authorization: `Bearer ${accessToken}` }
    );

    expect(checkResponse.check.id).toBeTruthy();
  });
});