import { Request, Response } from "express";
import { CreateLikeService } from "../../services/like/CreateLikeService.js";

export class CreateLikeController {
  async handle(req: Request, res: Response) {
    const postId = req.params.postId as string;
    const userId = (req as any).user_id as string;

    try {
      const service = new CreateLikeService();
      const like = await service.execute({ postId, userId });

      return res.status(201).json(like);
    } catch (error) {
      console.error("Erro ao curtir post:", error);

      const message =
        error instanceof Error ? error.message : "Erro ao curtir post";

      return res.status(400).json({ error: message });
    }
  }
}
