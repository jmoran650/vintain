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

  // Use a mutation to log in (instead of a query)
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

let createdMessageId = "";
const existingItemOwnerId = "00000000-0000-0000-0000-000000000010";
const existingSenderId = "00000000-0000-0000-0000-000000000002";

describe("Message Resolver Tests", () => {
  it("Can create a new message", async () => {
    const res = await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
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
        }`
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

  it("Can get message by ID", async () => {
    const res = await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          message(input: "${createdMessageId}") {
            id
            itemOwnerId
            senderId
            content
          }
        }`
      })
      .expect(200);
    expect(res.body.errors).toBeUndefined();
    const msg = res.body.data.message;
    expect(msg.id).toBe(createdMessageId);
    expect(msg.itemOwnerId).toBe(existingItemOwnerId);
    expect(msg.senderId).toBe(existingSenderId);
    expect(msg.content).toBe("Hello, is this item still available?");
  });

  it("Can get messages by itemOwnerId", async () => {
    const res = await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          messagesByItemOwner(input: "${existingItemOwnerId}") {
            id
            itemOwnerId
            senderId
            content
          }
        }`
      })
      .expect(200);
    expect(res.body.errors).toBeUndefined();
    const msgs = res.body.data.messagesByItemOwner;
    expect(Array.isArray(msgs)).toBe(true);
    expect(msgs.length).toBeGreaterThan(0);
    expect(msgs.some((m: any) => m.id === createdMessageId)).toBe(true);
  });

  it("Can get messages by senderId", async () => {
    const res = await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          messagesBySender(input: "${existingSenderId}") {
            id
            itemOwnerId
            senderId
            content
          }
        }`
      })
      .expect(200);
    expect(res.body.errors).toBeUndefined();
    const msgs = res.body.data.messagesBySender;
    expect(Array.isArray(msgs)).toBe(true);
    expect(msgs.length).toBeGreaterThan(0);
    expect(msgs.some((m: any) => m.id === createdMessageId)).toBe(true);
  });

  it("Cant get message by non-existent ID", async () => {
    const res = await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          message(input: "10000000-0000-0000-0000-000000000000") {
            id
            itemOwnerId
            senderId
            content
          }
        }`
      })
      .expect(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("Can delete message", async () => {
    const res = await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation del {
          deleteMessage(input: "${createdMessageId}")
        }`
      })
      .expect(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deleteMessage).toBe(true);
  });

  it("Deleted message should no longer exist", async () => {
    const res = await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query get {
          message(input: "${createdMessageId}") {
            id
            itemOwnerId
            senderId
            content
          }
        }`
      })
      .expect(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});