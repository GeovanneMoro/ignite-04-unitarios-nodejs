import request from "supertest";

import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

describe("Create user controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "geovanne",
      email: "geovannemoro@hotmail.com",
      password: "123456",
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a user if it exists", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "geovanne",
      email: "geovannemoro@hotmail.com",
      password: "123456",
    });

    expect(response.status).toBe(400);
  });
});
