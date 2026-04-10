import { prisma } from "../../database/db.js";

interface ListLikeServiceProps {
  postId: string;
}

export class ListLikeService {
  async execute({ postId }: ListLikeServiceProps) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error("Post não encontrado");
    }

    const likes = await prisma.like.findMany({
      where: { postId },
      orderBy: {
        id: "desc",
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

    return {
      total: likes.length,
      likes,
    };
  }
}
