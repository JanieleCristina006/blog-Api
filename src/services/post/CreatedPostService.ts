import { prisma } from "../../database/db.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "node:fs/promises";
import { upload } from "../../config/multer.js";


interface CreatedPostServiceProps {
  title: string,
  content: string,
  category?: string,
  files?: Express.Multer.File[],
  userId: string
}

type MulterFile = Express.Multer.File;

export class CreatedPostService {

  /**
   * Faz upload de múltiplos arquivos para o Cloudinary
   * e remove os arquivos locais após o envio
   */
  async uploadFile(files: MulterFile[], folder = "uploads") {

    // Array que vai armazenar os resultados do upload
    const results = []

    // Percorre cada arquivo enviado
    for (const file of files) {
      try {
        // Define o tipo do recurso baseado no mimetype
        // (Cloudinary precisa saber se é image ou video)
        const resourceType = file.mimetype.startsWith("video/")
          ? "video"
          : "image";

        // Faz upload do arquivo salvo localmente (file.path)
        const result = await cloudinary.uploader.upload(file.path, {
          folder, // pasta dentro do Cloudinary
          resource_type: resourceType,
        });

        // Armazena os dados importantes do upload
        results.push({
          url: result.secure_url,       // URL pública do arquivo
          publicId: result.public_id,  // ID no Cloudinary
          type: result.resource_type,  // image ou video
        });

      } finally {

        // 🔥 Remove o arquivo local SEMPRE (mesmo se der erro no upload)
        // Evita acumular arquivos na pasta "upload/"
       await fs.unlink(file.path).catch(() => {});
      }
    }

    // Retorna todos os uploads realizados
    return results
  }

  /**
   * Método principal para criar um post
   */
  async execute({ title, category, content, files, userId }: CreatedPostServiceProps & { userId: string }) {

  // 1. Faz upload (ou retorna array vazio)
  const uploaded = files ? await this.uploadFile(files) : [];

  // 2. Converte pro formato que o Prisma espera
  const mediaData = uploaded.map(item => ({
    url: item.url,
    type: item.type,
    // opcional (se você adicionar no schema depois)
    // publicId: item.publicId
  }));

  // 3. Cria o post já com as mídias vinculadas
  const post = await prisma.post.create({
    data: {
      title,
      category,
      content,
      userId, 

      media: {
        create: mediaData
      }
    }
  });

  return post;
}
}