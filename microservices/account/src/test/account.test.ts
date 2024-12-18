import supertest from 'supertest';
import * as http from 'http';

import * as db from './db';
import { createApp } from '../index';

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;

beforeAll(async () => {
  const app = await createApp();
  server = http.createServer(app);
  server.listen();
  return db.reset();
}, 10000);

afterAll((done) => {
  db.shutdown(() => {
    server.close(done);
  });
});

let id = '';

it('Can get member by ID', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        account(input: "00000000-b7a7-4100-8b2d-309908b444f5") {
          id name { first last } email
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.account.email).toBe('sammy@slugmart.com');
      expect(res.body.data.account.name.first).toBe('Sammy');
      expect(res.body.data.account.name.last).toBe('Slug');
    });
});

it('Cant get member by non-existent ID', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        account(input: "10000000-b7a7-4100-8b2d-309908b444f5") {
          id name { first last } email
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length > 0).toBe(true);
      // no valid data expected
    });
});

it('Can get member by email', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        accountByEmail(input: "sammy@slugmart.com") {
          id name { first last } email
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.accountByEmail.email).toBe('sammy@slugmart.com');
      expect(res.body.data.accountByEmail.name.first).toBe('Sammy');
      expect(res.body.data.accountByEmail.name.last).toBe('Slug');
    });
});

it('Cant get member by non-existent email', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        accountByEmail(input: "noEmail@slugmart.com") {
          id name { first last } email
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length > 0).toBe(true);
    });
});

it('Can make account', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation m {
        makeAccount(input: {email:"SlugAdmin@mart.com", password:"abc", firstName:"Slug", lastName:"min", roles:["Admin", "Shopper"]}) {
          id
          email
          name { first last }
          roles
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.makeAccount.email).toBe('slugadmin@mart.com');
      expect(res.body.data.makeAccount.name.first).toBe('Slug');
      expect(res.body.data.makeAccount.name.last).toBe('min');
      id = res.body.data.makeAccount.id;
    });
});

it('Cant make account with same email address', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation m {
        makeAccount(input: {email:"SlugAdmin@mart.com", password:"abc", firstName:"Slug", lastName:"min", roles:["Admin", "Shopper"]}) {
          id
          email
          name { first last }
          roles
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length > 0).toBe(true);
    });
});

it('Can delete account', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation delete {
        deleteAccount(input: "${id}")
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.deleteAccount).toBe(true); // Assuming deleteAccount returns true on success
    });
});

it('Member should no longer exist', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        account(input: "${id}") {
          id name { first last } email
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length > 0).toBe(true);
    });
});

it('Make another account', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation m {
        makeAccount(input: {email:"SlugAdmin@mart.com", password:"abc", firstName:"Slug", lastName:"min", roles:["Admin", "Shopper"]}) {
          id
          email
          name { first last }
          roles
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.makeAccount.email).toBe('slugadmin@mart.com');
      expect(res.body.data.makeAccount.name.first).toBe('Slug');
      expect(res.body.data.makeAccount.name.last).toBe('min');
      id = res.body.data.makeAccount.id;
    });
});

it('Can delete account by email', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation delete {
        deleteAccountByEmail(input: "SlugAdmin@mart.com")
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.deleteAccountByEmail).toBe(true); // Assuming returns true on success
    });
});

it('Member should no longer exist (by email)', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        accountByEmail(input: "slugAdmin@mart.com") {
          id name { first last } email
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length > 0).toBe(true);
    });
});

it('Make another account (again)', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation m {
        makeAccount(input: {email:"SlugAdmin@mart.com", password:"abc", firstName:"Slug", lastName:"min", roles:["Admin", "Shopper"]}) {
          id
          email
          name { first last }
          roles
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.makeAccount.email).toBe('slugadmin@mart.com');
      expect(res.body.data.makeAccount.name.first).toBe('Slug');
      expect(res.body.data.makeAccount.name.last).toBe('min');
      id = res.body.data.makeAccount.id;
    });
});

it('Can suspend account by ID', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation suspend {
        suspendAccount(input: "${id}")
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.suspendAccount).toBe(true); // Assuming returns true on success
    });
});

it('Account should be suspended', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        account(input: "${id}") {
          id name { first last } email restricted
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.account.restricted).toBe(true);
    });
});

it('Can resume account by ID', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation resume {
        resumeAccount(input: "${id}")
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.resumeAccount).toBe(true); // Assuming returns true on success
    });
});

it('Account should not be suspended', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        account(input: "${id}") {
          id name { first last } email restricted
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.account.restricted).toBe(false);
    });
});

///// Now by email

it('Can suspend account by email', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation suspend {
        suspendAccountByEmail(input: "slugadmin@mart.com")
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.suspendAccountByEmail).toBe(true); // Assuming returns true on success
    });
});

it('Account should be suspended (by email)', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        accountByEmail(input: "slugadmin@mart.com") {
          id name { first last } email restricted
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.accountByEmail.restricted).toBe(true);
    });
});

it('Can resume account by email', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation resume {
        resumeAccountByEmail(input: "slugadmin@mart.com")
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.resumeAccountByEmail).toBe(true); // Assuming returns true on success
    });
});

it('Account should not be suspended (by email)', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        accountByEmail(input: "slugadmin@mart.com") {
          id name { first last } email restricted
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.accountByEmail.restricted).toBe(false);
    });
});

it('Make vendor account', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation m {
        makeAccount(input: {email:"vendor@test.com", password:"abc", firstName:"Slug", lastName:"min", roles:["Vendor"]}) {
          id
          email
          name { first last }
          roles
          restricted
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.makeAccount.email).toBe('vendor@test.com');
      expect(res.body.data.makeAccount.name.first).toBe('Slug');
      expect(res.body.data.makeAccount.name.last).toBe('min');
      expect(res.body.data.makeAccount.restricted).toBe(true);
      id = res.body.data.makeAccount.id;
    });
});

it('Can get all accounts', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query g {
        allAccounts {
          id email name { first last } roles restricted
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      console.log('RES GET ALL ACCOUNTSA:', res.body);
      expect(res.body.data.allAccounts.length).toBeGreaterThan(0);
    });
});