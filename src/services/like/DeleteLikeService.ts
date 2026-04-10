import { prisma } from "../../database/db.js";
import { AppError } from "../../utils/AppError.js";

interface DeleteLikeServiceProps {
  postId: string;
  userId: string;
}

export class DeleteLikeService {
  async execute({ postId, userId }: DeleteLikeServiceProps) {
    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!like) {
      throw new AppError("Curtida nao encontrada para este usuario neste post", 404);
    }

    await prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return {
      message: "Curtida removida com sucesso",
    };
  }
}
