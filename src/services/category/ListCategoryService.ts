import { prisma } from "../../database/db.js";

export class ListCategoryService {
  async execute() {
    return prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });
  }
}
