import { Request, Response } from "express";
import { DeleteLikeService } from "../../services/like/DeleteLikeService.js";

export class DeleteLikeController {
  async handle(req: Request, res: Response) {
    const postId = req.params.postId as string;
    const userId = (req as any).user_id as string;

    try {
      const service = new DeleteLikeService();
      const result = await service.execute({ postId, userId });

      return res.json(result);
    } catch (error) {
      console.error("Erro ao remover curtida:", error);

      const message =
        error instanceof Error ? error.message : "Erro ao remover curtida";

      return res.status(400).json({ error: message });
    }
  }
}
