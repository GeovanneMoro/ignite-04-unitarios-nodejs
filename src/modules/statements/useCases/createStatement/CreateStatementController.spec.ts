import request from "supertest";
import jwt from "jsonwebtoken";
import { v4 as uuidV4 } from "uuid";

import { Connection, createConnection } from "typeorm";

import authConfig from "../../../../config/auth";
import { app } from "../../../../app";

describe("Create Statement Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new statement deposit", async () => {
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

    expect(statement.body).toHaveProperty("id");
    expect(statement.body.user_id).toEqual(user.id);
    expect(statement.body.type).toBe("deposit");
    expect(statement.body.amount).toBe(600);
    expect(statement.body.description).toBe("statement test");
  });

  it("should be able to create a new statement withdraw", async () => {
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
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 500,
        description: "statement test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statement.body).toHaveProperty("id");
    expect(statement.body.user_id).toEqual(user.id);
    expect(statement.body.type).toBe("withdraw");
    expect(statement.body.amount).toBe(500);
    expect(statement.body.description).toBe("statement test");
  });

  it("should no be able to create a new statement it if user not exists", async () => {
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
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 1000,
        description: "statement without user",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it("should no be able to create a new statement it if insufficient funds", async () => {
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

    const statement = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 1000,
        description: "statement test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statement.status).toBe(404);
  });
});
