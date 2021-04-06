import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show User Profile", () => {
  let usersRepositoryInMemory: InMemoryUsersRepository;
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let createUserUseCase: CreateUserUseCase;

  beforeAll(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory
    );
  });

  it("should be able to show user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "Geovanne",
      email: "geovannemoro@hotmail.com",
      password: "123456",
    });

    const profile = await showUserProfileUseCase.execute(user.id as string);
    expect(profile).toHaveProperty("id");
    expect(profile).toHaveProperty("password");
  });

  it("should not be able to show user profile if it not exists", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("");
    }).rejects.toBeInstanceOf(AppError);
  });
});
