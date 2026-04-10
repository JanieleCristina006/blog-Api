import { Request, Response } from "express";
import { UpdateCategoryService } from "../../services/category/UpdateCategoryService.js";

export class UpdateCategoryController {
  async handle(req: Request, res: Response) {
    const { name } = req.body;
    const categoryId = req.params.categoryId as string;

    try {
      const service = new UpdateCategoryService();
      const category = await service.execute({
        categoryId,
        name,
      });

      return res.json(category);
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);

      const message =
        error instanceof Error ? error.message : "Erro ao atualizar categoria";

      return res.status(400).json({ error: message });
    }
  }
}
