import "reflect-metadata"
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase"

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { AppError } from "../../../../shared/errors/AppError";
import { CreateStatementError } from "./CreateStatementError"

let statementRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create user profile", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase =  new CreateUserUseCase(
      usersRepositoryInMemory
    );
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
    statementRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementRepositoryInMemory
    );
  })

  it("should be able to create a new deposit", async () => {

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
      throw new CreateStatementError.UserNotFound();
    }

    const statement = await createStatementUseCase.execute({
      user_id: id,
      type: OperationType.DEPOSIT,
      amount: 100.25,
      description: "Deposit Test"
    });

    expect(statement.type).toEqual("deposit");
    expect(statement.amount).toEqual(100.25);
  });

  it("should not be able to create a new deposit with user invalid", async () => {

    expect( async () => {
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
        throw new CreateStatementError.UserNotFound();
      }
  
      const idInvalid = "testeuser"
      const statement = await createStatementUseCase.execute({
        user_id: idInvalid,
        type: OperationType.DEPOSIT,
        amount: 100.25,
        description: "Deposit Test"
      });      
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to create a new withdraw", async () => {

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
      throw new CreateStatementError.UserNotFound();
    }
    
    await createStatementUseCase.execute({
      user_id: id,
      type: OperationType.DEPOSIT,
      amount: 100.25,
      description: "Deposit Test"
    });  

    const statement = await createStatementUseCase.execute({
      user_id: id,
      type: OperationType.WITHDRAW,
      amount: 10.25,
      description: "Withdraw Test"
    });

    expect(statement.type).toEqual("withdraw");
    expect(statement.amount).toEqual(10.25);
  });
 
  it("should not be able to create a new withdrawal without sufficient balance", async () => {

    expect( async () => {
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
        throw new CreateStatementError.UserNotFound();
      }
  
      const idInvalid = "testeuser"
      
      await createStatementUseCase.execute({
        user_id: idInvalid,
        type: OperationType.DEPOSIT,
        amount: 10.25,
        description: "Deposit Test"
      });     
      
      await createStatementUseCase.execute({
        user_id: id,
        type: OperationType.WITHDRAW,
        amount: 100.25,
        description: "Withdraw Test"
      });

    }).rejects.toBeInstanceOf(AppError);
  });
  
});