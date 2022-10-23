import "reflect-metadata"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { AppError } from "../../../../shared/errors/AppError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Authenticate Session User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase =  new CreateUserUseCase(
      usersRepositoryInMemory
    );
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
  })

  it("should be able for a user to authenticate", async () => {
    await createUserUseCase.execute({
      name: "John Doe",
      email: "john.doe@test.com",
      password: "123456"
    });    

    const session = await authenticateUserUseCase.execute({
      email: "john.doe@test.com",
      password: "123456"
    });
    
    expect(session.user.email).toEqual("john.doe@test.com");
    expect(session).toHaveProperty("token");
  });

  it("should not be possible to authenticate a user with the wrong password or email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "John Doe",
        email: "john.doe@test.com",
        password: "123456"
      });    
  
      await authenticateUserUseCase.execute({
        email: "john.doe@test.com",
        password: "654321"
      })

    }).rejects.toBeInstanceOf(AppError);
  });
});