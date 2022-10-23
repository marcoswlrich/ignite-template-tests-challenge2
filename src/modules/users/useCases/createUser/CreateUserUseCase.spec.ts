import "reflect-metadata"
import { CreateUserUseCase } from "./CreateUserUseCase"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { AppError } from "../../../../shared/errors/AppError";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create User Profile", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(
      usersRepositoryInMemory
    );
  })

  it("should be able to create a user", async () => {
    const userCreated = await createUserUseCase.execute({
      name: "John Doe",
      email: "john.doe@test.com",
      password: "123456"
    });
    expect(userCreated.name).toEqual("John Doe");
    expect(userCreated.email).toEqual("john.doe@test.com");
  });

  it("should not be able to create a user with exists email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "John Doe",
        email: "john.doe@test.com",
        password: "123456"
      });

      await createUserUseCase.execute({
        name: "John Doe 1",
        email: "john.doe@test.com",
        password: "654321"
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});