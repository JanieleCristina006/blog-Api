import { Request, Response } from "express";
import { ListCategoryService } from "../../services/category/ListCategoryService.js";

export class ListCategoryController {
  async handle(req: Request, res: Response) {
    try {
      const service = new ListCategoryService();
      const categories = await service.execute();

      return res.json(categories);
    } catch (error) {
      console.error("Erro ao listar categorias:", error);

      return res.status(500).json({
        error: "Erro ao listar categorias",
      });
    }
  }
}
