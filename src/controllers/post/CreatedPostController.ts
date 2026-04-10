import { Request, Response } from "express";
import { CreatedPostService } from "../../services/post/CreatedPostService.js";

export class CreatedPostController {
  async handle(req: Request, res: Response) {
    const { title, categoryId, category, content } = req.body;
    const files = req.files as Express.Multer.File[];

    try {
      const postService = new CreatedPostService();

      const userId = (req as any).user_id;

      const dados = await postService.execute({
        title,
        categoryId: categoryId ?? category,
        content,
        files,
        userId,
      });

      return res.json(dados);
    } catch (error) {
      console.log(error);

      const message =
        error instanceof Error ? error.message : "Falha ao fazer o upload!";

      return res.status(400).json({
        error: message,
      });
    }
  }
}
