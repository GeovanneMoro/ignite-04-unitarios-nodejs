import request from "supertest";
import jwt from "jsonwebtoken";

import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";
import auth from "../../../../config/auth";
import { User } from "../../entities/User";

describe("Authenticate User Controller", () => {
  let connection: Connection;

  interface ITokenUser {
    user: User;
    token: string;
  }

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to init a new session", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Geovanne",
      email: "geovannemoro@hotmail.com",
      password: "123456",
    });

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "geovannemoro@hotmail.com", password: "123456" });

    const { user, token } = response.body;

    const decoded = jwt.verify(token, auth.jwt.secret) as ITokenUser;

    expect(user).toHaveProperty("id");
    expect(user).not.toHaveProperty("password");
    expect(user.name).toEqual("Geovanne");
    expect(user.email).toEqual("geovannemoro@hotmail.com");

    expect(decoded.user).toHaveProperty("id");
    expect(decoded.user).toHaveProperty("password");
    expect(decoded.user.name).toEqual("Geovanne");
    expect(decoded.user.email).toEqual("geovannemoro@hotmail.com");
  });

  it("should not be able to init a session with a incorrect email", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "geovannemoro-incorrect@hotmail.com",
      password: "123456",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to init a session with a incorrect password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "geovannemoro@hotmail.com",
      password: "123456-incorrect",
    });

    expect(response.status).toBe(401);
  });
});
