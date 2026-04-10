import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../database/db.js";
import { AppError } from "../../utils/AppError.js";

interface LoginUserServiceProps {
  email: string;
  password: string;
}

class LoginUserService {
  async execute({ email, password }: LoginUserServiceProps) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new AppError("Credenciais invalidas", 401);
    }

    const senhaValida = await bcrypt.compare(password, user.password);

    if (!senhaValida) {
      throw new AppError("Credenciais invalidas", 401);
    }

    const token = jwt.sign(
      {
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        subject: user.id,
        expiresIn: "15d",
      }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo_profile: user.photo_profile,
      },
    };
  }
}

export default LoginUserService;
