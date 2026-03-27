import { Request, Response } from "express";
import { UpdatePostService } from "../../services/post/UpdatePostService.js";

export class UpdatePostController {
  async handle(req: Request, res: Response) {
    const { title, content, category } = req.body;
    const postId = req.params.postId as string;
    const files = Array.isArray(req.files) ? req.files : undefined;

    try {
      const updatePostService = new UpdatePostService();

      const post = await updatePostService.execute({
        title,
        content,
        category,
        files,
        postId
      });

      return res.status(200).json(post);

    } catch (error) {
      console.error("Erro ao atualizar post:", error);

      const message =
        error instanceof Error ? error.message : "Erro ao atualizar post";

      return res.status(400).json({
        error: message
      });
    }
  }
}
