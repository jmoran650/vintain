import * as http from "http";
import supertest from "supertest";
import { createApp } from "../../../index";
import { resetGlobal, shutdown } from "../common/db/reset";

let orderId = "";
let server: http.Server;
let token = "";

beforeAll(async () => {
  await resetGlobal();
  const app = await createApp();
  server = http.createServer(app);
  server.listen(0);

  // Login to obtain a valid token for protected operations
  const loginResponse = await supertest(server)
    .post("/graphql")
    .send({
      query: `
        query login {
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

describe("Order Resolver Tests", () => {
  it("Can create a new order", async () => {
    const buyerId = "00000000-0000-0000-0000-000000000002"; // from global seed
    const sellerId = "00000000-0000-0000-0000-000000000001"; // from global seed
    const itemId = "00000000-0000-0000-0000-000000000010"; // seeded listing
    const mutation = `
      mutation create {
        createOrder(input: {
          buyerId: "${buyerId}",
          sellerId: "${sellerId}",
          itemId: "${itemId}",
          shippingStatus: PENDING,
          data: "LineItems or JSON data"
        }) {
          id
          buyerId
          sellerId
          shippingStatus
          data
        }
      }
    `;
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: mutation })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        const created = res.body.data.createOrder;
        expect(created).toBeDefined();
        expect(created.buyerId).toBe(buyerId);
        expect(created.sellerId).toBe(sellerId);
        expect(created.shippingStatus).toBe("PENDING");
        expect(created.data).toBe("LineItems or JSON data");
        orderId = created.id;
      });
  });

  it("Can fetch order by id", async () => {
    const query = `
      query get {
        order(id: "${orderId}") {
          id
          buyerId
          sellerId
          shippingStatus
          data
        }
      }
    `;
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({ query })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        const fetched = res.body.data.order;
        expect(fetched).toBeDefined();
        expect(fetched.id).toBe(orderId);
      });
  });

  it("Can update shipping status", async () => {
    const mutation = `
      mutation update {
        updateOrderStatus(id: "${orderId}", status: SHIPPED)
      }
    `;
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: mutation })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.updateOrderStatus).toBe(true);
      });
    const checkQuery = `
      query check {
        order(id: "${orderId}") {
          id
          shippingStatus
        }
      }
    `;
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: checkQuery })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.order.shippingStatus).toBe("SHIPPED");
      });
  });

  it("Can fetch all orders", async () => {
    const query = `
      query getAll {
        allOrders {
          id
          buyerId
          sellerId
          shippingStatus
        }
      }
    `;
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({ query })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        const orders = res.body.data.allOrders;
        expect(Array.isArray(orders)).toBe(true);
        expect(orders.length).toBeGreaterThan(0);
        const found = orders.find((o: any) => o.id === orderId);
        expect(found).toBeDefined();
      });
  });

  it("Can delete an order", async () => {
    const mutation = `
      mutation remove {
        deleteOrder(id: "${orderId}")
      }
    `;
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: mutation })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.deleteOrder).toBe(true);
      });
    const checkQuery = `
      query check {
        order(id: "${orderId}") {
          id
        }
      }
    `;
    await supertest(server)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: checkQuery })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThan(0);
      });
  });
});