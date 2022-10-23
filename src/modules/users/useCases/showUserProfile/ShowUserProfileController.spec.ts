import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Show User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to list profile user", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "Test Show User",
        email: "test@test.com",
        password: "123456"
      });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "123456"
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });

  it("should not be able to list user from profile with invalid session", async () => {
    const  token  = "Teste";

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(401);
  });
});
