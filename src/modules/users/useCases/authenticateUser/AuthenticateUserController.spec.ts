import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a registered user", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "Test New User",
        email: "test@test.com",
        password: "123456"
      });

    const response =
      await request(app)
        .post("/api/v1/sessions")
        .send({
          email: "test@test.com",
          password: "123456"
        });

    expect(response.status).toBe(200);
  });

  it("must be able to authenticate an unregistered user", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "Test New User",
        email: "test@test.com",
        password: "123456"
      });

    const response =
      await request(app)
        .post("/api/v1/sessions")
        .send({
          email: "test@test.com",
          password: "654321"
        });

    expect(response.status).toBe(401);
  });
});