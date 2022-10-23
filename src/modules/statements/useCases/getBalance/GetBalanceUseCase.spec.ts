import "reflect-metadata"
import { GetBalanceUseCase } from "./GetBalanceUseCase"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase"

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { AppError } from "../../../../shared/errors/AppError";
import { GetBalanceError } from "./GetBalanceError"
import { CreateStatementError } from "../createStatement/CreateStatementError"

let statementRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("List balances", () => {
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

    getBalanceUseCase = new GetBalanceUseCase(
      statementRepositoryInMemory,
      usersRepositoryInMemory
    );
  })

  it("should be able to list all authenticated user's deposit and withdrawal operations", async () => {

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

    await createStatementUseCase.execute({
      user_id: id,
      type: OperationType.WITHDRAW,
      amount: 10.25,
      description: "Withdraw Test"
    });

    const balance = await getBalanceUseCase.execute({
      user_id: id,
    });
    
    expect(balance).toHaveProperty("balance");
    expect(balance.balance).toEqual(90.00);
  });

  it("should not be able to list all deposit and withdrawal operations of invalid user", async () => {

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
  
      await createStatementUseCase.execute({
        user_id: id,
        type: OperationType.DEPOSIT,
        amount: 100.25,
        description: "Deposit Test"
      });  

      const idInvalid = "testeuser"
      
      await getBalanceUseCase.execute({
        user_id: idInvalid,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
  
});