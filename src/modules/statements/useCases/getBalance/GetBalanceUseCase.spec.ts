import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryTransfersRepository } from "../../repositories/in-memory/inMemoryTransfersRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

describe("Get Balance Use Case", () => {
  const depositAmount = 1000;
  const withdrawAmount = 500;

  enum OperationType {
    DEPOSIT = "deposit",
    WITHDRAW = "withdraw",
  }

  const userData: ICreateUserDTO = {
    name: "Test User",
    email: "user@test.com",
    password: "test123",
  };

  let transfersRepositoryInMemory: InMemoryTransfersRepository;
  let statementsRepositoryInMemory: InMemoryStatementsRepository;
  let usersRepositoryInMemory: InMemoryUsersRepository;

  let createUserUseCase: CreateUserUseCase;
  let createStatementUseCase: CreateStatementUseCase;
  let getBalanceUseCase: GetBalanceUseCase;

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
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );
  });

  it("must be able to get balance per existing user using the user ID", async () => {
    const user = await createUserUseCase.execute(userData);

    await createStatementUseCase.execute({
      type: OperationType.DEPOSIT,
      user_id: `${user.id}`,
      amount: depositAmount,
      description: "deposit test",
    });

    await createStatementUseCase.execute({
      type: OperationType.WITHDRAW,
      user_id: `${user.id}`,
      amount: withdrawAmount,
      description: "withdraw test",
    });

    const { balance } = await getBalanceUseCase.execute({
      user_id: `${user.id}`,
    });

    expect(balance).toBe(depositAmount - withdrawAmount);
  });

  it("should no be able to get balance if it user not exists", async () => {
    await expect(
      async () => await getBalanceUseCase.execute({ user_id: "not exists" })
    ).rejects.toBeInstanceOf(GetBalanceError);
  });
});
