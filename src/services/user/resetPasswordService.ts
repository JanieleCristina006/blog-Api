import { prisma } from "../../database/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto"; 

interface ResetPasswordServiceProps{
    token: string,
    newPassword: string
}


class ResetPasswordService {
  async execute({ token, newPassword }: ResetPasswordServiceProps) {

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetToken = await prisma.passwordReset.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!resetToken) {
      throw new Error("Token inválido ou expirado");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId
        },
        data: {
          password: hashedPassword
        }
      }),
      prisma.passwordReset.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() }
      })
    ]);

    return "Senha redefinida com sucesso!";
  }
}
export default ResetPasswordService;
