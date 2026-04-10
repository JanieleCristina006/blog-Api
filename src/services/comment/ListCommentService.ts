import { prisma } from "../../database/db.js";
import { AppError } from "../../utils/AppError.js";

interface ListCommentServiceProps {
  postId: string;
}

export class ListCommentService {
  async execute({ postId }: ListCommentServiceProps) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError("Post nao encontrado", 404);
    }

    return prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            photo_profile: true,
          },
        },
        replies: {
          orderBy: {
            createdAt: "asc",
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
        },
      },
    });
  }
}
