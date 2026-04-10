import { prisma } from "../../database/db.js";

export class ListPostService {
  async execute() {
    const posts = prisma.post.findMany({
      select: {
        media: true,
        title: true,
        content: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        id: true,
        likes: {
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        comments: {
          where: {
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
        },
      },
    });

    return posts;
  }
}
