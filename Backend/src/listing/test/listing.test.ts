import * as http from "http";
import supertest from "supertest";

import { createApp } from "../../../index"; // This should be your listing service entry point
import { resetForDomain, shutdown } from "../../../test/dbTest";

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;

beforeAll(async () => {
  // 1) Clear + seed domain's DB
  await resetForDomain("listing");

  // 2) Start the app
  const app = await createApp();
  server = http.createServer(app);
  server.listen(0);
}, 10000);

afterAll((done) => {
  shutdown(() => {
    server.close(done);
  });
});

let createdListingId = "";

// Example test: get listing by ID that exists in test data
it("Can get listing by ID", async () => {
  // This ID should exist in your testdata/data.sql for listings
  const existingId = "00000000-b7a7-4100-8b2d-309908b444f5";
  await supertest(server)
    .post("/graphql")
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
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      // Check fields as per your seed data
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
    .send({
      query: `query get {
        listing(id: "10000000-b7a7-4100-8b2d-309908b444f5") {
          id
          ownerId
          brand
          name
          description
          imageUrls
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length > 0).toBe(true);
    });
});

it("Can get all listings (paginated)", async () => {
  await supertest(server)
    .post("/graphql")
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
      `,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();

      // Now allListings is an object with { listings, totalCount }
      const data = res.body.data.allListings;
      expect(data).toBeDefined();
      expect(Array.isArray(data.listings)).toBe(true);

      // Check that we got at least one listing
      expect(data.listings.length).toBeGreaterThan(0);

      // Optionally check totalCount is a number
      expect(typeof data.totalCount).toBe("number");
      expect(data.totalCount).toBeGreaterThan(0);

      // Check a field on the first listing
      const firstListing = data.listings[0];
      expect(firstListing.id).toBeDefined();
      expect(firstListing.brand).toBeDefined();
    });
});

it("Can create a new listing", async () => {
  await supertest(server)
    .post("/graphql")
    .send({
      query: `mutation create {
        createListing(input: {
          ownerId: "c3769cbf-4c90-4487-bc5e-476d065b8073",
          brand: "NewBrand",
          name: "NewItem",
          description: "Brand new test item",
          imageUrls: ["http://example.com/image1.jpg","http://example.com/image2.jpg"]
        }) {
          id
          ownerId
          brand
          name
          description
          imageUrls
        }
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      const listing = res.body.data.createListing;
      expect(listing.id).toBeDefined();
      expect(listing.ownerId).toBe("c3769cbf-4c90-4487-bc5e-476d065b8073");
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
    .send({
      query: `mutation delete {
        deleteListing(id: "${createdListingId}")
      }`,
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
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length > 0).toBe(true);
    });
});

/**
 * 7) Search for listings by partial brand
 * Assuming your seed data includes a brand "TestBrand", we can search "test"
 * and expect to find at least one result.
 */
it("Can search for listings by partial brand", async () => {
  await supertest(server)
    .post("/graphql")
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
      `,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();

      const data = res.body.data.searchListings;
      expect(data).toBeDefined();
      // We expect at least the "TestBrand" item
      expect(data.totalCount).toBeGreaterThan(0);
      expect(data.listings.length).toBeGreaterThan(0);

      // Check that brand includes 'TestBrand' or something similar
      // (assuming your test data includes that brand)
      const first = data.listings[0];
      expect(first.brand.toLowerCase()).toContain("test");
    });
});

/**
 * 8) Search returns empty when no matches
 */
it("Returns empty search results if no listing matches", async () => {
  await supertest(server)
    .post("/graphql")
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
      `,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      const data = res.body.data.searchListings;
      // We expect 0 matches
      expect(data.totalCount).toBe(0);
      expect(data.listings.length).toBe(0);
    });
});

/**
 * 9) Search with pagination
 * If your DB has multiple listings that match "test", 
 * you can verify that page 1, page 2, etc. behave as expected.
 */
it("Can search with pagination", async () => {
  await supertest(server)
    .post("/graphql")
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
      `,
    })
    .expect(200)
    .then(async (res) => {
      expect(res.body.errors).toBeUndefined();
      const data = res.body.data.searchListings;
      // totalCount might be > 1 if multiple listings match "test"
      expect(data.totalCount).toBeGreaterThanOrEqual(1);

      // We asked for pageSize = 1, so the listings array should be length 1 or 0
      expect(data.listings.length).toBeLessThanOrEqual(1);

      // If we want to test page 2, do a second query:
      const secondPageRes = await supertest(server)
        .post("/graphql")
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
          `,
        });
      expect(secondPageRes.body.errors).toBeUndefined();
      const secondData = secondPageRes.body.data.searchListings;
      // If totalCount > 1, page 2 might have 1 item or 0 if there's only 1 match
      if (data.totalCount > 1) {
        expect(secondData.listings.length).toBe(1);
      } else {
        expect(secondData.listings.length).toBe(0);
      }
    });
});
