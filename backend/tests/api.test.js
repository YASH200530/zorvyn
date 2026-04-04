const request = require("supertest");
const app = require("../src/server");
const { initDB } = require("../src/config/db");

let adminToken = "";
let db;

beforeAll(async () => {
  // Ensure the database is initialized and seeded before running API requests
  db = await initDB();
});

describe("Authentication Logic & Access Control", () => {
  
  it("should fail login with empty or wrong credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "wrongpassword",
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toMatch(/Invalid credentials/i);
  });

  it("should succeed login with valid seeded admin credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "admin",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("role", "admin");
    adminToken = res.body.token; // Save for subsequent requests
  });

  it("should block unauthenticated access to secure routes", async () => {
    const res = await request(app).get("/api/dashboard/summary");
    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toBe("Unauthorized: No token provided");
  });
});

describe("Dashboard Summary API", () => {
  it("should return mathematical aggregates for authorized users", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    // Evaluates structure returned
    expect(res.body).toHaveProperty("totalIncome");
    expect(res.body).toHaveProperty("totalExpenses");
    expect(res.body).toHaveProperty("netBalance");
    expect(res.body).toHaveProperty("categories");
    expect(res.body).toHaveProperty("recentActivity");
    expect(res.body).toHaveProperty("trends");
    expect(Array.isArray(res.body.categories)).toBe(true);
    expect(Array.isArray(res.body.trends)).toBe(true);
  });
});

describe("Records Management & Filtering API", () => {
  let createdRecordId;

  it("should allow an admin to create a new financial record", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 120.50,
        type: "expense",
        category: "Subscription",
        date: new Date().toISOString(),
        notes: "Test API Subscription"
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.amount).toEqual(120.50);
    expect(res.body.category).toEqual("Subscription");
    createdRecordId = res.body.id;
  });

  it("should flag invalid input when creating a record", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        // amount missing
        type: "expense",
        category: "Subscription",
      });

    expect(res.statusCode).toEqual(400); // Bad Request from Zod
  });

  it("should filter records properly by category", async () => {
    const res = await request(app)
      .get("/api/records?category=Subscription")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.some(r => r.id === createdRecordId)).toBe(true);
    // Make sure we don't have mismatching categories
    const allMatch = res.body.data.every(r => r.category === "Subscription");
    expect(allMatch).toBe(true);
  });

  it("should delete the created record", async () => {
    const res = await request(app)
      .delete(`/api/records/${createdRecordId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(204); // No Content successfully
  });
});

describe("User & Role Management API", () => {
  let viewerToken = "";
  const testUsername = `testviewer_${Date.now()}`;

  it("should allow an admin to create a new viewer user", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        username: testUsername,
        password: "testpassword",
        role: "viewer"
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.username).toEqual(testUsername);
    expect(res.body.role).toEqual("viewer");
  });

  it("should allow the new viewer to login and acquire a token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: testUsername,
      password: "testpassword",
    });
    expect(res.statusCode).toEqual(200);
    viewerToken = res.body.token;
  });

  it("should aggressively block the viewer from creating records", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({
        amount: 50,
        type: "income",
        category: "Test",
        date: new Date().toISOString()
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body.error).toContain("Forbidden");
  });

  it("should aggressively block the viewer from exporting records", async () => {
    const res = await request(app)
      .get("/api/records/export")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.statusCode).toEqual(403);
  });
});
