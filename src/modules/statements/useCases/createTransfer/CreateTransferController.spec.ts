import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { app } from "../../../../app";

describe("Create Transfer Controller", () => {
  let db: Connection;

  enum OperationType {
    DEPOSIT = "deposit",
    WITHDRAW = "withdraw",
  }

  interface ICreateStatementDTO {
    user_id: string;
    amount: number;
    description: string;
    type: OperationType;
  }

  const statementData: ICreateStatementDTO = {
    user_id: "",
    amount: 0,
    description: "Statement Test",
    type: OperationType.DEPOSIT,
  };

  const userDataSender: ICreateUserDTO = {
    name: "Sender User",
    email: "sender@test.com",
    password: "test123",
  };

  const userDataReceiver: ICreateUserDTO = {
    name: "Receiver User",
    email: "receiver@test.com",
    password: "test123",
  };

  beforeAll(async () => {
    db = await createConnection();
    await db.runMigrations();
  });

  afterAll(async () => {
    await db.dropDatabase();
    await db.close();
  });

  it("should be able to create a new transfer", async () => {
    await request(app).post("/api/v1/users").send(userDataSender);
    await request(app).post("/api/v1/users").send(userDataReceiver);

    const userSenderAuth = await request(app).post("/api/v1/sessions").send({
      email: userDataSender.email,
      password: userDataSender.password,
    });

    const userSenderToken = userSenderAuth.body.token;

    const userReceiverAuth = await request(app).post("/api/v1/sessions").send({
      email: userDataReceiver.email,
      password: userDataReceiver.password,
    });

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 500, description: statementData.description })
      .set({ Authorization: `Bearer ${userSenderToken}` });

    const transfer = await request(app)
      .post(`/api/v1/statements/transfer/${userReceiverAuth.body.user.id}`)
      .send({
        amount: 50,
        description: "test transfer",
      })
      .set({
        Authorization: `Bearer ${userSenderToken}`,
      });

    const balance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${userSenderToken}`,
      });

    expect(transfer.body.amount).toEqual(50);
    expect(transfer.body.description).toEqual("test transfer");
    expect(transfer.body).toHaveProperty("id");
    expect(transfer.body).toHaveProperty("sender_id");
    expect(transfer.body).toHaveProperty("transfer_id");
    expect(balance.body.balance).toEqual(450);
  });

  it("should no be able to create a new transfer if it is balance sender user below necessary", async () => {
    await request(app).post("/api/v1/users").send(userDataSender);
    await request(app).post("/api/v1/users").send(userDataReceiver);

    const userSenderAuth = await request(app).post("/api/v1/sessions").send({
      email: userDataSender.email,
      password: userDataSender.password,
    });

    const userSenderToken = userSenderAuth.body.token;

    const userReceiverAuth = await request(app).post("/api/v1/sessions").send({
      email: userDataReceiver.email,
      password: userDataReceiver.password,
    });

    const transfer = await request(app)
      .post(`/api/v1/statements/transfer/${userReceiverAuth.body.user.id}`)
      .send({
        amount: 3000,
        description: "test transfer",
      })
      .set({
        Authorization: `Bearer ${userSenderToken}`,
      });

    expect(transfer.body.message).toEqual("Balance below necessary.");
  });
});
