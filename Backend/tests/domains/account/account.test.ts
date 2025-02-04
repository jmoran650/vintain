// tests/domains/account/account.test.ts

import * as http from "http";
import supertest from "supertest";
import { createApp } from "../../../index";
import { resetGlobal, shutdown } from "../common/db/reset";

let server: http.Server;
let token = "";

beforeAll(async () => {
  // Reset the test database using global fixtures.
  await resetGlobal();
  const app = await createApp();
  server = http.createServer(app);
  server.listen(0);

  // Login (using the mutation) to get a token for protected operations.
  const loginResponse = await supertest(server)
    .post("/graphql")
    .send({
      query: `
        mutation login {
          login(input: { email: "test@example.com", password: "password" }) {
            accessToken
          }
        }
      `
    });
  if (!loginResponse.body.data || !loginResponse.body.data.login) {
    throw new Error(`Login failed. Response: ${JSON.stringify(loginResponse.body)}`);
  }
  token = loginResponse.body.data.login.accessToken;
}, 10000);

afterAll((done) => {
  // Shutdown the DB pool and then close the HTTP server.
  shutdown(() => {
    server.close(done);
  });
});

let id = "";

describe("Account Resolver Tests", () => {
  it("Can get member by ID", async () => {
    // This fixed ID is seeded via the global fixtures.
    const seededId = "00000000-0000-0000-0000-000000000001";
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          account(input: "${seededId}") {
            id
            name { first last }
            email
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.account.email).toBe("sammy@slugmart.com");
        expect(res.body.data.account.name.first).toBe("Sammy");
        expect(res.body.data.account.name.last).toBe("Slug");
      });
  });

  it("Cant get member by non-existent ID", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          account(input: "10000000-0000-0000-0000-000000000000") {
            id
            name { first last }
            email
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThan(0);
      });
  });

  it("Can get member by email", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          accountByEmail(input: "sammy@slugmart.com") {
            id
            name { first last }
            email
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.accountByEmail.email).toBe("sammy@slugmart.com");
        expect(res.body.data.accountByEmail.name.first).toBe("Sammy");
        expect(res.body.data.accountByEmail.name.last).toBe("Slug");
      });
  });

  it("Cant get member by non-existent email", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          accountByEmail(input: "noEmail@slugmart.com") {
            id
            name { first last }
            email
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThan(0);
      });
  });

  // "makeAccount" is a public operation.
  it("Can make account", async () => {
    await supertest(server)
      .post("/graphql")
      .send({
        query: `mutation m {
          makeAccount(input: {
            email: "SlugAdmin@mart.com",
            password: "abc",
            firstName: "Slug",
            lastName: "min",
            username: "slugadmin",
            roles: ["Admin", "Shopper"]
          }) {
            id
            email
            name { first last }
            roles
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.makeAccount.email).toBe("slugadmin@mart.com");
        expect(res.body.data.makeAccount.name.first).toBe("Slug");
        expect(res.body.data.makeAccount.name.last).toBe("min");
        id = res.body.data.makeAccount.id;
        expect(id).toBeTruthy();
      });
  });

  it("Cant make account with same email address", async () => {
    await supertest(server)
      .post("/graphql")
      .send({
        query: `mutation m {
          makeAccount(input: {
            email: "SlugAdmin@mart.com",
            password: "abc",
            firstName: "Slug",
            lastName: "min",
            username: "slugadmin",
            roles: ["Admin", "Shopper"]
          }) {
            id
            email
            name { first last }
            roles
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThan(0);
      });
  });

  it("Can delete account", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation delete {
          deleteAccount(input: "${id}")
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.deleteAccount).toBe(true);
      });
  });

  it("Member should no longer exist", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          account(input: "${id}") {
            id
            name { first last }
            email
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThan(0);
      });
  });

  // Re-create the account for further suspend/resume tests.
  it("Make another account", async () => {
    await supertest(server)
      .post("/graphql")
      .send({
        query: `mutation m {
          makeAccount(input: {
            email: "SlugAdmin@mart.com",
            password: "abc",
            firstName: "Slug",
            lastName: "min",
            username: "slugadmin",
            roles: ["Admin", "Shopper"]
          }) {
            id
            email
            name { first last }
            roles
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.makeAccount.email).toBe("slugadmin@mart.com");
        expect(res.body.data.makeAccount.name.first).toBe("Slug");
        expect(res.body.data.makeAccount.name.last).toBe("min");
        id = res.body.data.makeAccount.id;
        expect(id).toBeTruthy();
      });
  });

  it("Can delete account by email", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation delete {
          deleteAccountByEmail(input: "SlugAdmin@mart.com")
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.deleteAccountByEmail).toBe(true);
      });
  });

  it("Member should no longer exist (by email)", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          accountByEmail(input: "slugadmin@mart.com") {
            id
            name { first last }
            email
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThan(0);
      });
  });

  // Re-create the account again for suspend/resume tests.
  it("Make another account (again)", async () => {
    await supertest(server)
      .post("/graphql")
      .send({
        query: `mutation m {
          makeAccount(input: {
            email: "SlugAdmin@mart.com",
            password: "abc",
            firstName: "Slug",
            lastName: "min",
            username: "slugadmin",
            roles: ["Admin", "Shopper"]
          }) {
            id
            email
            name { first last }
            roles
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.makeAccount.email).toBe("slugadmin@mart.com");
        expect(res.body.data.makeAccount.name.first).toBe("Slug");
        expect(res.body.data.makeAccount.name.last).toBe("min");
        id = res.body.data.makeAccount.id;
        expect(id).toBeTruthy();
      });
  });

  it("Can suspend account by ID", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation suspend {
          suspendAccount(input: "${id}")
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.suspendAccount).toBe(true);
      });
  });

  it("Account should be suspended", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          account(input: "${id}") {
            id
            name { first last }
            email
            restricted
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.account.restricted).toBe(true);
      });
  });

  it("Can resume account by ID", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation resume {
          resumeAccount(input: "${id}")
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.resumeAccount).toBe(true);
      });
  });

  it("Account should not be suspended", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          account(input: "${id}") {
            id
            name { first last }
            email
            restricted
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.account.restricted).toBe(false);
      });
  });

  it("Can suspend account by email", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation suspend {
          suspendAccountByEmail(input: "slugadmin@mart.com")
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.suspendAccountByEmail).toBe(true);
      });
  });

  it("Account should be suspended (by email)", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          accountByEmail(input: "slugadmin@mart.com") {
            id
            name { first last }
            email
            restricted
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.accountByEmail.restricted).toBe(true);
      });
  });

  it("Can resume account by email", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation resume {
          resumeAccountByEmail(input: "slugadmin@mart.com")
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.resumeAccountByEmail).toBe(true);
      });
  });

  it("Account should not be suspended (by email)", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          accountByEmail(input: "slugadmin@mart.com") {
            id
            name { first last }
            email
            restricted
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.accountByEmail.restricted).toBe(false);
      });
  });

  it("Can get all accounts", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query g {
          allAccounts {
            id
            email
            name { first last }
            roles
            restricted
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(Array.isArray(res.body.data.allAccounts)).toBe(true);
        expect(res.body.data.allAccounts.length).toBeGreaterThan(0);
      });
  });
});