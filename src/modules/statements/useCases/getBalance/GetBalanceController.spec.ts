import request from "supertest";
import jwt from "jsonwebtoken";
import { v4 as uuidV4 } from "uuid";

import { Connection, createConnection } from "typeorm";

import authConfig from "../../../../config/auth";
import { app } from "../../../../app";

describe("Get Balance Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("must be able to get balance per existing user using the user ID", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Geovanne",
      email: "geovannemoro@hotmail.com",
      password: "123456",
    });

    const responseAuthentication = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "geovannemoro@hotmail.com", password: "123456" });

    const { user, token } = responseAuthentication.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 900,
        description: "statement deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 500,
        description: "statement withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const getBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(getBalance.body.statement).toHaveLength(2);
    expect(getBalance.body.balance).toBe(400);
  });

  it("should no be able to get balance if it user not exists", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Geovanne",
      email: "geovannemoro@hotmail.com",
      password: "123456",
    });

    const { secret, expiresIn } = authConfig.jwt;

    const token = jwt.sign(
      {
        user: {
          name: "Geovanne",
          email: "geovannemoro@hotmail.com",
          password: "123456",
        },
      },
      secret,
      {
        subject: uuidV4(),
        expiresIn,
      }
    );

    const response = await request(app)
      .post("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
