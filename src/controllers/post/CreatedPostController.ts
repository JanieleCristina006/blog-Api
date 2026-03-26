import { Request,Response } from "express";
import { CreatedPostService } from "../../services/post/CreatedPostService.js";

export class CreatedPostController{
   async handle(req: Request, res: Response) {
  const { title, category, content } = req.body;
  const files = req.files as Express.Multer.File[];

  try {
    const postService = new CreatedPostService();

    const userId = (req as any).user_id;

    const dados = await postService.execute({
      title,
      category,
      content,
      files,
      userId
    });

    return res.json(dados);

  } catch (error) {
    console.log(error);

    return res.status(400).json({
      error: "Falha ao fazer o upload!"
    });
  }
}
}

