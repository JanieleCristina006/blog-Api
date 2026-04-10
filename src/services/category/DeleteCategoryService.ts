import { prisma } from "../../database/db.js";
import { AppError } from "../../utils/AppError.js";

interface DeleteCategoryServiceProps {
  categoryId: string;
}

export class DeleteCategoryService {
  async execute({ categoryId }: DeleteCategoryServiceProps) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new AppError("Categoria nao encontrada", 404);
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return {
      message: "Categoria deletada com sucesso",
    };
  }
}
