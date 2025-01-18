// file: Backend/src/order/test/order.test.ts
import * as http from "http";
import supertest from "supertest";
import { createApp } from "../../../index";
import { resetForDomain, shutdown } from "../../../test/dbTest";

/**
 * We'll store created order IDs here so we can test updates/deletions.
 */
let orderId = "";

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

beforeAll(async () => {
  // 1) Clear + seed domain’s DB (recreates the "order" table, etc.)
  await resetForDomain("orders");

  // 2) Start the app on a random port
  const app = await createApp();
  server = http.createServer(app);
  server.listen(0);
}, 10000);

afterAll((done) => {
  // Shut down the shared DB pool + close server
  shutdown(() => {
    server.close(done);
  });
});

describe("Order Tests", () => {
  it("Can create a new order", async () => {
    const buyerId = "00000000-b7a7-4100-8b2d-309908b444f5";
    const sellerId = "c3769cbf-4c90-4487-bc5e-476d065b8073";
    const itemId = '33333333-aaaa-bbbb-cccc-444444444444'
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

        orderId = created.id; // Store for subsequent tests
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
      .send({ query: mutation })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        // updateOrderStatus returns boolean
        expect(res.body.data.updateOrderStatus).toBe(true);
      });

    // Verify that shippingStatus is indeed updated
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
      .send({ query })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        const orders = res.body.data.allOrders;
        expect(Array.isArray(orders)).toBe(true);
        // We expect at least 1, the one we created
        expect(orders.length).toBeGreaterThan(0);
        // Check that our created order is in there
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
      .send({ query: mutation })
      .expect(200)
      .then((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.deleteOrder).toBe(true);
      });

    // Check that the order no longer exists
    const checkQuery = `
      query check {
        order(id: "${orderId}") {
          id
        }
      }
    `;
    await supertest(server)
      .post("/graphql")
      .send({ query: checkQuery })
      .expect(200)
      .then((res) => {
        // Now it should have an error because the order doesn't exist
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThan(0);
      });
  });
});