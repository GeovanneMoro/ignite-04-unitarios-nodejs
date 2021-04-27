import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

class CreateTransferController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;
    const { amount, description } = request.body;
    const { id: sender_id } = request.params;

    const createTransferUseCae = container.resolve(CreateTransferUseCase);
    const transfer = await createTransferUseCae.execute({
      id,
      amount,
      description,
      sender_id,
    });

    return response.status(201).json(transfer);
  }
}

export { CreateTransferController };
