import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app)
      .post("/api/v1/users")
      .send({
        name: "Test New User",
        email: "test@test.com",
        password: "123456"
      });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to register a new statements of deposit", async () => {
    const session = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "test@test.com",
        password: "123456"
      });

    const { token } = session.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });
      
    expect(response.status).toBe(200);
  });
});