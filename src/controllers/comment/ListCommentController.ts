import { Request, Response } from "express";
import { ListCommentService } from "../../services/comment/ListCommentService.js";

export class ListCommentController {
  async handle(req: Request, res: Response) {
    const postId = req.params.postId as string;

    try {
      const service = new ListCommentService();
      const comments = await service.execute({ postId });

      return res.json(comments);
    } catch (error) {
      console.error("Erro ao listar comentários:", error);

      const message =
        error instanceof Error ? error.message : "Erro ao listar comentários";

      return res.status(400).json({ error: message });
    }
  }
}
