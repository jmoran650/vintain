import { gql, request } from "graphql-request";

let endpoint = "";

import * as http from "http";
import { AddressInfo } from "net";

import { createApp } from "../../../index";
import { resetForDomain, shutdown } from "../../../test/dbTest";

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;

beforeAll(async () => {
  await resetForDomain("message");

  const app = await createApp();
  server = http.createServer(app);

  // Wait until the server is actually listening on an ephemeral port
  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const address = server.address() as AddressInfo;
      // Now we can construct the endpoint
      endpoint = `http://localhost:${address.port}/graphql`;
      resolve();
    });
  });
}, 10000);

afterAll((done) => {
  shutdown(() => {
    server.close(done);
  });
});

interface LoginResponse {
  login: {
    id: string;
    name: {
      first: string;
      last: string;
    };
    accessToken: string;
  };
}

describe("AuthService login", () => {
  it("should login with valid credentials", async () => {
    const query = gql`
      query Login($input: Credentials!) {
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
      input: {
        email: "test@example.com",
        password: "password",
      },
    };

    const response = await request<LoginResponse>(endpoint, query, variables);
    expect(response.login).toBeDefined();
    expect(response.login.id).toBeTruthy();
    expect(response.login.name.first).toBe("John"); // Based on seeded data
    expect(response.login.name.last).toBe("Doe");
    expect(response.login.accessToken).toBeTruthy();
  });

  it("should return an error for invalid credentials", async () => {
    const query = gql`
      query Login($input: Credentials!) {
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
      input: {
        email: "wrong@example.com",
        password: "wrongpass",
      },
    };

    await expect(
      request<LoginResponse>(endpoint, query, variables)
    ).rejects.toThrow("Invalid Credentials");
  });
});
