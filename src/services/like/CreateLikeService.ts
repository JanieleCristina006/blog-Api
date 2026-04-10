import { prisma } from "../../database/db.js";
import { AppError } from "../../utils/AppError.js";

interface CreateLikeServiceProps {
  postId: string;
  userId: string;
}

export class CreateLikeService {
  async execute({ postId, userId }: CreateLikeServiceProps) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError("Post nao encontrado", 404);
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      throw new AppError("Voce ja curtiu este post", 409);
    }

    return prisma.like.create({
      data: {
        postId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            photo_profile: true,
          },
        },
      },
    });
  }
}
