import { Request, Response } from "express";
import { ListPostService } from "../../services/post/ListPostService.js";

export class ListPostController {
  async handle(req: Request, res: Response) {
    try {
      const service = new ListPostService();
      const data = await service.execute();

      return res.json(data);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Erro ao listar posts",
      });
    }
  }
}
