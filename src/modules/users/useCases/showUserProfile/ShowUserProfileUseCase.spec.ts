import "reflect-metadata"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { AppError } from "../../../../shared/errors/AppError";
import { ShowUserProfileError } from "./ShowUserProfileError"
import { v4 as uuid } from 'uuid';

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase =  new CreateUserUseCase(
      usersRepositoryInMemory
    );
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory
    )
  })

  it("should be able to show a user's profile", async () => {
    const { id } = await createUserUseCase.execute({
      name: "John Doe",
      email: "john.doe@test.com",
      password: "123456"
    });    

    await authenticateUserUseCase.execute({
      email: "john.doe@test.com",
      password: "123456"
    });
    
    if (!id) {
      throw new ShowUserProfileError();
    }
    const list = await showUserProfileUseCase.execute(id);

    expect(list).toHaveProperty("id");
    expect(list.email).toEqual("john.doe@test.com")
  });

  it("should not be able to show the profile of a user with invalid id", async () => {
    expect(async () => {
      const { id } = await createUserUseCase.execute({
        name: "John Doe",
        email: "john.doe@test.com",
        password: "123456"
      });    
  
      await authenticateUserUseCase.execute({
        email: "john.doe@test.com",
        password: "123456"
      });
      
      const id_invalido = uuid();
      await showUserProfileUseCase.execute(id_invalido);

    }).rejects.toBeInstanceOf(AppError);
  });
});