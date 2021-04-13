import request from "supertest";

import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

describe("Show User Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show user profile", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Geovanne",
      email: "geovannemoro@hotmail.com",
      password: "123456",
    });

    const responseAuthentication = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "geovannemoro@hotmail.com", password: "123456" });

    const { user, token } = responseAuthentication.body;

    const profile = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(profile.body).toHaveProperty("id");
    expect(profile.body).not.toHaveProperty("password");
    expect(profile.body.name).toEqual("Geovanne");
    expect(profile.body.email).toEqual("geovannemoro@hotmail.com");
    expect(profile.body.password).not.toEqual("123456");
  });

  it("should not be able to show user profile if it not exists", async () => {
    const profile = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer incorrect-token`,
    });

    expect(profile.status).toBe(401);
  });
});
