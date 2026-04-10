import { prisma } from "../../database/db.js";
import { AppError } from "../../utils/AppError.js";

interface UpdateCategoryServiceProps {
  categoryId: string;
  name: string;
}

export class UpdateCategoryService {
  async execute({ categoryId, name }: UpdateCategoryServiceProps) {
    const normalizedName = name.trim();

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new AppError("Categoria nao encontrada", 404);
    }

    const categoryWithSameName = await prisma.category.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: "insensitive",
        },
        NOT: {
          id: categoryId,
        },
      },
    });

    if (categoryWithSameName) {
      throw new AppError("Ja existe uma categoria com esse nome", 409);
    }

    return prisma.category.update({
      where: { id: categoryId },
      data: { name: normalizedName },
    });
  }
}
