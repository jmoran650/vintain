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

let createdMessageId = '';
const existingItemOwnerId = '00000000-b7a7-4100-8b2d-309908b444f5'; // Adjust as needed
const existingSenderId = 'c3769cbf-4c90-4487-bc5e-476d065b8073'; // Adjust as needed

it('Can create a new message', async () => {
  const res = await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation create {
        createMessage(input: {
          itemOwnerId: "${existingItemOwnerId}",
          senderId: "${existingSenderId}",
          content: "Hello, is this item still available?"
        }) {
          id
          itemOwnerId
          senderId
          content
        }
      }`,
    })
    .expect(200);

  expect(res.body.errors).toBeUndefined();
  const msg = res.body.data.createMessage;
  expect(msg.id).toBeDefined();
  expect(msg.itemOwnerId).toBe(existingItemOwnerId);
  expect(msg.senderId).toBe(existingSenderId);
  expect(msg.content).toBe("Hello, is this item still available?");
  createdMessageId = msg.id;
});

it('Can get message by ID', async () => {
  const res = await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        message(input: "${createdMessageId}") {
          id
          itemOwnerId
          senderId
          content
        }
      }`,
    })
    .expect(200);

  expect(res.body.errors).toBeUndefined();
  const msg = res.body.data.message;
  expect(msg.id).toBe(createdMessageId);
  expect(msg.itemOwnerId).toBe(existingItemOwnerId);
  expect(msg.senderId).toBe(existingSenderId);
  expect(msg.content).toBe("Hello, is this item still available?");
});

it('Can get messages by itemOwnerId', async () => {
  const res = await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        messagesByItemOwner(input: "${existingItemOwnerId}") {
          id
          itemOwnerId
          senderId
          content
        }
      }`,
    })
    .expect(200);

  expect(res.body.errors).toBeUndefined();
  const msgs = res.body.data.messagesByItemOwner;
  expect(Array.isArray(msgs)).toBe(true);
  expect(msgs.length).toBeGreaterThan(0);
  // Check if the created message is among them
  expect(msgs.some((m: any) => m.id === createdMessageId)).toBe(true);
});

it('Can get messages by senderId', async () => {
  const res = await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        messagesBySender(input: "${existingSenderId}") {
          id
          itemOwnerId
          senderId
          content
        }
      }`,
    })
    .expect(200);

  expect(res.body.errors).toBeUndefined();
  const msgs = res.body.data.messagesBySender;
  expect(Array.isArray(msgs)).toBe(true);
  expect(msgs.length).toBeGreaterThan(0);
  expect(msgs.some((m: any) => m.id === createdMessageId)).toBe(true);
});

it('Cant get message by non-existent ID', async () => {
  const res = await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        message(input: "10000000-b7a7-4100-8b2d-309908b444f5") {
          id
          itemOwnerId
          senderId
          content
        }
      }`,
    })
    .expect(200);

  expect(res.body.errors).toBeDefined();
  expect(res.body.errors.length > 0).toBe(true);
});

it('Can delete message', async () => {
  const res = await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation del {
        deleteMessage(input: "${createdMessageId}")
      }`,
    })
    .expect(200);

  expect(res.body.errors).toBeUndefined();
  expect(res.body.data.deleteMessage).toBe(true);
});

it('Deleted message should no longer exist', async () => {
  const res = await supertest(server)
    .post('/graphql')
    .send({
      query: `query get {
        message(input: "${createdMessageId}") {
          id
          itemOwnerId
          senderId
          content
        }
      }`,
    })
    .expect(200);

  expect(res.body.errors).toBeDefined();
  expect(res.body.errors.length > 0).toBe(true);
});