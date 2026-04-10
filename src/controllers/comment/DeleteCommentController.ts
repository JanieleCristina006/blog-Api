import { Request, Response } from "express";
import { DeleteCommentService } from "../../services/comment/DeleteCommentService.js";

export class DeleteCommentController {
  async handle(req: Request, res: Response) {
    const commentId = req.params.commentId as string;

    try {
      const service = new DeleteCommentService();
      const result = await service.execute({ commentId });

      return res.json(result);
    } catch (error) {
      console.error("Erro ao deletar comentário:", error);

      const message =
        error instanceof Error ? error.message : "Erro ao deletar comentário";

      return res.status(400).json({ error: message });
    }
  }
}
