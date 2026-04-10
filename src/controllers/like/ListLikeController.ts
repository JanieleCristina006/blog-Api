import { Request, Response } from "express";
import { ListLikeService } from "../../services/like/ListLikeService.js";

export class ListLikeController {
  async handle(req: Request, res: Response) {
    const postId = req.params.postId as string;

    try {
      const service = new ListLikeService();
      const likes = await service.execute({ postId });

      return res.json(likes);
    } catch (error) {
      console.error("Erro ao listar curtidas:", error);

      const message =
        error instanceof Error ? error.message : "Erro ao listar curtidas";

      return res.status(400).json({ error: message });
    }
  }
}
