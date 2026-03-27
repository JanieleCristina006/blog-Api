import { Request, Response } from "express";
import { DeletePostService } from "../../services/post/DeletePostService.js";

export class DeletePostController {
  async handle(req: Request, res: Response) {
    const postId = req.params.postId as string;

    try {
      const service = new DeletePostService();

      const result = await service.execute({ postId });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao deletar post:", error);

      const message =
        error instanceof Error ? error.message : "Erro ao deletar post";

      return res.status(400).json({ error: message });
    }
  }
}
