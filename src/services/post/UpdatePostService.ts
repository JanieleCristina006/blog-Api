import fs from "node:fs/promises";
import cloudinary from "../../config/cloudinary.js";
import { prisma } from "../../database/db.js";
import { AppError } from "../../utils/AppError.js";

interface UpdatePostServiceProps {
  title?: string;
  content?: string;
  categoryId?: string;
  files?: Express.Multer.File[];
  postId: string;
}

export class UpdatePostService {
  async execute({
    title,
    content,
    categoryId,
    files,
    postId,
  }: UpdatePostServiceProps) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { media: true },
    });

    if (!post) {
      throw new AppError("Post nao encontrado", 404);
    }

    if (files && files.length > 0) {
      for (const media of post.media) {
        if (media.public_id) {
          await cloudinary.uploader.destroy(media.public_id, {
            resource_type: media.type === "video" ? "video" : "image",
          });
        }
      }

      await prisma.media.deleteMany({
        where: { postId },
      });

      const uploaded = [];

      for (const file of files) {
        try {
          const resourceType = file.mimetype.startsWith("video/")
            ? "video"
            : "image";

          const result = await cloudinary.uploader.upload(file.path, {
            folder: "posts",
            resource_type: resourceType,
          });

          uploaded.push({
            url: result.secure_url,
            public_id: result.public_id,
            type: result.resource_type,
          });
        } finally {
          await fs.unlink(file.path).catch(() => {});
        }
      }

      await prisma.media.createMany({
        data: uploaded.map((file) => ({
          url: file.url,
          type: file.type,
          public_id: file.public_id,
          postId,
        })),
      });
    }

    const data: { title?: string; content?: string; categoryId?: string | null } = {};

    if (title !== undefined) {
      data.title = title.trim();
    }

    if (content !== undefined) {
      data.content = content.trim();
    }

    if (categoryId !== undefined) {
      if (categoryId === "") {
        data.categoryId = null;
      } else {
        const categoryExists = await prisma.category.findUnique({
          where: { id: categoryId },
        });

        if (!categoryExists) {
          throw new AppError("Categoria nao encontrada", 404);
        }

        data.categoryId = categoryId;
      }
    }

    return prisma.post.update({
      where: { id: postId },
      data,
      include: {
        media: true,
        category: true,
      },
    });
  }
}
