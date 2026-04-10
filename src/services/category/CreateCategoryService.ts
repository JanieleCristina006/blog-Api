import { prisma } from "../../database/db.js";
import { AppError } from "../../utils/AppError.js";

interface CreateCategoryServiceProps {
  name: string;
}

export class CreateCategoryService {
  async execute({ name }: CreateCategoryServiceProps) {
    const normalizedName = name.trim();

    const categoryExists = await prisma.category.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: "insensitive",
        },
      },
    });

    if (categoryExists) {
      throw new AppError("Categoria ja cadastrada", 409);
    }

    return prisma.category.create({
      data: { name: normalizedName },
    });
  }
}
