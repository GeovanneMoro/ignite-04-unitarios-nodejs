import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryTransfersRepository } from "../../repositories/in-memory/inMemoryTransfersRepository";
import { CreateTransferUseCase } from "./CreateTransferUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { AppError } from "../../../../shared/errors/AppError";

describe("Create Transfer Use Case", () => {
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

  let statementsRepositoryInMemory: InMemoryStatementsRepository;
  let transfersRepositoryInMemory: InMemoryTransfersRepository;
  let usersRepositoryInMemory: InMemoryUsersRepository;
  let createUserUseCase: CreateUserUseCase;
  let createTransferUseCase: CreateTransferUseCase;

  beforeEach(() => {
    transfersRepositoryInMemory = new InMemoryTransfersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository(
      transfersRepositoryInMemory
    );
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createTransferUseCase = new CreateTransferUseCase(
      statementsRepositoryInMemory,
      transfersRepositoryInMemory,
      usersRepositoryInMemory
    );
  });

  it("Should be able to create a new transfer", async () => {
    const userSender = await createUserUseCase.execute(userDataSender);
    const userReceiver = await createUserUseCase.execute(userDataReceiver);

    await statementsRepositoryInMemory.create({
      ...statementData,
      user_id: `${userSender.id}`,
      amount: 4000,
    });

    const transfer = await createTransferUseCase.execute({
      id: `${userSender.id}`,
      sender_id: `${userReceiver.id}`,
      amount: 2000,
      description: "Test transfer",
    });

    expect(transfer).toHaveProperty("transfer_id");
    expect(transfer.id).toBe(userSender.id);
    expect(transfer.sender_id).toBe(userReceiver.id);
    expect(transfer.amount).toBe(2000);
    expect(transfer.description).toBe("Test transfer");
  });

  it("the balance must correspond to the transfer made", async () => {
    const userSender = await createUserUseCase.execute(userDataSender);
    const userReceiver = await createUserUseCase.execute(userDataReceiver);

    await statementsRepositoryInMemory.create({
      ...statementData,
      user_id: `${userSender.id}`,
      amount: 6000,
    });

    await createTransferUseCase.execute({
      id: `${userSender.id}`,
      sender_id: `${userReceiver.id}`,
      amount: 2000,
      description: "Test transfer",
    });

    const senderBalance = await statementsRepositoryInMemory.getUserBalance({
      user_id: `${userSender.id}`,
    });
    const receiverBalance = await statementsRepositoryInMemory.getUserBalance({
      user_id: `${userReceiver.id}`,
    });

    expect(senderBalance.balance).toBe(4000);
    expect(receiverBalance.balance).toBe(2000);
  });

  it("should no be able to create a new transfer if it is balance sender user below necessary ", async () => {
    const userSender = await createUserUseCase.execute(userDataSender);
    const userReceiver = await createUserUseCase.execute(userDataReceiver);

    expect(async () => {
      await createTransferUseCase.execute({
        id: `${userSender.id}`,
        sender_id: `${userReceiver.id}`,
        amount: 5000,
        description: "Test transfer",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
