// tests/domains/auth/login.test.ts

import { gql, request } from "graphql-request";
import * as http from "http";
import { AddressInfo } from "net";
import { createApp } from "../../../index";
import { resetGlobal, shutdown } from "../common/db/reset";

let server: http.Server;
let endpoint = "";

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

interface LoginResponse {
  login: {
    id: string;
    name: { first: string; last: string };
    accessToken: string;
  };
}

describe("AuthService login", () => {
  it("should login with valid credentials", async () => {
    const query = gql`
      mutation Login($input: Credentials!) {
        login(input: $input) {
          id
          name {
            first
            last
          }
          accessToken
        }
      }
    `;
    const variables = {
      input: { email: "test@example.com", password: "password" },
    };
    const response = await request<LoginResponse>(endpoint, query, variables);
    expect(response.login).toBeDefined();
    expect(response.login.id).toBeTruthy();
    expect(response.login.name.first).toBe("John");
    expect(response.login.name.last).toBe("Doe");
    expect(response.login.accessToken).toBeTruthy();
  });

  it("should return an error for invalid credentials", async () => {
    const query = gql`
      mutation Login($input: Credentials!) {
        login(input: $input) {
          id
          name {
            first
            last
          }
          accessToken
        }
      }
    `;
    const variables = {
      input: { email: "wrong@example.com", password: "wrongpass" },
    };
    // Expect the promise to be rejected with an error message containing "Invalid Credentials"
    await expect(request<LoginResponse>(endpoint, query, variables))
      .rejects.toThrow(/Invalid Credentials/);
  });
});