import "reflect-metadata"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase"

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { AppError } from "../../../../shared/errors/AppError";
import { CreateStatementError } from "../createStatement/CreateStatementError"
import { GetStatementOperationError } from "./GetStatementOperationError";

let statementRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("List Statement", () => {
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

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementRepositoryInMemory
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

    const statement = await createStatementUseCase.execute({
      user_id: id,
      type: OperationType.WITHDRAW,
      amount: 10.25,
      description: "Withdraw Test"
    });

    const statement_id = statement.id;

    if(!statement_id) {
      throw new GetStatementOperationError.StatementNotFound();
    }

    const statementList = await getStatementOperationUseCase.execute({
      user_id: id,
      statement_id
    });
    
    expect(statementList).toHaveProperty("type");

  });

  it("should not be able to list all authenticated user's deposit and withdrawal operations with invalid statament", async () => {

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
  
      const statement = await createStatementUseCase.execute({
        user_id: id,
        type: OperationType.DEPOSIT,
        amount: 100.25,
        description: "Deposit Test"
      });  

      const statement_id = statement.id;
      
      if(!statement_id) {
        throw new GetStatementOperationError.StatementNotFound();
      }
      
      const idInvalid = "testeuser"

      await getStatementOperationUseCase.execute({
        user_id: id,
        statement_id: idInvalid
      });
      
    }).rejects.toBeInstanceOf(AppError);
  });
  
});