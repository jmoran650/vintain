import supertest from 'supertest';
import * as http from 'http';

import * as db from './db';
import { createApp } from '../index'; // This should be your listing service entry point

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

let createdListingId = '';

// Example test: get listing by ID that exists in test data
it('Can get listing by ID', async () => {
  // This ID should exist in your testdata/data.sql for listings
  const existingId = '00000000-b7a7-4100-8b2d-309908b444f5';
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        listing(input: "${existingId}") {
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
      expect(res.body.data.listing.brand).toBe('TestBrand');
      expect(res.body.data.listing.name).toBe('TestName');
      expect(res.body.data.listing.description).toBe('A test description');
      expect(Array.isArray(res.body.data.listing.imageUrls)).toBe(true);
    });
});

it('Cant get listing by non-existent ID', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        listing(input: "10000000-b7a7-4100-8b2d-309908b444f5") {
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

it('Can get all listings', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        allListings {
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
      expect(res.body.data.allListings.length).toBeGreaterThan(0);
      // Check one of them for sanity
      const firstListing = res.body.data.allListings[0];
      expect(firstListing.id).toBeDefined();
    });
});

it('Can create a new listing', async () => {
  await supertest(server)
    .post('/graphql')
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
      expect(listing.ownerId).toBe('c3769cbf-4c90-4487-bc5e-476d065b8073');
      expect(listing.brand).toBe('NewBrand');
      expect(listing.name).toBe('NewItem');
      expect(listing.description).toBe('Brand new test item');
      expect(listing.imageUrls.length).toBe(2);
      createdListingId = listing.id;
    });
});

it('Can delete listing', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation delete {
        deleteListing(input: "${createdListingId}")
      }`,
    })
    .expect(200)
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.deleteListing).toBe(true);
    });
});

it('Deleted listing should no longer exist', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        listing(input: "${createdListingId}") {
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