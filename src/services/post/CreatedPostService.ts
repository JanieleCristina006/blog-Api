import { prisma } from "../../database/db.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "node:fs/promises";

interface CreatedPostServiceProps {
  title: string;
  content: string;
  category?: string;
  files?: Express.Multer.File[];
  userId: string;
}

type MulterFile = Express.Multer.File;

export class CreatedPostService {
  /**
   * Faz upload dos arquivos para o Cloudinary
   * e remove os arquivos locais após o upload
   */
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
          public_id: result.public_id, // 👈 importante pro delete depois
          type: result.resource_type,
        });
      } finally {
        await fs.unlink(file.path).catch(() => {});
      }
    }

    return results;
  }

  /**
   * Cria um post com múltiplas mídias
   */
  async execute({ title, category, content, files, userId }: CreatedPostServiceProps) {
    // 1. Upload das mídias (se existirem)
    const uploaded = files ? await this.uploadFile(files) : [];

    // 2. Formata para o Prisma
    const mediaData = uploaded.map((item) => ({
      url: item.url,
      type: item.type,
      public_id: item.public_id, // 👈 agora correto
    }));

    // 3. Cria o post + mídias
    const post = await prisma.post.create({
      data: {
        title,
        category,
        content,
        userId,

        media: {
          create: mediaData,
        },
      },
      include: {
        media: true, // 👈 já retorna as mídias junto
      },
    });

    return post;
  }
}