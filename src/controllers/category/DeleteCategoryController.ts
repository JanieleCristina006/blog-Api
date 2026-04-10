import { Request, Response } from "express";
import { DeleteCategoryService } from "../../services/category/DeleteCategoryService.js";

export class DeleteCategoryController {
  async handle(req: Request, res: Response) {
    const categoryId = req.params.categoryId as string;

    try {
      const service = new DeleteCategoryService();
      const result = await service.execute({ categoryId });

      return res.json(result);
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);

      const message =
        error instanceof Error ? error.message : "Erro ao deletar categoria";

      return res.status(400).json({ error: message });
    }
  }
}
