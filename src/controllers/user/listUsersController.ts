import { Request, Response } from "express";
import ListUsersService from "../../services/user/listUsersService.js";

class ListUsersController {
  async handle(req: Request, res: Response) {
    const service = new ListUsersService();

    try {
      const users = await service.execute();
      return res.json(users);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
}

export default ListUsersController;
