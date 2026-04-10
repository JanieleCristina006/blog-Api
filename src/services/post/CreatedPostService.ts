import fs from "node:fs/promises";
import cloudinary from "../../config/cloudinary.js";
import { prisma } from "../../database/db.js";
import { AppError } from "../../utils/AppError.js";

interface CreatedPostServiceProps {
  title: string;
  content: string;
  categoryId?: string;
  files?: Express.Multer.File[];
  userId: string;
}

type MulterFile = Express.Multer.File;

export class CreatedPostService {
  async uploadFile(files: MulterFile[], folder = "uploads") {
    const results = [];

    for (const file of files) {
      try {
        const resourceType = file.mimetype.startsWith("video/")
          ? "video"
          : "image";

        const result = await cloudinary.uploader.upload(file.path, {
          folder,
          resource_type: resourceType,
        });

        results.push({
          url: result.secure_url,
          public_id: result.public_id,
          type: result.resource_type,
        });
      } finally {
        await fs.unlink(file.path).catch(() => {});
      }
    }

    return results;
  }

  async execute({
    title,
    categoryId,
    content,
    files,
    userId,
  }: CreatedPostServiceProps) {
    const uploaded = files ? await this.uploadFile(files) : [];

    const mediaData = uploaded.map((item) => ({
      url: item.url,
      type: item.type,
      public_id: item.public_id,
    }));

    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!categoryExists) {
        throw new AppError("Categoria nao encontrada", 404);
      }
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        userId,
        ...(categoryId ? { categoryId } : {}),
        media: {
          create: mediaData,
        },
      },
      include: {
        media: true,
        category: true,
      },
    });

    return post;
  }
}
