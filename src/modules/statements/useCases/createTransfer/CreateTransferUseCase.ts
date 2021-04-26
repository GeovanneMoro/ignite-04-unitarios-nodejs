import { inject, injectable } from "tsyringe";
import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Transfer } from "../../entities/Transfer";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ITransferRepository } from "../../repositories/ITransferRepository";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository,
    @inject("TransfersRepository")
    private transfersRepository: ITransferRepository,
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    id,
    sender_id,
    amount,
    description,
  }: ICreateTransferDTO): Promise<Transfer> {
    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
    }

    const senderStatement = await this.statementsRepository.getUserBalance({
      user_id: `${id}`,
    });

    if (senderStatement.balance < amount) {
      throw new AppError("Balance below necessary.");
    }

    const transfer = await this.transfersRepository.create({
      id,
      sender_id,
      amount,
      description,
    });

    const withdraw = await this.statementsRepository.create({
      user_id: `${id}`,
      amount,
      type: OperationType.WITHDRAW,
      description,
    });

    const deposit = this.statementsRepository.create({
      user_id: `${sender_id}`,
      amount,
      type: OperationType.DEPOSIT,
      description,
    });

    return transfer;
  }
}

export { CreateTransferUseCase };
