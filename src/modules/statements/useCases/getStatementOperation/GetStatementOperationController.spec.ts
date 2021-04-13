import request from "supertest";
import jwt from "jsonwebtoken";
import { v4 as uuidV4 } from "uuid";

import { Connection, createConnection } from "typeorm";

import authConfig from "../../../../config/auth";
import { app } from "../../../../app";

describe("Get Statement Operation Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get one statement operation", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Geovanne",
      email: "geovannemoro@hotmail.com",
      password: "123456",
    });

    const responseAuthentication = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "geovannemoro@hotmail.com", password: "123456" });

    const { user, token } = responseAuthentication.body;

    const statement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 600,
        description: "statement test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get(`/api/v1/statements/${statement.body.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body.type).toBe("deposit");
    expect(response.body.amount).toBe("600.00");
    expect(response.body.description).toBe("statement test");
  });

  it("should no be able to get one statement operation if it user not exists", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Geovanne",
      email: "geovannemoro@hotmail.com",
      password: "123456",
    });

    const responseAuthentication = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "geovannemoro@hotmail.com", password: "123456" });

    const { user, token } = responseAuthentication.body;

    const statement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 600,
        description: "statement test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get(`/api/v1/statements/${statement.body.id}`)
      .set({
        Authorization: `Bearer ${token}-invalid`,
      });

    expect(response.status).toBe(401);
  });

  it("should no be able to get one statement operation if it statement operation not exists", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Geovanne",
      email: "geovannemoro@hotmail.com",
      password: "123456",
    });

    const responseAuthentication = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "geovannemoro@hotmail.com", password: "123456" });

    const { user, token } = responseAuthentication.body;

    const response = await request(app)
      .get(`/api/v1/statements/${uuidV4()}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
