import { prisma } from "../../database/db.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "node:fs/promises";

interface UpdatePostServiceProps {
  title?: string;
  content?: string;
  category?: string;
  files?: Express.Multer.File[];
  postId: string;
}

export class UpdatePostService {
  async execute({ title, content, category, files, postId }: UpdatePostServiceProps) {

    // 🔎 1. Buscar post com mídias
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { media: true }
    });

    if (!post) {
      throw new Error("Post não encontrado");
    }

    // 📦 2. Se veio nova mídia
    if (files && files.length > 0) {

      // 🗑️ 2.1 Deletar mídias antigas do Cloudinary
      for (const media of post.media) {
        if (media.public_id) {
          await cloudinary.uploader.destroy(media.public_id);
        }
      }

      // 🗑️ 2.2 Deletar mídias antigas do banco
      await prisma.media.deleteMany({
        where: { postId }
      });

      // ☁️ 2.3 Upload das novas mídias
      const uploaded = [];

      for (const file of files) {
        try {
          const resourceType = file.mimetype.startsWith("video/")
            ? "video"
            : "image";

          const result = await cloudinary.uploader.upload(file.path, {
            folder: "posts",
            resource_type: resourceType
          });

          uploaded.push({
            url: result.secure_url,
            public_id: result.public_id, 
            type: result.resource_type
          });

        } finally {
          await fs.unlink(file.path).catch(() => {});
        }
      }

      // 💾 2.4 Salvar novas mídias no banco
      await prisma.media.createMany({
        data: uploaded.map(file => ({
          url: file.url,
          type: file.type,
          public_id: file.public_id,
          postId
        }))
      });
    }

    // ✏️ 3. Atualizar dados do post
    const data: { title?: string; content?: string; category?: string } = {};

    if (title !== undefined) {
      data.title = title;
    }

    if (content !== undefined) {
      data.content = content;
    }

    if (category !== undefined) {
      data.category = category;
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data,
      include: {
        media: true
      }
    });

    return updatedPost;
  }
}
