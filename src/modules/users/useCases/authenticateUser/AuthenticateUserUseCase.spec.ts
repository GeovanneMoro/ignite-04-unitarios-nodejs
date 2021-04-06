import jwt from "jsonwebtoken";
import auth from "../../../../config/auth";
import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../entities/User";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

describe("Authenticate User", () => {
  interface ITokenUser {
    user: User;
    token: string;
  }

  let authenticateUserUseCase: AuthenticateUserUseCase;
  let usersRepositoryInMemory: InMemoryUsersRepository;
  let createUserUseCase: CreateUserUseCase;

  const userData: ICreateUserDTO = {
    name: "Geovanne",
    email: "geovannemoro@hotmail.com",
    password: "123456",
  };

  beforeAll(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to init a new session", async () => {
    await createUserUseCase.execute({
      name: "Geovanne",
      email: "geovannemoro@hotmail.com",
      password: "123456",
    });

    const { user, token } = await authenticateUserUseCase.execute({
      email: "geovannemoro@hotmail.com",
      password: "123456",
    });

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

  it("should not be able to init a new session if it user not exists", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({ email: "", password: "" });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to init a new session if e-mail is incorrect", () => {
    expect(async () => {
      await createUserUseCase.execute(userData);

      await authenticateUserUseCase.execute({
        email: "test@emailinvalid.com",
        password: userData.password,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to init a new session if password is incorrect", () => {
    expect(async () => {
      await createUserUseCase.execute(userData);

      await authenticateUserUseCase.execute({
        email: userData.email,
        password: "12345",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
