import cloudinary from "../../config/cloudinary.js";
import { prisma } from "../../database/db.js";
import { AppError } from "../../utils/AppError.js";

interface DeletePostServiceProps {
  postId: string;
}

export class DeletePostService {
  async execute({ postId }: DeletePostServiceProps) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { media: true },
    });

    if (!post) {
      throw new AppError("Post nao encontrado", 404);
    }

    for (const media of post.media) {
      if (media.public_id) {
        await cloudinary.uploader.destroy(media.public_id, {
          resource_type: media.type === "video" ? "video" : "image",
        });
      }
    }

    await prisma.$transaction([
      prisma.like.deleteMany({
        where: { postId },
      }),
      prisma.comment.deleteMany({
        where: { postId },
      }),
      prisma.media.deleteMany({
        where: { postId },
      }),
      prisma.post.delete({
        where: { id: postId },
      }),
    ]);

    return {
      message: "Post deletado com sucesso",
    };
  }
}
