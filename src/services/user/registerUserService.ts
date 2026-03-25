import { prisma } from "../../database/db.js";
import bcrypt from "bcrypt";
import cloudinary from "../../config/cloudinary.js";
import fs from "node:fs";

interface RegisterServiceProps {
  name: string;
  email: string;
  password: string;
  role?: string;
  file?: Express.Multer.File;
}

class RegisterService {
  private async uploadImagem(file: Express.Multer.File) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "fotoPerfilUsuario",
      });

      return {
        url: result.secure_url,
        public_id: result.public_id,
      };
    } catch (error) {
      console.log(error)
      throw new Error("Erro ao fazer upload da imagem" );
    } finally {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }

  async execute({ name, email, password, role= "user", file }: RegisterServiceProps) {
    const hash = await bcrypt.hash(password, 10);

    let photoUrl = "";

    if (file) {
      const uploadedImage = await this.uploadImagem(file);
      photoUrl = uploadedImage.url;
    }

    const existEmail = await prisma.user.findUnique({
      where: {email}
    })

    if(existEmail){
      throw new Error("Email já cadastrado!")
    }

    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hash,
        role,
        photo_profile: photoUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt:true,
        photo_profile: true,
      },
    });


    return createdUser;
  }
}

export default RegisterService;