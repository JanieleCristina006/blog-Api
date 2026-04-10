import { prisma } from "../../database/db.js";
import { AppError } from "../../utils/AppError.js";

interface DeleteCommentServiceProps {
  commentId: string;
}

export class DeleteCommentService {
  async execute({ commentId }: DeleteCommentServiceProps) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError("Comentario nao encontrado", 404);
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return {
      message: "Comentario deletado com sucesso",
    };
  }
}
