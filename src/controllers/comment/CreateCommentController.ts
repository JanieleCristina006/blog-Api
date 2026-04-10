import { Request, Response } from "express";
import { CreateCommentService } from "../../services/comment/CreateCommentService.js";

export class CreateCommentController {
  async handle(req: Request, res: Response) {
    const { content, parentId } = req.body;
    const postId = req.params.postId as string;
    const userId = (req as any).user_id as string;

    try {
      const service = new CreateCommentService();
      const comment = await service.execute({
        content,
        postId,
        userId,
        parentId,
      });

      return res.status(201).json(comment);
    } catch (error) {
      console.error("Erro ao criar comentário:", error);

      const message =
        error instanceof Error ? error.message : "Erro ao criar comentário";

      return res.status(400).json({ error: message });
    }
  }
}
