// tests/domains/listing/listing.test.ts
import * as http from "http";
import supertest from "supertest";
import { createApp } from "../../../index";
import { resetGlobal, shutdown } from "../common/db/reset";

let server: http.Server;
let token = "";

beforeAll(async () => {
  await resetGlobal();
  const app = await createApp();
  server = http.createServer(app);
  server.listen(0);

  // Use a mutation (not a query) to log in
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
  token = loginResponse.body.data.login.accessToken;
}, 10000);

afterAll((done) => {
  shutdown(() => server.close(done));
});

let createdListingId = "";

describe("Listing Resolver Tests", () => {
  it("Can get listing by ID", async () => {
    // Use a fixed seeded listing ID from the global fixtures
    const existingId = "00000000-0000-0000-0000-000000000010";
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          listing(id: "${existingId}") {
            id
            ownerId
            brand
            name
            description
            imageUrls
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.listing.id).toBe(existingId);
        expect(res.body.data.listing.brand).toBe("TestBrand");
        expect(res.body.data.listing.name).toBe("TestName");
        expect(res.body.data.listing.description).toBe("A test description");
        expect(Array.isArray(res.body.data.listing.imageUrls)).toBe(true);
      });
  });

  it("Cant get listing by non-existent ID", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          listing(id: "10000000-0000-0000-0000-000000000000") {
            id
            ownerId
            brand
            name
            description
            imageUrls
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThan(0);
      });
  });

  it("Can get all listings (paginated)", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `
          query getAllListings {
            allListings(page: 1, pageSize: 10) {
              listings {
                id
                ownerId
                brand
                name
                description
                imageUrls
              }
              totalCount
            }
          }
        `
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        const data = res.body.data.allListings;
        expect(data).toBeDefined();
        expect(Array.isArray(data.listings)).toBe(true);
        expect(data.listings.length).toBeGreaterThan(0);
        expect(typeof data.totalCount).toBe("number");
        expect(data.totalCount).toBeGreaterThan(0);
      });
  });

  it("Can create a new listing", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation create {
          createListing(input: {
            ownerId: "00000000-0000-0000-0000-000000000001",
            brand: "NewBrand",
            name: "NewItem",
            description: "Brand new test item",
            imageUrls: ["http://example.com/image1.jpg", "http://example.com/image2.jpg"]
          }) {
            id
            ownerId
            brand
            name
            description
            imageUrls
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        const listing = res.body.data.createListing;
        expect(listing.id).toBeDefined();
        expect(listing.ownerId).toBe("00000000-0000-0000-0000-000000000001");
        expect(listing.brand).toBe("NewBrand");
        expect(listing.name).toBe("NewItem");
        expect(listing.description).toBe("Brand new test item");
        expect(listing.imageUrls.length).toBe(2);
        createdListingId = listing.id;
      });
  });

  it("Can delete listing", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation delete {
          deleteListing(id: "${createdListingId}")
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.deleteListing).toBe(true);
      });
  });

  it("Deleted listing should no longer exist", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          listing(id: "${createdListingId}") {
            id
            ownerId
            brand
            name
            description
            imageUrls
          }
        }`
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThan(0);
      });
  });

  it("Can search for listings by partial brand", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `
          query search {
            searchListings(searchTerm: "test", page: 1, pageSize: 10) {
              listings {
                id
                brand
              }
              totalCount
            }
          }
        `
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        const data = res.body.data.searchListings;
        expect(data).toBeDefined();
        expect(data.totalCount).toBeGreaterThan(0);
        expect(data.listings.length).toBeGreaterThan(0);
        const first = data.listings[0];
        expect(first.brand.toLowerCase()).toContain("test");
      });
  });

  it("Returns empty search results if no listing matches", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `
          query search {
            searchListings(searchTerm: "xyzzznotfound", page: 1, pageSize: 10) {
              listings {
                id
                brand
                name
              }
              totalCount
            }
          }
        `
      })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        const data = res.body.data.searchListings;
        expect(data.totalCount).toBe(0);
        expect(data.listings.length).toBe(0);
      });
  });

  it("Can search with pagination", async () => {
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `
          query search {
            searchListings(searchTerm: "test", page: 1, pageSize: 1) {
              listings {
                id
                brand
                name
              }
              totalCount
            }
          }
        `
      })
      .expect(200)
      .then(async (res) => {
        expect(res.body.errors).toBeUndefined();
        const data = res.body.data.searchListings;
        expect(data.totalCount).toBeGreaterThanOrEqual(1);
        expect(data.listings.length).toBeLessThanOrEqual(1);
        const secondPageRes = await supertest(server)
          .post("/graphql")
          .set("Authorization", `Bearer ${token}`)
          .send({
            query: `
              query search2 {
                searchListings(searchTerm: "test", page: 2, pageSize: 1) {
                  listings {
                    id
                    brand
                    name
                  }
                  totalCount
                }
              }
            `
          });
        expect(secondPageRes.body.errors).toBeUndefined();
        const secondData = secondPageRes.body.data.searchListings;
        if (data.totalCount > 1) {
          expect(secondData.listings.length).toBe(1);
        } else {
          expect(secondData.listings.length).toBe(0);
        }
      });
  });
});