import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryTransfersRepository } from "../../repositories/in-memory/inMemoryTransfersRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

describe("Get Statement Operation Use Case", () => {
  enum OperationType {
    DEPOSIT = "deposit",
    WITHDRAW = "withdraw",
  }

  const statementData: ICreateStatementDTO = {
    user_id: "",
    amount: 0,
    description: "Statement Test",
    type: OperationType.DEPOSIT,
  };

  const userData: ICreateUserDTO = {
    name: "Test User",
    email: "user@test.com",
    password: "test123",
  };

  let transfersRepositoryInMemory: InMemoryTransfersRepository;
  let usersRepositoryInMemory: InMemoryUsersRepository;
  let statementsRepositoryInMemory: InMemoryStatementsRepository;

  let createUserUseCase: CreateUserUseCase;
  let createStatementUseCase: CreateStatementUseCase;
  let getStatementOperationUseCase: GetStatementOperationUseCase;

  beforeEach(() => {
    transfersRepositoryInMemory = new InMemoryTransfersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository(
      transfersRepositoryInMemory
    );
    usersRepositoryInMemory = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should be able to get one statement operation", async () => {
    const user = await createUserUseCase.execute(userData);
    const statement = await createStatementUseCase.execute({
      ...statementData,
      user_id: `${user.id}`,
    });

    const getOperation = await getStatementOperationUseCase.execute({
      user_id: `${user.id}`,
      statement_id: `${statement.id}`,
    });

    expect(getOperation).toHaveProperty("id");
    expect(getOperation).toHaveProperty("user_id");
    expect(getOperation.id).toBe(statement.id);
    expect(getOperation.user_id).toBe(user.id);
    expect(getOperation.type).toBe(statementData.type);
    expect(getOperation.amount).toBe(statementData.amount);
    expect(getOperation.description).toBe(statementData.description);
  });

  it("should no be able to get one statement operation if it user not exists", async () => {
    const user = await createUserUseCase.execute(userData);
    const statement = await createStatementUseCase.execute({
      ...statementData,
      user_id: `${user.id}`,
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: `${user.id}-invalid`,
        statement_id: `${statement.id}`,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should no be able to get one statement operation if it statement operation not exists", async () => {
    const user = await createUserUseCase.execute(userData);
    const statement = await createStatementUseCase.execute({
      ...statementData,
      user_id: `${user.id}`,
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: `${user.id}`,
        statement_id: `${statement.id}-invalid`,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
