import { prisma } from "../../database/db.js";
import { AppError } from "../../utils/AppError.js";

interface CreateCommentServiceProps {
  content: string;
  postId: string;
  userId: string;
  parentId?: string;
}

export class CreateCommentService {
  async execute({
    content,
    postId,
    userId,
    parentId,
  }: CreateCommentServiceProps) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError("Post nao encontrado", 404);
    }

    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        throw new AppError("Comentario pai nao encontrado", 404);
      }

      if (parentComment.postId !== postId) {
        throw new AppError("O comentario pai nao pertence a este post", 400);
      }
    }

    return prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        userId,
        ...(parentId ? { parentId } : {}),
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
