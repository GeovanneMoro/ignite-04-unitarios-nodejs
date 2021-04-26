import { Request, Response } from "express";

class CreateTransferController {
  async handle(request: Request, response: Response): Promise<Response> {
    return response.send();
  }
}

export { CreateTransferController };
