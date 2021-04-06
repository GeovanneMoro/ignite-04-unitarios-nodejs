import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

describe("Create a new user", () => {
  let usersRepositoryInMemory: InMemoryUsersRepository;
  let createUserUseCase: CreateUserUseCase;

  beforeAll(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Geovanne",
      email: "geovannemoro@hotmail.com",
      password: "123456",
    });

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("password");
  });

  it("should not be able to create a user if e-mail already exists", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Geovanne",
        email: "geovannemoro@hotmail.com",
        password: "123456",
      });

      await createUserUseCase.execute({
        name: "Geovanne",
        email: "geovannemoro@hotmail.com",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
