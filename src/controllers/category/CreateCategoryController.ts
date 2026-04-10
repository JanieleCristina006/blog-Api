import { Request, Response } from "express";
import { CreateCategoryService } from "../../services/category/CreateCategoryService.js";

export class CreateCategoryController {
  async handle(req: Request, res: Response) {
    const { name } = req.body;

    try {
      const service = new CreateCategoryService();
      const category = await service.execute({ name });

      return res.status(201).json(category);
    } catch (error) {
      console.error("Erro ao criar categoria:", error);

      const message =
        error instanceof Error ? error.message : "Erro ao criar categoria";

      return res.status(400).json({ error: message });
    }
  }
}
