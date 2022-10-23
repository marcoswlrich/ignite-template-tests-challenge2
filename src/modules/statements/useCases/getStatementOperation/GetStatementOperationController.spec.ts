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

  it("should be able to list statements of the user", async () => {
    const session = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "test@test.com",
        password: "123456"
      });

    const { token } = session.body;

    const statements = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100.50,
        description: "Deposito Teste"
      }).set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get(`/api/v1/statements/${statements.body.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });
});